import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PasswordService } from '../../identity/password.service';
import { PlatformAuditService } from './platform-audit.service';
import {
  CreatePlatformAdminRequest,
  UpdatePlatformAdminRequest,
  CreateSaaSPlanRequest,
} from '@solaros/contracts';
import { PlatformRole } from '@solaros/types';

@Injectable()
export class PlatformAdminManagementService {
  private readonly logger = new Logger(PlatformAdminManagementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly auditService: PlatformAuditService,
  ) {}

  async listAdministrators() {
    return await this.prisma.platformAdministrator.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAdministrator(
    dto: CreatePlatformAdminRequest,
    currentAdminId: string,
    currentAdminEmail: string,
  ) {
    const email = dto.email.toLowerCase().trim();

    // Check if user exists or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { platformAdministrator: true },
    });

    if (user && user.platformAdministrator) {
      throw new ConflictException(`User "${email}" is already a platform administrator.`);
    }

    if (!user) {
      const defaultHash = await this.passwordService.hashPassword('Admin123!Secure');
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          passwordHash: defaultHash,
          status: 'ACTIVE',
          isActive: true,
          isSuperAdmin: dto.role === PlatformRole.PLATFORM_OWNER,
        },
        include: { platformAdministrator: true },
      });
    }

    const admin = await this.prisma.platformAdministrator.create({
      data: {
        userId: user.id,
        role: dto.role || PlatformRole.PLATFORM_ADMIN,
        isActive: true,
        permissions: dto.permissions || [],
        notes: dto.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await this.auditService.logEvent({
      actorId: currentAdminId,
      actorEmail: currentAdminEmail,
      action: 'ADMINISTRATOR_CREATED',
      targetType: 'PLATFORM_ADMIN',
      targetId: admin.id,
      metadata: { newAdminEmail: email, role: admin.role },
    });

    return admin;
  }

  async updateAdministrator(
    adminId: string,
    dto: UpdatePlatformAdminRequest,
    currentAdminId: string,
    currentAdminEmail: string,
  ) {
    const admin = await this.prisma.platformAdministrator.findUnique({
      where: { id: adminId },
      include: { user: true },
    });

    if (!admin) {
      throw new NotFoundException(`Platform Administrator "${adminId}" not found.`);
    }

    const updated = await this.prisma.platformAdministrator.update({
      where: { id: adminId },
      data: {
        role: dto.role !== undefined ? dto.role : admin.role,
        permissions: dto.permissions !== undefined ? dto.permissions : admin.permissions,
        isActive: dto.isActive !== undefined ? dto.isActive : admin.isActive,
        notes: dto.notes !== undefined ? dto.notes : admin.notes,
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    await this.auditService.logEvent({
      actorId: currentAdminId,
      actorEmail: currentAdminEmail,
      action: 'ADMINISTRATOR_UPDATED',
      targetType: 'PLATFORM_ADMIN',
      targetId: adminId,
      metadata: { targetEmail: admin.user.email, role: updated.role, isActive: updated.isActive },
    });

    return updated;
  }

  // --- SaaS Plans Management ---

  async listSaaSPlans() {
    const plans = await this.prisma.saaSPlan.findMany({
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
      orderBy: { monthlyPrice: 'asc' },
    });

    // If no plans exist yet, seed the standard plans
    if (plans.length === 0) {
      return await this.seedDefaultPlans();
    }

    return plans;
  }

  async createSaaSPlan(
    dto: CreateSaaSPlanRequest,
    adminId: string,
    adminEmail: string,
  ) {
    const existing = await this.prisma.saaSPlan.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Plan with code "${dto.code}" already exists.`);
    }

    const plan = await this.prisma.saaSPlan.create({
      data: {
        code: dto.code.toUpperCase().trim(),
        name: dto.name.trim(),
        description: dto.description?.trim(),
        monthlyPrice: dto.monthlyPrice,
        annualPrice: dto.annualPrice,
        maxUsers: dto.maxUsers || 5,
        maxStorageMb: dto.maxStorageMb || 5120,
        maxProjects: dto.maxProjects || 50,
        features: dto.features || [],
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });

    await this.auditService.logEvent({
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'SAAS_PLAN_CREATED',
      targetType: 'SAAS_PLAN',
      targetId: plan.id,
      metadata: { planCode: plan.code, planName: plan.name },
    });

    return plan;
  }

  async updateSaaSPlan(
    planId: string,
    dto: Partial<CreateSaaSPlanRequest>,
    adminId: string,
    adminEmail: string,
  ) {
    const plan = await this.prisma.saaSPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException(`Plan with id "${planId}" not found.`);
    }

    const updated = await this.prisma.saaSPlan.update({
      where: { id: planId },
      data: {
        name: dto.name !== undefined ? dto.name.trim() : plan.name,
        description: dto.description !== undefined ? dto.description.trim() : plan.description,
        monthlyPrice: dto.monthlyPrice !== undefined ? dto.monthlyPrice : plan.monthlyPrice,
        annualPrice: dto.annualPrice !== undefined ? dto.annualPrice : plan.annualPrice,
        maxUsers: dto.maxUsers !== undefined ? dto.maxUsers : plan.maxUsers,
        maxStorageMb: dto.maxStorageMb !== undefined ? dto.maxStorageMb : plan.maxStorageMb,
        maxProjects: dto.maxProjects !== undefined ? dto.maxProjects : plan.maxProjects,
        features: dto.features !== undefined ? dto.features : plan.features,
        isActive: dto.isActive !== undefined ? dto.isActive : plan.isActive,
      },
    });

    await this.auditService.logEvent({
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'SAAS_PLAN_UPDATED',
      targetType: 'SAAS_PLAN',
      targetId: planId,
      metadata: { planCode: plan.code },
    });

    return updated;
  }

  private async seedDefaultPlans() {
    const starter = await this.prisma.saaSPlan.create({
      data: {
        code: 'STARTER',
        name: 'Starter Solar EPC',
        description: 'For small solar contractors starting up installations and surveys.',
        monthlyPrice: 4999,
        annualPrice: 49990,
        maxUsers: 5,
        maxStorageMb: 5120, // 5 GB
        maxProjects: 30,
        features: [
          'CRM & Customer 360',
          'Mobile Site Surveys',
          'Standard Engineering & BOM',
          'Quotations & GST Billing',
        ],
      },
    });

    const growth = await this.prisma.saaSPlan.create({
      data: {
        code: 'GROWTH',
        name: 'Growth Solar EPC',
        description: 'For growing solar EPC companies managing procurement, warehouses and teams.',
        monthlyPrice: 12999,
        annualPrice: 129990,
        maxUsers: 25,
        maxStorageMb: 25600, // 25 GB
        maxProjects: 150,
        features: [
          'All Starter Features',
          'Procurement & Vendor Comparison',
          'Inventory & Multi-Warehouse Tracking',
          'Dispatch & Delivery Challan',
          'Technician & Crew Scheduling',
          'Standard Priority Support',
        ],
      },
    });

    const enterprise = await this.prisma.saaSPlan.create({
      data: {
        code: 'ENTERPRISE',
        name: 'Enterprise Commercial Solar',
        description: 'Unlimited scale for high-volume commercial EPCs and distributed teams.',
        monthlyPrice: 29999,
        annualPrice: 299990,
        maxUsers: 100,
        maxStorageMb: 102400, // 100 GB
        maxProjects: 1000,
        features: [
          'All Growth Features',
          'Custom Workflows & Approval Gates',
          'Safety Checklists & Quality Assurance',
          'DISCOM Tracking & Net Metering',
          'Dedicated Customer Success & SLAs',
          'Audit Log Streaming & Data Export',
        ],
      },
    });

    return [starter, growth, enterprise];
  }
}
