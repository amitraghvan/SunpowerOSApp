import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenantContext } from '@solaros/types';
import {
  CreateLeadDto,
  UpdateLeadDto,
  ChangeLeadStatusDto,
  CreateLeadActivityDto,
  ConvertLeadDto,
  LeadFilterQueryDto,
} from '@solaros/contracts';
import { LeadStatus } from '@solaros/types';

// Valid status transitions state machine
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  [LeadStatus.NEW]: [LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.LOST],
  [LeadStatus.CONTACTED]: [LeadStatus.QUALIFIED, LeadStatus.SURVEY_PENDING, LeadStatus.LOST],
  [LeadStatus.QUALIFIED]: [LeadStatus.SURVEY_PENDING, LeadStatus.PROPOSAL_PENDING, LeadStatus.LOST],
  [LeadStatus.SURVEY_PENDING]: [LeadStatus.PROPOSAL_PENDING, LeadStatus.QUALIFIED, LeadStatus.LOST],
  [LeadStatus.PROPOSAL_PENDING]: [LeadStatus.NEGOTIATION, LeadStatus.WON, LeadStatus.LOST],
  [LeadStatus.NEGOTIATION]: [LeadStatus.WON, LeadStatus.LOST, LeadStatus.PROPOSAL_PENDING],
  [LeadStatus.LOST]: [LeadStatus.NEW], // Reopening a lost lead
  [LeadStatus.WON]: [], // Terminal state
};

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateLeadScore(data: {
    monthlyBill?: number | null;
    roofArea?: number | null;
    capacity?: number | null;
    source?: string;
  }): number {
    let score = 40; // Base score
    if (data.monthlyBill && data.monthlyBill > 5000) score += 20;
    else if (data.monthlyBill && data.monthlyBill > 2500) score += 10;

    if (data.roofArea && data.roofArea > 500) score += 15;
    else if (data.roofArea && data.roofArea > 200) score += 10;

    if (data.capacity && data.capacity >= 3) score += 15;

    if (data.source === 'REFERRAL') score += 10;
    else if (data.source === 'WEBSITE') score += 5;

    return Math.min(score, 100);
  }

  async checkDuplicate(
    tenant: TenantContext,
    phone: string,
    email?: string
  ): Promise<{ isDuplicate: boolean; matchingField?: 'phone' | 'email'; existingLeadId?: string; existingLeadNumber?: string }> {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const existingByPhone = await tx.lead.findFirst({
        where: {
          organizationId: tenant.organizationId,
          phone,
          deletedAt: null,
        },
      });

      if (existingByPhone) {
        return {
          isDuplicate: true,
          matchingField: 'phone',
          existingLeadId: existingByPhone.id,
          existingLeadNumber: existingByPhone.leadNumber,
        };
      }

      if (email) {
        const existingByEmail = await tx.lead.findFirst({
          where: {
            organizationId: tenant.organizationId,
            email,
            deletedAt: null,
          },
        });

        if (existingByEmail) {
          return {
            isDuplicate: true,
            matchingField: 'email',
            existingLeadId: existingByEmail.id,
            existingLeadNumber: existingByEmail.leadNumber,
          };
        }
      }

      return { isDuplicate: false };
    });
  }

  async createLead(tenant: TenantContext, dto: CreateLeadDto) {
    const orgId = tenant.organizationId;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const leadNumber = `LEAD-${dateStr}-${randomSuffix}`;

    const score = this.calculateLeadScore({
      monthlyBill: dto.estimatedMonthlyBill,
      roofArea: dto.estimatedRoofAreaSqFt,
      capacity: dto.estimatedCapacityKw,
      source: dto.source,
    });

    return this.prisma.forTenant(orgId, async (tx) => {
      const lead = await tx.lead.create({
        data: {
          organizationId: orgId,
          branchId: dto.branchId || tenant.branchId || null,
          leadNumber,
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email || null,
          phone: dto.phone,
          alternatePhone: dto.alternatePhone || null,
          address: dto.address || null,
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode || null,
          source: dto.source || 'WEBSITE',
          status: LeadStatus.NEW,
          systemType: dto.systemType || 'ON_GRID',
          estimatedMonthlyBill: dto.estimatedMonthlyBill !== undefined ? dto.estimatedMonthlyBill : null,
          estimatedRoofAreaSqFt: dto.estimatedRoofAreaSqFt !== undefined ? dto.estimatedRoofAreaSqFt : null,
          estimatedCapacityKw: dto.estimatedCapacityKw !== undefined ? dto.estimatedCapacityKw : null,
          budget: dto.budget !== undefined ? dto.budget : null,
          score,
          notes: dto.notes || null,
          assignedToId: dto.assignedToId || null,
        },
      });

      // Record initial status history
      await tx.leadStatusHistory.create({
        data: {
          organizationId: orgId,
          leadId: lead.id,
          fromStatus: 'INITIAL',
          toStatus: LeadStatus.NEW,
          changedById: tenant.userId !== 'anonymous' ? tenant.userId : null,
          reason: 'Lead created',
        },
      });

      // Create activity record
      await tx.leadActivity.create({
        data: {
          organizationId: orgId,
          leadId: lead.id,
          userId: tenant.userId !== 'anonymous' ? tenant.userId : null,
          type: 'NOTE',
          summary: 'Lead created in system',
          details: `Source: ${lead.source}, System: ${lead.systemType}, Estimated Capacity: ${dto.estimatedCapacityKw || 'N/A'} kW`,
        },
      });

      return lead;
    });
  }

  async getLeads(tenant: TenantContext, filter: LeadFilterQueryDto) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: tenant.organizationId,
      deletedAt: null,
    };

    if (filter.status) where.status = filter.status;
    if (filter.source) where.source = filter.source;
    if (filter.assignedToId) where.assignedToId = filter.assignedToId;
    if (filter.branchId) where.branchId = filter.branchId;
    if (filter.systemType) where.systemType = filter.systemType;

    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { leadNumber: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const [data, total] = await Promise.all([
        tx.lead.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTo: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
            branch: {
              select: { id: true, name: true, code: true },
            },
          },
        }),
        tx.lead.count({ where }),
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

  async getLeadById(tenant: TenantContext, id: string) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const lead = await tx.lead.findFirst({
        where: {
          id,
          organizationId: tenant.organizationId,
          deletedAt: null,
        },
        include: {
          assignedTo: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          branch: {
            select: { id: true, name: true, code: true },
          },
          activities: {
            orderBy: { createdAt: 'desc' },
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
          surveys: true,
        },
      });

      if (!lead) {
        throw new NotFoundException(`Lead with id '${id}' not found`);
      }

      return lead;
    });
  }

  async updateLead(tenant: TenantContext, id: string, dto: UpdateLeadDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const existing = await tx.lead.findFirst({
        where: { id, organizationId: tenant.organizationId, deletedAt: null },
      });

      if (!existing) {
        throw new NotFoundException(`Lead with id '${id}' not found`);
      }

      const updateData: any = { ...dto };
      if (dto.estimatedMonthlyBill !== undefined || dto.estimatedRoofAreaSqFt !== undefined || dto.estimatedCapacityKw !== undefined) {
        updateData.score = this.calculateLeadScore({
          monthlyBill: dto.estimatedMonthlyBill !== undefined ? dto.estimatedMonthlyBill : Number(existing.estimatedMonthlyBill),
          roofArea: dto.estimatedRoofAreaSqFt !== undefined ? dto.estimatedRoofAreaSqFt : Number(existing.estimatedRoofAreaSqFt),
          capacity: dto.estimatedCapacityKw !== undefined ? dto.estimatedCapacityKw : Number(existing.estimatedCapacityKw),
          source: dto.source || existing.source,
        });
      }

      return tx.lead.update({
        where: { id: existing.id },
        data: updateData,
      });
    });
  }

  async changeLeadStatus(tenant: TenantContext, id: string, dto: ChangeLeadStatusDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const lead = await tx.lead.findFirst({
        where: { id, organizationId: tenant.organizationId, deletedAt: null },
      });

      if (!lead) {
        throw new NotFoundException(`Lead with id '${id}' not found`);
      }

      const currentStatus = lead.status;
      const targetStatus = dto.status;

      if (currentStatus === targetStatus) {
        return lead;
      }

      const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
      if (!allowed.includes(targetStatus)) {
        throw new BadRequestException(
          `Invalid status transition from '${currentStatus}' to '${targetStatus}'. Allowed: [${allowed.join(', ')}]`
        );
      }

      const updatedLead = await tx.lead.update({
        where: { id: lead.id },
        data: {
          status: targetStatus,
          lostReason: targetStatus === LeadStatus.LOST ? dto.reason || 'Not specified' : lead.lostReason,
        },
      });

      // Record status history
      await tx.leadStatusHistory.create({
        data: {
          organizationId: tenant.organizationId,
          leadId: lead.id,
          fromStatus: currentStatus,
          toStatus: targetStatus,
          changedById: tenant.userId !== 'anonymous' ? tenant.userId : null,
          reason: dto.reason || `Status changed to ${targetStatus}`,
        },
      });

      // Record activity
      await tx.leadActivity.create({
        data: {
          organizationId: tenant.organizationId,
          leadId: lead.id,
          userId: tenant.userId !== 'anonymous' ? tenant.userId : null,
          type: 'STATUS_CHANGE',
          summary: `Status updated: ${currentStatus} -> ${targetStatus}`,
          details: dto.reason || null,
        },
      });

      return updatedLead;
    });
  }

  async addActivity(tenant: TenantContext, leadId: string, dto: CreateLeadActivityDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const lead = await tx.lead.findFirst({
        where: { id: leadId, organizationId: tenant.organizationId, deletedAt: null },
      });

      if (!lead) {
        throw new NotFoundException(`Lead with id '${leadId}' not found`);
      }

      return tx.leadActivity.create({
        data: {
          organizationId: tenant.organizationId,
          leadId: lead.id,
          userId: tenant.userId !== 'anonymous' ? tenant.userId : null,
          type: dto.type,
          summary: dto.summary,
          details: dto.details || null,
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
          completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
        },
      });
    });
  }

  async convertLead(tenant: TenantContext, leadId: string, dto: ConvertLeadDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const lead = await tx.lead.findFirst({
        where: { id: leadId, organizationId: tenant.organizationId, deletedAt: null },
      });

      if (!lead) {
        throw new NotFoundException(`Lead with id '${leadId}' not found`);
      }

      if (lead.convertedCustomerId) {
        throw new ConflictException(`Lead is already converted to customer ID: ${lead.convertedCustomerId}`);
      }

      const orgId = tenant.organizationId;
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const customerNumber = `CUST-${dateStr}-${randomSuffix}`;
      const fullName = `${lead.firstName} ${lead.lastName}`.trim();

      // 1. Create Customer
      const customer = await tx.customer.create({
        data: {
          organizationId: orgId,
          customerNumber,
          customerType: dto.customerType || 'INDIVIDUAL',
          name: fullName,
          email: lead.email,
          phone: lead.phone,
          alternatePhone: lead.alternatePhone,
          taxId: dto.taxId || null,
          notes: `Converted from Lead ${lead.leadNumber}. ${lead.notes || ''}`.trim(),
        },
      });

      // 2. Create primary contact
      const contact = await tx.customerContact.create({
        data: {
          organizationId: orgId,
          customerId: customer.id,
          name: fullName,
          designation: 'Primary',
          email: lead.email,
          phone: lead.phone,
          isPrimary: true,
        },
      });

      // 3. Create initial address
      const address = await tx.customerAddress.create({
        data: {
          organizationId: orgId,
          customerId: customer.id,
          type: 'BILLING',
          addressLine1: lead.address || `${lead.city}, ${lead.state}`,
          city: lead.city,
          state: lead.state,
          postalCode: lead.postalCode || '000000',
          country: 'India',
          isPrimary: true,
        },
      });

      // 4. Create primary installation site
      const site = await tx.customerSite.create({
        data: {
          organizationId: orgId,
          customerId: customer.id,
          siteName: dto.siteName || `${fullName} - Main Site`,
          addressLine1: lead.address || `${lead.city}, ${lead.state}`,
          city: lead.city,
          state: lead.state,
          postalCode: lead.postalCode || '000000',
          roofType: dto.roofType || 'RCC_FLAT',
          roofAreaSqFt: lead.estimatedRoofAreaSqFt,
          sanctionedLoadKw: dto.sanctionedLoadKw !== undefined ? dto.sanctionedLoadKw : lead.estimatedCapacityKw,
          electricityConnectionNumber: dto.electricityConnectionNumber || null,
          status: 'ACTIVE',
        },
      });

      // 5. Update Lead with customer relation and set WON status
      await tx.lead.update({
        where: { id: lead.id },
        data: {
          convertedCustomerId: customer.id,
          status: LeadStatus.WON,
        },
      });

      // 6. Record status history
      await tx.leadStatusHistory.create({
        data: {
          organizationId: orgId,
          leadId: lead.id,
          fromStatus: lead.status,
          toStatus: LeadStatus.WON,
          changedById: tenant.userId !== 'anonymous' ? tenant.userId : null,
          reason: `Converted to Customer ${customerNumber}`,
        },
      });

      // 7. Record activity
      await tx.leadActivity.create({
        data: {
          organizationId: orgId,
          leadId: lead.id,
          userId: tenant.userId !== 'anonymous' ? tenant.userId : null,
          type: 'NOTE',
          summary: `Lead successfully converted to Customer ${customerNumber}`,
          details: `Customer ID: ${customer.id}, Site ID: ${site.id}`,
        },
      });

      return {
        success: true,
        customerId: customer.id,
        customerNumber: customer.customerNumber,
        contactId: contact.id,
        siteId: site.id,
        leadId: lead.id,
      };
    });
  }
}
