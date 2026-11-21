import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateWorkOrderDto,
  UpdateWorkOrderDto,
  UpdateTaskStatusDto,
  AssignTechnicianToWorkOrderDto,
  UpdateMilestoneStatusDto,
} from '@solaros/contracts';

// Standard 9 Solar Installation Tasks
export const STANDARD_INSTALLATION_TASKS = [
  {
    taskKey: 'SITE_PREP',
    taskName: 'Site Preparation & Roof Marking',
    category: 'CIVIL',
    sequenceOrder: 1,
    plannedHours: 8,
  },
  {
    taskKey: 'MOUNTING_STRUCTURE',
    taskName: 'Mounting Structure Assembly & Torque Fixing',
    category: 'MECHANICAL',
    sequenceOrder: 2,
    plannedHours: 16,
  },
  {
    taskKey: 'MODULE_INSTALLATION',
    taskName: 'Solar PV Module Clamping & Alignment',
    category: 'MECHANICAL',
    sequenceOrder: 3,
    plannedHours: 20,
  },
  {
    taskKey: 'INVERTER_INSTALLATION',
    taskName: 'Inverter Wall Mounting & Isolation Switchgear',
    category: 'ELECTRICAL',
    sequenceOrder: 4,
    plannedHours: 8,
  },
  {
    taskKey: 'DC_ELECTRICAL',
    taskName: 'DC String Cabling, MC4 Crimping & Conduit Routing',
    category: 'ELECTRICAL',
    sequenceOrder: 5,
    plannedHours: 14,
  },
  {
    taskKey: 'AC_ELECTRICAL',
    taskName: 'AC-DB Distribution Board & Grid Feed Coupling',
    category: 'ELECTRICAL',
    sequenceOrder: 6,
    plannedHours: 12,
  },
  {
    taskKey: 'EARTHING_PROTECTION',
    taskName: 'Chemical Earthing Pits, Busbar & Lightning Arrester',
    category: 'ELECTRICAL',
    sequenceOrder: 7,
    plannedHours: 10,
  },
  {
    taskKey: 'MONITORING_SETUP',
    taskName: 'Smart Energy Meter, CT Clamps & Cloud Data Logger',
    category: 'DIGITAL',
    sequenceOrder: 8,
    plannedHours: 6,
  },
  {
    taskKey: 'TESTING',
    taskName: 'Pre-Commissioning Insulation, Polarity & Continuity Verification',
    category: 'INSPECTION',
    sequenceOrder: 9,
    plannedHours: 6,
  },
];

// Standard 7 Project Milestones
export const STANDARD_PROJECT_MILESTONES = [
  { milestoneKey: 'STRUCTURE_COMPLETED', milestoneName: 'Mounting Structure Installed & Torqued', weightagePercentage: 20 },
  { milestoneKey: 'PANELS_MOUNTED', milestoneName: 'All PV Modules Mounted & Clamped', weightagePercentage: 25 },
  { milestoneKey: 'CABLING_DONE', milestoneName: 'DC & AC Cabling in Conduits Completed', weightagePercentage: 15 },
  { milestoneKey: 'EARTHING_CONNECTED', milestoneName: 'Earth Resistance Verified < 5 Ohms', weightagePercentage: 10 },
  { milestoneKey: 'INVERTER_POWERED_ON', milestoneName: 'Inverter Booted & Parameterized', weightagePercentage: 10 },
  { milestoneKey: 'GRID_SYNCED', milestoneName: 'Net Meter Testing & Grid Synchronization', weightagePercentage: 10 },
  { milestoneKey: 'HANDED_OVER', milestoneName: 'Customer Demonstration & Handover Dossier Signed', weightagePercentage: 10 },
];

@Injectable()
export class WorkOrderService {
  private readonly logger = new Logger(WorkOrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * Creates an installation work order with tasks
   */
  async createWorkOrder(organizationId: string, dto: CreateWorkOrderDto, createdById?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      const workOrderNumber = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'WORK_ORDER',
        'IWO',
      );

      const tasksToCreate = dto.tasks && dto.tasks.length > 0 ? dto.tasks : STANDARD_INSTALLATION_TASKS;

      const workOrder = await tx.installationWorkOrder.create({
        data: {
          organizationId,
          workOrderNumber,
          projectInitiationId: dto.projectInitiationId,
          crewId: dto.crewId || project.assignedCrewId || null,
          supervisorId: dto.supervisorId || project.projectManagerId || null,
          priority: dto.priority || 'MEDIUM',
          status: 'READY_FOR_EXECUTION',
          plannedStartDate: dto.plannedStartDate ? new Date(dto.plannedStartDate) : null,
          plannedCompletionDate: dto.plannedCompletionDate ? new Date(dto.plannedCompletionDate) : null,
          workScope: dto.workScope || `Site Execution for ${project.projectName} (${project.systemCapacityKw} kW)`,
          totalTasks: tasksToCreate.length,
          completedTasks: 0,
          completionPercentage: 0,
          createdById: createdById || null,
        },
      });

      // Insert tasks
      for (const t of tasksToCreate) {
        await tx.installationTask.create({
          data: {
            organizationId,
            workOrderId: workOrder.id,
            taskKey: t.taskKey,
            taskName: t.taskName,
            category: t.category || 'MECHANICAL',
            sequenceOrder: t.sequenceOrder,
            status: 'PENDING',
            plannedHours: t.plannedHours ? t.plannedHours : null,
          },
        });
      }

      // Initialize project milestones if not already present
      const existingMilestones = await tx.installationMilestone.count({
        where: { projectInitiationId: dto.projectInitiationId, organizationId },
      });
      if (existingMilestones === 0) {
        for (const m of STANDARD_PROJECT_MILESTONES) {
          await tx.installationMilestone.create({
            data: {
              organizationId,
              projectInitiationId: dto.projectInitiationId,
              milestoneKey: m.milestoneKey,
              milestoneName: m.milestoneName,
              weightagePercentage: m.weightagePercentage,
              status: 'PENDING',
            },
          });
        }
      }

      // Update project installationStatus to INSTALLATION_IN_PROGRESS
      await tx.projectInitiation.update({
        where: { id: dto.projectInitiationId },
        data: {
          installationStatus: 'INSTALLATION_IN_PROGRESS',
          actualStartDate: project.actualStartDate || new Date(),
        },
      });

      this.logger.log(`Created Installation Work Order ${workOrderNumber} for project ${project.projectCode}`);
      return await tx.installationWorkOrder.findUnique({
        where: { id: workOrder.id },
        include: {
          tasks: { orderBy: { sequenceOrder: 'asc' } },
          crew: true,
          supervisor: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    });
  }

  /**
   * Lists work orders
   */
  async listWorkOrders(organizationId: string, query?: { projectId?: string; crewId?: string; status?: string }) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (query?.projectId) where.projectInitiationId = query.projectId;
      if (query?.crewId) where.crewId = query.crewId;
      if (query?.status) where.status = query.status;

      return await tx.installationWorkOrder.findMany({
        where,
        include: {
          projectInitiation: {
            select: { id: true, projectCode: true, projectName: true, systemCapacityKw: true },
          },
          crew: true,
          supervisor: { select: { id: true, firstName: true, lastName: true } },
          tasks: { select: { id: true, taskKey: true, taskName: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  /**
   * Gets work order details
   */
  async getWorkOrder(organizationId: string, workOrderId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const wo = await tx.installationWorkOrder.findFirst({
        where: { id: workOrderId, organizationId },
        include: {
          projectInitiation: true,
          crew: {
            include: {
              crewLeader: { select: { id: true, firstName: true, lastName: true, phone: true } },
              members: {
                include: {
                  technicianProfile: {
                    include: {
                      user: { select: { id: true, firstName: true, lastName: true, phone: true } },
                    },
                  },
                },
              },
            },
          },
          supervisor: { select: { id: true, firstName: true, lastName: true, phone: true } },
          tasks: { orderBy: { sequenceOrder: 'asc' } },
          assignedTechnicians: {
            include: {
              technicianProfile: {
                include: {
                  user: { select: { id: true, firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      });

      if (!wo) {
        throw new NotFoundException(`Work order ${workOrderId} not found`);
      }
      return wo;
    });
  }

  /**
   * Updates task status, hours, and recalculates work order completion
   */
  async updateTaskStatus(organizationId: string, taskId: string, dto: UpdateTaskStatusDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const task = await tx.installationTask.findFirst({
        where: { id: taskId, organizationId },
        include: { workOrder: true },
      });
      if (!task) {
        throw new NotFoundException(`Task ${taskId} not found`);
      }

      const updateData: any = {
        status: dto.status,
      };

      if (dto.actualHours !== undefined) updateData.actualHours = dto.actualHours;
      if (dto.notes !== undefined) updateData.notes = dto.notes;
      if (dto.completionProofUrls) updateData.completionProofUrls = dto.completionProofUrls;

      if (dto.status === 'COMPLETED' && !task.completedAt) {
        updateData.completedAt = new Date();
        updateData.completedById = userId || null;
      }

      const updatedTask = await tx.installationTask.update({
        where: { id: taskId },
        data: updateData,
      });

      // Recalculate Work Order Progress
      const allTasks = await tx.installationTask.findMany({
        where: { workOrderId: task.workOrderId, organizationId },
      });

      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter((t) => t.status === 'COMPLETED').length;
      const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      let newWoStatus = task.workOrder.status;
      if (completedTasks === totalTasks && totalTasks > 0) {
        newWoStatus = 'COMPLETED';
      } else if (completedTasks > 0 && newWoStatus !== 'COMPLETED') {
        newWoStatus = 'IN_PROGRESS';
      }

      await tx.installationWorkOrder.update({
        where: { id: task.workOrderId },
        data: {
          totalTasks,
          completedTasks,
          completionPercentage,
          status: newWoStatus,
          actualStartDate: task.workOrder.actualStartDate || new Date(),
          actualCompletionDate: newWoStatus === 'COMPLETED' ? new Date() : null,
        },
      });

      // If all tasks complete, advance project to INSTALLATION_COMPLETED
      if (newWoStatus === 'COMPLETED') {
        await tx.projectInitiation.update({
          where: { id: task.workOrder.projectInitiationId },
          data: {
            installationStatus: 'INSTALLATION_COMPLETED',
          },
        });
      }

      return updatedTask;
    });
  }

  /**
   * Assigns a technician to a work order
   */
  async assignTechnician(organizationId: string, workOrderId: string, dto: AssignTechnicianToWorkOrderDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const wo = await tx.installationWorkOrder.findFirst({
        where: { id: workOrderId, organizationId },
      });
      if (!wo) {
        throw new NotFoundException(`Work order ${workOrderId} not found`);
      }

      const tech = await tx.technicianProfile.findFirst({
        where: { id: dto.technicianProfileId, organizationId },
      });
      if (!tech) {
        throw new NotFoundException(`Technician ${dto.technicianProfileId} not found`);
      }

      return await tx.workOrderTechnicianAssignment.create({
        data: {
          organizationId,
          workOrderId,
          technicianProfileId: dto.technicianProfileId,
          role: dto.role || 'TECHNICIAN',
        },
      });
    });
  }

  /**
   * Updates installation milestone
   */
  async updateMilestone(
    organizationId: string,
    milestoneId: string,
    dto: UpdateMilestoneStatusDto,
    verifiedById?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const milestone = await tx.installationMilestone.findFirst({
        where: { id: milestoneId, organizationId },
      });
      if (!milestone) {
        throw new NotFoundException(`Milestone ${milestoneId} not found`);
      }

      return await tx.installationMilestone.update({
        where: { id: milestoneId },
        data: {
          status: dto.status,
          notes: dto.notes !== undefined ? dto.notes : milestone.notes,
          achievedAt: dto.status === 'ACHIEVED' ? new Date() : null,
          verifiedById: verifiedById || null,
        },
      });
    });
  }
}
