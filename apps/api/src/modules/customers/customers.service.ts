import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenantContext, ICustomer360 } from '@solaros/types';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateCustomerContactDto,
  CreateCustomerAddressDto,
  CreateCustomerSiteDto,
  CustomerFilterQueryDto,
} from '@solaros/contracts';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async createCustomer(tenant: TenantContext, dto: CreateCustomerDto) {
    const orgId = tenant.organizationId;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const customerNumber = `CUST-${dateStr}-${randomSuffix}`;

    return this.prisma.forTenant(orgId, async (tx) => {
      return tx.customer.create({
        data: {
          organizationId: orgId,
          customerNumber,
          customerType: dto.customerType || 'INDIVIDUAL',
          name: dto.name,
          email: dto.email || null,
          phone: dto.phone,
          alternatePhone: dto.alternatePhone || null,
          taxId: dto.taxId || null,
          notes: dto.notes || null,
        },
      });
    });
  }

  async getCustomers(tenant: TenantContext, filter: CustomerFilterQueryDto) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: tenant.organizationId,
      deletedAt: null,
    };

    if (filter.customerType) where.customerType = filter.customerType;
    if (filter.status) where.status = filter.status;

    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { customerNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const [data, total] = await Promise.all([
        tx.customer.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            contacts: { where: { isPrimary: true }, take: 1 },
            sites: { take: 2 },
            _count: {
              select: { sites: true, surveys: true },
            },
          },
        }),
        tx.customer.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  async getCustomerById(tenant: TenantContext, id: string) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const customer = await tx.customer.findFirst({
        where: {
          id,
          organizationId: tenant.organizationId,
          deletedAt: null,
        },
        include: {
          contacts: { orderBy: { isPrimary: 'desc' } },
          addresses: { orderBy: { isPrimary: 'desc' } },
          sites: { orderBy: { createdAt: 'desc' } },
          surveys: { orderBy: { createdAt: 'desc' } },
          convertedLead: true,
        },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with id '${id}' not found`);
      }

      return customer;
    });
  }

  async getCustomer360(tenant: TenantContext, id: string): Promise<ICustomer360> {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const customer = await tx.customer.findFirst({
        where: {
          id,
          organizationId: tenant.organizationId,
          deletedAt: null,
        },
        include: {
          contacts: { orderBy: { isPrimary: 'desc' } },
          addresses: { orderBy: { isPrimary: 'desc' } },
          sites: { orderBy: { createdAt: 'desc' } },
          surveys: { orderBy: { createdAt: 'desc' } },
          convertedLead: true,
        },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with id '${id}' not found`);
      }

      // Build unified chronological activity timeline
      const timeline: Array<{
        id: string;
        type: string;
        timestamp: Date | string;
        summary: string;
        metadata?: Record<string, any>;
      }> = [];

      // 1. Customer created event
      timeline.push({
        id: `cust-created-${customer.id}`,
        type: 'CUSTOMER_CREATED',
        timestamp: customer.createdAt,
        summary: `Customer account created: ${customer.name} (${customer.customerNumber})`,
        metadata: { customerType: customer.customerType, status: customer.status },
      });

      // 2. Converted lead activities
      if (customer.convertedLead) {
        const leadActivities = await tx.leadActivity.findMany({
          where: { leadId: customer.convertedLead.id },
          orderBy: { createdAt: 'asc' },
        });

        for (const act of leadActivities) {
          timeline.push({
            id: `act-${act.id}`,
            type: act.type,
            timestamp: act.createdAt,
            summary: act.summary,
            metadata: { details: act.details },
          });
        }
      }

      // 3. Site additions
      for (const site of customer.sites) {
        timeline.push({
          id: `site-${site.id}`,
          type: 'SITE_REGISTERED',
          timestamp: site.createdAt,
          summary: `Site registered: ${site.siteName} (${site.roofType || 'Standard Roof'}, ${site.city})`,
          metadata: { siteId: site.id, sanctionedLoadKw: site.sanctionedLoadKw },
        });
      }

      // 4. Survey milestones
      for (const survey of customer.surveys) {
        timeline.push({
          id: `surv-${survey.id}`,
          type: 'SURVEY_EVENT',
          timestamp: survey.createdAt,
          summary: `Survey ${survey.surveyNumber}: Status is ${survey.status}`,
          metadata: { surveyId: survey.id, status: survey.status },
        });
      }

      // Sort timeline descending
      timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        ...customer,
        activityTimeline: timeline,
      } as any;
    });
  }

  async updateCustomer(tenant: TenantContext, id: string, dto: UpdateCustomerDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id, organizationId: tenant.organizationId, deletedAt: null },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with id '${id}' not found`);
      }

      return tx.customer.update({
        where: { id: customer.id },
        data: dto as any,
      });
    });
  }

  async addContact(tenant: TenantContext, customerId: string, dto: CreateCustomerContactDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: customerId, organizationId: tenant.organizationId, deletedAt: null },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with id '${customerId}' not found`);
      }

      if (dto.isPrimary) {
        await tx.customerContact.updateMany({
          where: { customerId: customer.id, organizationId: tenant.organizationId },
          data: { isPrimary: false },
        });
      }

      return tx.customerContact.create({
        data: {
          organizationId: tenant.organizationId,
          customerId: customer.id,
          name: dto.name,
          designation: dto.designation || null,
          email: dto.email || null,
          phone: dto.phone,
          isPrimary: dto.isPrimary ?? false,
        },
      });
    });
  }

  async addAddress(tenant: TenantContext, customerId: string, dto: CreateCustomerAddressDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: customerId, organizationId: tenant.organizationId, deletedAt: null },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with id '${customerId}' not found`);
      }

      if (dto.isPrimary) {
        await tx.customerAddress.updateMany({
          where: { customerId: customer.id, organizationId: tenant.organizationId },
          data: { isPrimary: false },
        });
      }

      return tx.customerAddress.create({
        data: {
          organizationId: tenant.organizationId,
          customerId: customer.id,
          type: dto.type || 'BILLING',
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2 || null,
          landmark: dto.landmark || null,
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode,
          country: dto.country || 'India',
          latitude: dto.latitude !== undefined ? dto.latitude : null,
          longitude: dto.longitude !== undefined ? dto.longitude : null,
          isPrimary: dto.isPrimary ?? false,
        },
      });
    });
  }

  async addSite(tenant: TenantContext, customerId: string, dto: CreateCustomerSiteDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: customerId, organizationId: tenant.organizationId, deletedAt: null },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with id '${customerId}' not found`);
      }

      return tx.customerSite.create({
        data: {
          organizationId: tenant.organizationId,
          customerId: customer.id,
          siteName: dto.siteName,
          addressLine1: dto.addressLine1,
          addressLine2: dto.addressLine2 || null,
          landmark: dto.landmark || null,
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode,
          latitude: dto.latitude !== undefined ? dto.latitude : null,
          longitude: dto.longitude !== undefined ? dto.longitude : null,
          electricityConnectionNumber: dto.electricityConnectionNumber || null,
          sanctionedLoadKw: dto.sanctionedLoadKw !== undefined ? dto.sanctionedLoadKw : null,
          tariffCategory: dto.tariffCategory || null,
          discomName: dto.discomName || null,
          transformerCapacityKva: dto.transformerCapacityKva !== undefined ? dto.transformerCapacityKva : null,
          meterNumber: dto.meterNumber || null,
          averageMonthlyUnits: dto.averageMonthlyUnits !== undefined ? dto.averageMonthlyUnits : null,
          roofAreaSqFt: dto.roofAreaSqFt !== undefined ? dto.roofAreaSqFt : null,
          roofType: dto.roofType || null,
          buildingHeightFloors: dto.buildingHeightFloors || 1,
          shadowFreeAreaSqFt: dto.shadowFreeAreaSqFt !== undefined ? dto.shadowFreeAreaSqFt : null,
          notes: dto.notes || null,
          status: 'ACTIVE',
        },
      });
    });
  }

  async getSites(tenant: TenantContext, customerId: string) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: customerId, organizationId: tenant.organizationId, deletedAt: null },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with id '${customerId}' not found`);
      }

      return tx.customerSite.findMany({
        where: {
          customerId,
          organizationId: tenant.organizationId,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }
}
