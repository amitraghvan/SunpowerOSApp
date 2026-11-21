import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ProjectInstallationStatus, InstallationCockpitKpis } from '@solaros/types';

@Injectable()
export class ProjectExecutionService {
  private readonly logger = new Logger(ProjectExecutionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves high-level installation cockpit KPIs
   */
  async getCockpitKpis(organizationId: string): Promise<InstallationCockpitKpis> {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const [
        totalActiveProjects,
        readyForInstallation,
        inProgressInstallation,
        qualityPending,
        commissioningPending,
        commissioned,
        customerHandoverPending,
        completed,
        totalActiveCrews,
        availableTechnicians,
        openSafetyObservations,
        stopWorkIncidentsActive,
      ] = await Promise.all([
        tx.projectInitiation.count({
          where: {
            organizationId,
            installationStatus: {
              notIn: ['COMPLETED', 'CANCELLED'],
            },
          },
        }),
        tx.projectInitiation.count({
          where: { organizationId, installationStatus: 'READY_FOR_INSTALLATION' },
        }),
        tx.projectInitiation.count({
          where: { organizationId, installationStatus: 'INSTALLATION_IN_PROGRESS' },
        }),
        tx.projectInitiation.count({
          where: { organizationId, installationStatus: 'QUALITY_INSPECTION_PENDING' },
        }),
        tx.projectInitiation.count({
          where: { organizationId, installationStatus: 'COMMISSIONING_PENDING' },
        }),
        tx.projectInitiation.count({
          where: { organizationId, installationStatus: 'COMMISSIONED' },
        }),
        tx.projectInitiation.count({
          where: { organizationId, installationStatus: 'CUSTOMER_HANDOVER_PENDING' },
        }),
        tx.projectInitiation.count({
          where: { organizationId, installationStatus: 'COMPLETED' },
        }),
        tx.installationCrew.count({
          where: { organizationId, status: 'ACTIVE' },
        }),
        tx.technicianProfile.count({
          where: { organizationId, availabilityStatus: 'AVAILABLE', isActive: true },
        }),
        tx.safetyObservation.count({
          where: { organizationId, isResolved: false },
        }),
        tx.installationSafetyRecord.count({
          where: { organizationId, stopWorkIssued: true, status: 'STOP_WORK' },
        }),
      ]);

      return {
        totalActiveProjects,
        readyForInstallation,
        inProgressInstallation,
        qualityPending,
        commissioningPending,
        commissioned,
        customerHandoverPending,
        completed,
        totalActiveCrews,
        availableTechnicians,
        openSafetyObservations,
        stopWorkIncidentsActive,
      };
    });
  }

  /**
   * Lists installation projects with filters and relations
   */
  async listProjects(
    organizationId: string,
    filter?: {
      status?: string;
      crewId?: string;
      projectManagerId?: string;
      search?: string;
    },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };

      if (filter?.status) {
        where.installationStatus = filter.status;
      }
      if (filter?.crewId) {
        where.assignedCrewId = filter.crewId;
      }
      if (filter?.projectManagerId) {
        where.projectManagerId = filter.projectManagerId;
      }
      if (filter?.search) {
        where.OR = [
          { projectCode: { contains: filter.search, mode: 'insensitive' } },
          { projectName: { contains: filter.search, mode: 'insensitive' } },
          { customer: { name: { contains: filter.search, mode: 'insensitive' } } },
        ];
      }

      return await tx.projectInitiation.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, phone: true, email: true },
          },
          site: {
            select: { id: true, siteName: true, addressLine1: true, city: true, state: true },
          },
          projectManager: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          assignedCrew: {
            select: { id: true, crewCode: true, crewName: true },
          },
          workOrders: {
            select: { id: true, workOrderNumber: true, status: true, completionPercentage: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  /**
   * Retrieves comprehensive project detail workspace with all 12 Phase 5 subsystems
   */
  async getProjectDetails(organizationId: string, projectId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: projectId, organizationId },
        include: {
          customer: true,
          site: true,
          projectManager: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          assignedCrew: {
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
          technicianAssignments: {
            include: {
              technicianProfile: {
                include: {
                  user: { select: { id: true, firstName: true, lastName: true, phone: true } },
                },
              },
            },
          },
          installationSchedules: {
            include: {
              crew: true,
              createdBy: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { scheduledDate: 'asc' },
          },
          siteReadinessRecords: {
            include: {
              inspectedBy: { select: { id: true, firstName: true, lastName: true } },
              approvedBy: { select: { id: true, firstName: true, lastName: true } },
              checks: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          workOrders: {
            include: {
              supervisor: { select: { id: true, firstName: true, lastName: true } },
              crew: true,
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
            orderBy: { createdAt: 'desc' },
          },
          milestones: {
            orderBy: { createdAt: 'asc' },
          },
          materialHandovers: {
            include: {
              handedOverBy: { select: { id: true, firstName: true, lastName: true } },
              receivedBy: { select: { id: true, firstName: true, lastName: true } },
              lines: {
                include: {
                  productVariant: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          materialConsumptions: {
            include: {
              productVariant: true,
              recordedBy: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { recordedAt: 'desc' },
          },
          safetyRecords: {
            include: {
              conductedBy: { select: { id: true, firstName: true, lastName: true } },
              supervisorSignOff: { select: { id: true, firstName: true, lastName: true } },
              checklistItems: true,
              observations: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          safetyIncidents: {
            include: {
              reportedBy: { select: { id: true, firstName: true, lastName: true } },
              closedBy: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { incidentDate: 'desc' },
          },
          qualityInspections: {
            include: {
              inspector: { select: { id: true, firstName: true, lastName: true } },
              items: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          commissioningRecords: {
            include: {
              engineer: { select: { id: true, firstName: true, lastName: true } },
              approvedBy: { select: { id: true, firstName: true, lastName: true } },
              tests: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          utilityTrackings: {
            orderBy: { createdAt: 'desc' },
          },
          customerHandovers: {
            include: {
              conductedBy: { select: { id: true, firstName: true, lastName: true } },
              punchlistItems: true,
              documents: true,
            },
            orderBy: { createdAt: 'desc' },
          },
          projectCosts: {
            orderBy: { incurredDate: 'desc' },
          },
          dispatchOrders: {
            include: {
              deliveryChallan: true,
              proofOfDelivery: true,
            },
          },
          serials: true,
        },
      });

      if (!project) {
        throw new NotFoundException(`Project initiation with ID ${projectId} not found`);
      }

      return project;
    });
  }

  /**
   * Updates project execution status with state transitions
   */
  async updateProjectStatus(
    organizationId: string,
    projectId: string,
    status: ProjectInstallationStatus | string,
    notes?: string,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: projectId, organizationId },
      });

      if (!project) {
        throw new NotFoundException(`Project ${projectId} not found`);
      }

      const updateData: any = {
        installationStatus: status,
      };

      if (status === 'INSTALLATION_IN_PROGRESS' && !project.actualStartDate) {
        updateData.actualStartDate = new Date();
      }

      if (status === 'COMPLETED' && !project.actualCompletionDate) {
        updateData.actualCompletionDate = new Date();
      }

      const updated = await tx.projectInitiation.update({
        where: { id: projectId },
        data: updateData,
      });

      this.logger.log(`Project ${project.projectCode} status changed to ${status} by ${userId}`);
      return updated;
    });
  }

  /**
   * Updates project manager and planned timeline
   */
  async updateProjectPlanning(
    organizationId: string,
    projectId: string,
    dto: {
      projectManagerId?: string;
      assignedCrewId?: string;
      expectedStartDate?: string | Date;
      expectedCompletionDate?: string | Date;
    },
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: projectId, organizationId },
      });

      if (!project) {
        throw new NotFoundException(`Project ${projectId} not found`);
      }

      const updated = await tx.projectInitiation.update({
        where: { id: projectId },
        data: {
          projectManagerId: dto.projectManagerId ?? project.projectManagerId,
          assignedCrewId: dto.assignedCrewId ?? project.assignedCrewId,
          expectedStartDate: dto.expectedStartDate ? new Date(dto.expectedStartDate) : project.expectedStartDate,
          expectedCompletionDate: dto.expectedCompletionDate ? new Date(dto.expectedCompletionDate) : project.expectedCompletionDate,
        },
      });

      this.logger.log(`Project ${project.projectCode} planning updated by ${userId}`);
      return updated;
    });
  }
}
