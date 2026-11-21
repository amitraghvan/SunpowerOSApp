import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateInstallationScheduleDto,
  UpdateInstallationScheduleDto,
  RescheduleVisitDto,
} from '@solaros/contracts';

@Injectable()
export class InstallationSchedulingService {
  private readonly logger = new Logger(InstallationSchedulingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * Checks whether a crew has conflicting schedules on overlapping dates
   */
  async checkCrewConflict(
    organizationId: string,
    crewId: string,
    scheduledDate: Date,
    endDate?: Date,
    excludeScheduleId?: string,
  ): Promise<boolean> {
    const end = endDate || scheduledDate;

    const conflicts = await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = {
        organizationId,
        crewId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        scheduledDate: {
          lte: end,
        },
      };

      if (excludeScheduleId) {
        where.id = { not: excludeScheduleId };
      }

      const existing = await tx.installationSchedule.findMany({
        where,
      });

      return existing.some((s) => {
        const sEnd = s.endDate || s.scheduledDate;
        return sEnd >= scheduledDate && s.scheduledDate <= end;
      });
    });

    return conflicts;
  }

  /**
   * Schedules a new site execution visit
   */
  async createSchedule(organizationId: string, dto: CreateInstallationScheduleDto, userId?: string) {
    const scheduledDate = new Date(dto.scheduledDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      if (dto.crewId) {
        const hasConflict = await this.checkCrewConflict(organizationId, dto.crewId, scheduledDate, endDate);
        if (hasConflict) {
          this.logger.warn(`Schedule conflict detected for crew ${dto.crewId} on ${scheduledDate.toISOString()}`);
        }
      }

      const scheduleCode = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'SCHEDULE',
        'SCH',
      );

      const schedule = await tx.installationSchedule.create({
        data: {
          organizationId,
          scheduleCode,
          projectInitiationId: dto.projectInitiationId,
          crewId: dto.crewId || project.assignedCrewId || null,
          visitType: dto.visitType || 'PRE_INSTALLATION',
          scheduledDate,
          endDate,
          startTime: dto.startTime,
          endTime: dto.endTime,
          notes: dto.notes,
          createdById: userId || null,
        },
        include: {
          crew: true,
          projectInitiation: {
            select: { id: true, projectCode: true, projectName: true },
          },
        },
      });

      this.logger.log(`Created schedule ${scheduleCode} for project ${project.projectCode}`);
      return schedule;
    });
  }

  /**
   * Lists installation schedules with filtering
   */
  async listSchedules(
    organizationId: string,
    query?: {
      projectId?: string;
      crewId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };

      if (query?.projectId) where.projectInitiationId = query.projectId;
      if (query?.crewId) where.crewId = query.crewId;
      if (query?.status) where.status = query.status;

      if (query?.startDate || query?.endDate) {
        where.scheduledDate = {};
        if (query.startDate) where.scheduledDate.gte = new Date(query.startDate);
        if (query.endDate) where.scheduledDate.lte = new Date(query.endDate);
      }

      return await tx.installationSchedule.findMany({
        where,
        include: {
          crew: true,
          projectInitiation: {
            select: {
              id: true,
              projectCode: true,
              projectName: true,
              systemCapacityKw: true,
              site: {
                select: { id: true, siteName: true, addressLine1: true, city: true, state: true },
              },
            },
          },
        },
        orderBy: { scheduledDate: 'asc' },
      });
    });
  }

  /**
   * Reschedules an existing visit with formal change reason
   */
  async rescheduleVisit(organizationId: string, scheduleId: string, dto: RescheduleVisitDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const schedule = await tx.installationSchedule.findFirst({
        where: { id: scheduleId, organizationId },
      });
      if (!schedule) {
        throw new NotFoundException(`Schedule ${scheduleId} not found`);
      }

      const newDate = new Date(dto.scheduledDate);
      const newEndDate = dto.endDate ? new Date(dto.endDate) : undefined;

      if (schedule.crewId) {
        const hasConflict = await this.checkCrewConflict(
          organizationId,
          schedule.crewId,
          newDate,
          newEndDate,
          scheduleId,
        );
        if (hasConflict) {
          this.logger.warn(`Reschedule conflict detected for crew ${schedule.crewId}`);
        }
      }

      return await tx.installationSchedule.update({
        where: { id: scheduleId },
        data: {
          scheduledDate: newDate,
          endDate: newEndDate,
          startTime: dto.startTime ?? schedule.startTime,
          endTime: dto.endTime ?? schedule.endTime,
          status: 'RESCHEDULED',
          rescheduleReason: dto.rescheduleReason,
        },
      });
    });
  }

  /**
   * Updates visit status (IN_PROGRESS, COMPLETED, CANCELLED)
   */
  async updateScheduleStatus(
    organizationId: string,
    scheduleId: string,
    status: string,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const schedule = await tx.installationSchedule.findFirst({
        where: { id: scheduleId, organizationId },
      });
      if (!schedule) {
        throw new NotFoundException(`Schedule ${scheduleId} not found`);
      }

      return await tx.installationSchedule.update({
        where: { id: scheduleId },
        data: { status },
      });
    });
  }
}
