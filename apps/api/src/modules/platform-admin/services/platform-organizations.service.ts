import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PlatformAuditService } from './platform-audit.service';
import {
  ListPlatformOrganizationsQuery,
  SuspendOrganizationRequest,
  UpdateOrganizationSubscriptionRequest,
} from '@solaros/contracts';

@Injectable()
export class PlatformOrganizationsService {
  private readonly logger = new Logger(PlatformOrganizationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: PlatformAuditService,
  ) {}

  async listOrganizations(query: ListPlatformOrganizationsQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        { legalName: { contains: term, mode: 'insensitive' } },
        { taxIdentifier: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (query.planId) {
      where.subscription = { planId: query.planId };
    }

    const [items, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
          _count: {
            select: {
              memberships: true,
              branches: true,
              customers: true,
              leads: true,
              supportTickets: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrganizationDetail(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
        branches: {
          orderBy: { createdAt: 'asc' },
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                status: true,
                lastLoginAt: true,
              },
            },
            branch: {
              select: { id: true, name: true, code: true },
            },
            roles: {
              include: { role: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        supportTickets: {
          include: {
            submittedBy: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        _count: {
          select: {
            memberships: true,
            branches: true,
            customers: true,
            leads: true,
            quotations: true,
            contracts: true,
            salesOrders: true,
            supportTickets: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with id "${orgId}" not found.`);
    }

    // Aggregate storage consumption
    const [supplierDocs, handoverDocs, auditHistory] = await Promise.all([
      this.prisma.supplierDocument.aggregate({
        where: { organizationId: orgId },
        _sum: { fileSizeBytes: true },
      }),
      this.prisma.handoverDocument.aggregate({
        where: { organizationId: orgId },
        _sum: { fileSize: true },
      }),
      this.prisma.platformAuditEvent.findMany({
        where: {
          targetType: 'ORGANIZATION',
          targetId: orgId,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const totalStorageBytes =
      Number(supplierDocs._sum?.fileSizeBytes || 0) + Number(handoverDocs._sum?.fileSize || 0);

    return {
      organization: org,
      storage: {
        totalBytes: totalStorageBytes,
        totalMb: Math.round(totalStorageBytes / (1024 * 1024)),
      },
      auditHistory,
    };
  }

  async suspendOrganization(
    orgId: string,
    dto: SuspendOrganizationRequest,
    adminId: string,
    adminEmail: string,
  ) {
    if (!dto.reason || dto.reason.trim().length < 5) {
      throw new BadRequestException('A descriptive suspension reason of at least 5 characters is required.');
    }

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException(`Organization "${orgId}" not found.`);
    }

    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        status: 'SUSPENDED',
        isActive: false,
        suspensionReason: dto.reason.trim(),
        suspendedAt: new Date(),
        suspendedById: adminId,
      },
    });

    // Revoke all active sessions belonging to users in this organization
    await this.prisma.session.deleteMany({
      where: { organizationId: orgId },
    });

    await this.auditService.logEvent({
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'ORG_SUSPENDED',
      targetType: 'ORGANIZATION',
      targetId: orgId,
      reason: dto.reason.trim(),
      metadata: { previousStatus: org.status },
    });

    return updated;
  }

  async reactivateOrganization(
    orgId: string,
    adminId: string,
    adminEmail: string,
    notes?: string,
  ) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException(`Organization "${orgId}" not found.`);
    }

    const updated = await this.prisma.organization.update({
      where: { id: orgId },
      data: {
        status: 'ACTIVE',
        isActive: true,
        suspensionReason: null,
        suspendedAt: null,
        suspendedById: null,
      },
    });

    await this.auditService.logEvent({
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'ORG_REACTIVATED',
      targetType: 'ORGANIZATION',
      targetId: orgId,
      reason: notes || 'Administrative reactivation',
      metadata: { previousStatus: org.status },
    });

    return updated;
  }

  async updateOrganizationSubscription(
    orgId: string,
    dto: UpdateOrganizationSubscriptionRequest,
    adminId: string,
    adminEmail: string,
  ) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException(`Organization "${orgId}" not found.`);
    }

    const plan = await this.prisma.saaSPlan.findUnique({ where: { id: dto.planId } });
    if (!plan) {
      throw new NotFoundException(`SaaS Plan "${dto.planId}" not found.`);
    }

    const subscription = await this.prisma.organizationSubscription.upsert({
      where: { organizationId: orgId },
      create: {
        organizationId: orgId,
        planId: plan.id,
        status: 'ACTIVE',
        startDate: new Date(),
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        seatLimit: dto.seatLimit || plan.maxUsers,
        storageLimitMb: dto.storageLimitMb || plan.maxStorageMb,
      },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        seatLimit: dto.seatLimit || plan.maxUsers,
        storageLimitMb: dto.storageLimitMb || plan.maxStorageMb,
      },
      include: { plan: true },
    });

    await this.auditService.logEvent({
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'ORG_SUBSCRIPTION_UPDATED',
      targetType: 'ORGANIZATION',
      targetId: orgId,
      metadata: { planCode: plan.code, planName: plan.name },
    });

    return subscription;
  }

  async listUsers(query: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { email: { contains: term, mode: 'insensitive' } },
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          status: true,
          isActive: true,
          isSuperAdmin: true,
          lastLoginAt: true,
          createdAt: true,
          memberships: {
            where: { isActive: true, deletedAt: null },
            select: {
              organization: { select: { id: true, name: true, slug: true } },
              branch: { select: { id: true, name: true } },
              roles: { select: { role: { select: { code: true, name: true } } } },
            },
          },
          platformAdministrator: {
            select: { id: true, role: true, isActive: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
