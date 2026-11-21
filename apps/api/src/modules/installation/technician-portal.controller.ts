import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { TechnicianCrewService } from './technician-crew.service';
import { WorkOrderService } from './work-order.service';
import { MaterialHandoverService } from './material-handover.service';
import { SafetyQualityService } from './safety-quality.service';
import { CommissioningService } from './commissioning.service';
import { PrismaService } from '../../database/prisma.service';

import {
  UpdateTaskStatusDto,
  VerifyMaterialHandoverLineDto,
  CreateSafetyRecordDto,
  CreateCommissioningRecordDto,
} from '@solaros/contracts';

@Controller('technician')
@UseGuards(AuthenticationGuard, TenantContextGuard)
export class TechnicianPortalController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly technicianCrewService: TechnicianCrewService,
    private readonly workOrderService: WorkOrderService,
    private readonly materialHandoverService: MaterialHandoverService,
    private readonly safetyQualityService: SafetyQualityService,
    private readonly commissioningService: CommissioningService,
  ) {}

  /**
   * Retrieves current logged in technician profile
   */
  @Get('my-profile')
  async getMyProfile(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      return await tx.technicianProfile.findFirst({
        where: { userId, organizationId },
        include: {
          skills: true,
          certifications: true,
          crewMemberships: {
            where: { isActive: true },
            include: { crew: true },
          },
        },
      });
    });
  }

  /**
   * Retrieves assignments for the current technician (schedules, work orders)
   */
  @Get('my-assignments')
  async getMyAssignments(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const tech = await tx.technicianProfile.findFirst({
        where: { userId, organizationId },
        include: { crewMemberships: { where: { isActive: true } } },
      });

      const crewIds = tech?.crewMemberships.map((c) => c.crewId) || [];

      const [schedules, workOrders] = await Promise.all([
        tx.installationSchedule.findMany({
          where: {
            organizationId,
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
            OR: [
              ...(crewIds.length > 0 ? [{ crewId: { in: crewIds } }] : []),
              { createdById: userId },
            ],
          },
          include: {
            projectInitiation: {
              select: {
                id: true,
                projectCode: true,
                projectName: true,
                systemCapacityKw: true,
                site: { select: { addressLine1: true, city: true, state: true } },
              },
            },
          },
          orderBy: { scheduledDate: 'asc' },
        }),
        tx.installationWorkOrder.findMany({
          where: {
            organizationId,
            status: { in: ['ASSIGNED', 'READY_FOR_EXECUTION', 'IN_PROGRESS'] },
            OR: [
              ...(crewIds.length > 0 ? [{ crewId: { in: crewIds } }] : []),
              { supervisorId: userId },
              { assignedTechnicians: { some: { technicianProfileId: tech?.id } } },
            ],
          },
          include: {
            projectInitiation: {
              select: {
                id: true,
                projectCode: true,
                projectName: true,
                site: { select: { addressLine1: true, city: true } },
              },
            },
            tasks: { orderBy: { sequenceOrder: 'asc' } },
          },
          orderBy: { plannedStartDate: 'asc' },
        }),
      ]);

      return {
        technician: tech,
        schedules,
        workOrders,
      };
    });
  }

  /**
   * Completes a task from mobile device with actual hours and photos
   */
  @Patch('tasks/:id/complete')
  async completeTask(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return await this.workOrderService.updateTaskStatus(organizationId, id, { ...dto, status: 'COMPLETED' }, userId);
  }

  /**
   * Verifies serial on site from mobile scanner
   */
  @Patch('material-handover/:id/verify-line')
  async verifyLine(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: VerifyMaterialHandoverLineDto,
  ) {
    return await this.materialHandoverService.verifyHandoverLine(organizationId, id, dto);
  }

  /**
   * Submits daily pre-work safety review from field
   */
  @Post('safety-review')
  async submitSafetyReview(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSafetyRecordDto,
  ) {
    return await this.safetyQualityService.createSafetyRecord(organizationId, dto, userId);
  }

  /**
   * Submits field commissioning test measurements
   */
  @Post('commissioning')
  async submitCommissioning(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommissioningRecordDto,
  ) {
    return await this.commissioningService.createCommissioningRecord(organizationId, dto, userId);
  }
}
