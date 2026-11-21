import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateTechnicianProfileDto,
  UpdateTechnicianProfileDto,
  AddTechnicianSkillDto,
  AddTechnicianCertificationDto,
  CreateInstallationCrewDto,
  UpdateInstallationCrewDto,
  AddCrewMemberDto,
  AssignProjectTechnicianDto,
} from '@solaros/contracts';

@Injectable()
export class TechnicianCrewService {
  private readonly logger = new Logger(TechnicianCrewService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * Registers a technician profile linked to an existing user
   */
  async createTechnicianProfile(organizationId: string, dto: CreateTechnicianProfileDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      // Check user exists
      const user = await tx.user.findFirst({
        where: { id: dto.userId },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${dto.userId} not found`);
      }

      // Check not already registered
      const existing = await tx.technicianProfile.findFirst({
        where: { userId: dto.userId },
      });
      if (existing) {
        throw new ConflictException(`User ${user.email} is already registered as a technician`);
      }

      const technicianCode =
        dto.technicianCode ||
        (await this.numberingService.getNextDocumentNumber(organizationId, 'TECHNICIAN', 'TECH'));

      const profile = await tx.technicianProfile.create({
        data: {
          organizationId,
          userId: dto.userId,
          technicianCode,
          technicianType: dto.technicianType || 'INSTALLATION_TECHNICIAN',
          phone: dto.phone || user.phone,
          emergencyContact: dto.emergencyContact,
          bloodGroup: dto.bloodGroup,
          yearsOfExperience: dto.yearsOfExperience !== undefined ? dto.yearsOfExperience : null,
          specializations: dto.specializations || [],
          safetyInductionDate: dto.safetyInductionDate ? new Date(dto.safetyInductionDate) : null,
          safetyInductionValidUntil: dto.safetyInductionValidUntil
            ? new Date(dto.safetyInductionValidUntil)
            : null,
          notes: dto.notes,
        },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
        },
      });

      this.logger.log(`Created technician profile ${technicianCode} for user ${user.email}`);
      return profile;
    });
  }

  /**
   * Lists technician profiles with skills and certifications
   */
  async listTechnicians(
    organizationId: string,
    query?: {
      type?: string;
      availability?: string;
      search?: string;
    },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId, isActive: true };

      if (query?.type) {
        where.technicianType = query.type;
      }
      if (query?.availability) {
        where.availabilityStatus = query.availability;
      }
      if (query?.search) {
        where.OR = [
          { technicianCode: { contains: query.search, mode: 'insensitive' } },
          { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
          { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
          { user: { email: { contains: query.search, mode: 'insensitive' } } },
        ];
      }

      return await tx.technicianProfile.findMany({
        where,
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, phone: true },
          },
          skills: true,
          certifications: true,
          crewMemberships: {
            where: { isActive: true },
            include: { crew: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  /**
   * Gets single technician profile detail
   */
  async getTechnician(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const tech = await tx.technicianProfile.findFirst({
        where: { id, organizationId },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          skills: true,
          certifications: true,
          crewMemberships: {
            include: { crew: true },
          },
          projectAssignments: {
            where: { isActive: true },
            include: { projectInitiation: true },
          },
        },
      });

      if (!tech) {
        throw new NotFoundException(`Technician ${id} not found`);
      }
      return tech;
    });
  }

  /**
   * Updates technician profile
   */
  async updateTechnician(organizationId: string, id: string, dto: UpdateTechnicianProfileDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const tech = await tx.technicianProfile.findFirst({
        where: { id, organizationId },
      });
      if (!tech) {
        throw new NotFoundException(`Technician ${id} not found`);
      }

      const updateData: any = {};
      if (dto.technicianType) updateData.technicianType = dto.technicianType;
      if (dto.phone !== undefined) updateData.phone = dto.phone;
      if (dto.emergencyContact !== undefined) updateData.emergencyContact = dto.emergencyContact;
      if (dto.bloodGroup !== undefined) updateData.bloodGroup = dto.bloodGroup;
      if (dto.yearsOfExperience !== undefined) updateData.yearsOfExperience = dto.yearsOfExperience;
      if (dto.specializations) updateData.specializations = dto.specializations;
      if (dto.availabilityStatus) updateData.availabilityStatus = dto.availabilityStatus;
      if (dto.safetyInductionDate) updateData.safetyInductionDate = new Date(dto.safetyInductionDate);
      if (dto.safetyInductionValidUntil) updateData.safetyInductionValidUntil = new Date(dto.safetyInductionValidUntil);
      if (dto.notes !== undefined) updateData.notes = dto.notes;
      if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

      return await tx.technicianProfile.update({
        where: { id },
        data: updateData,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          skills: true,
          certifications: true,
        },
      });
    });
  }

  /**
   * Adds and verifies a technician skill
   */
  async addSkill(organizationId: string, technicianId: string, dto: AddTechnicianSkillDto, verifiedByUserId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const tech = await tx.technicianProfile.findFirst({
        where: { id: technicianId, organizationId },
      });
      if (!tech) {
        throw new NotFoundException(`Technician ${technicianId} not found`);
      }

      return await tx.technicianSkill.create({
        data: {
          organizationId,
          technicianProfileId: technicianId,
          skillName: dto.skillName,
          proficiencyLevel: dto.proficiencyLevel || 'INTERMEDIATE',
          verifiedByUserId: verifiedByUserId || null,
          verifiedAt: verifiedByUserId ? new Date() : null,
        },
      });
    });
  }

  /**
   * Adds and validates a certification with expiration tracking
   */
  async addCertification(
    organizationId: string,
    technicianId: string,
    dto: AddTechnicianCertificationDto,
    verifiedByUserId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const tech = await tx.technicianProfile.findFirst({
        where: { id: technicianId, organizationId },
      });
      if (!tech) {
        throw new NotFoundException(`Technician ${technicianId} not found`);
      }

      return await tx.technicianCertification.create({
        data: {
          organizationId,
          technicianProfileId: technicianId,
          certificateName: dto.certificateName,
          issuingAuthority: dto.issuingAuthority,
          certificateNumber: dto.certificateNumber,
          issueDate: dto.issueDate ? new Date(dto.issueDate) : null,
          expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
          documentUrl: dto.documentUrl,
          isVerified: !!verifiedByUserId,
          verifiedByUserId: verifiedByUserId || null,
        },
      });
    });
  }

  /**
   * Creates an installation crew with leader and optional initial members
   */
  async createCrew(organizationId: string, dto: CreateInstallationCrewDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const leader = await tx.user.findFirst({
        where: { id: dto.crewLeaderId },
      });
      if (!leader) {
        throw new NotFoundException(`Crew leader user ${dto.crewLeaderId} not found`);
      }

      const crewCode =
        dto.crewCode ||
        (await this.numberingService.getNextDocumentNumber(organizationId, 'CREW', 'CRW'));

      const crew = await tx.installationCrew.create({
        data: {
          organizationId,
          crewCode,
          crewName: dto.crewName,
          crewLeaderId: dto.crewLeaderId,
          maxConcurrentProjects: dto.maxConcurrentProjects || 2,
          serviceAreas: dto.serviceAreas || [],
          notes: dto.notes,
        },
        include: {
          crewLeader: { select: { id: true, firstName: true, lastName: true, phone: true } },
        },
      });

      // Add initial members if provided
      if (dto.memberProfileIds && dto.memberProfileIds.length > 0) {
        for (const profileId of dto.memberProfileIds) {
          await tx.crewMember.create({
            data: {
              organizationId,
              crewId: crew.id,
              technicianProfileId: profileId,
              roleInCrew: 'TECHNICIAN',
            },
          });
        }
      }

      this.logger.log(`Created installation crew ${crewCode} (${dto.crewName}) led by ${leader.email}`);
      return crew;
    });
  }

  /**
   * Lists crews with leader and active project count
   */
  async listCrews(organizationId: string, query?: { status?: string; search?: string }) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };

      if (query?.status) {
        where.status = query.status;
      }
      if (query?.search) {
        where.OR = [
          { crewCode: { contains: query.search, mode: 'insensitive' } },
          { crewName: { contains: query.search, mode: 'insensitive' } },
        ];
      }

      return await tx.installationCrew.findMany({
        where,
        include: {
          crewLeader: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          members: {
            where: { isActive: true },
            include: {
              technicianProfile: {
                include: {
                  user: { select: { id: true, firstName: true, lastName: true, phone: true } },
                },
              },
            },
          },
          assignedProjects: {
            where: {
              installationStatus: { notIn: ['COMPLETED', 'CANCELLED'] },
            },
            select: { id: true, projectCode: true, projectName: true, installationStatus: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  /**
   * Gets crew details
   */
  async getCrew(organizationId: string, crewId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const crew = await tx.installationCrew.findFirst({
        where: { id: crewId, organizationId },
        include: {
          crewLeader: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          members: {
            where: { isActive: true },
            include: {
              technicianProfile: {
                include: {
                  user: { select: { id: true, firstName: true, lastName: true, phone: true } },
                  skills: true,
                },
              },
            },
          },
          assignedProjects: {
            where: { installationStatus: { notIn: ['COMPLETED', 'CANCELLED'] } },
            select: { id: true, projectCode: true, projectName: true, installationStatus: true },
          },
          schedules: {
            where: { status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
            orderBy: { scheduledDate: 'asc' },
          },
        },
      });

      if (!crew) {
        throw new NotFoundException(`Crew ${crewId} not found`);
      }
      return crew;
    });
  }

  /**
   * Updates crew configuration
   */
  async updateCrew(organizationId: string, crewId: string, dto: UpdateInstallationCrewDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const crew = await tx.installationCrew.findFirst({
        where: { id: crewId, organizationId },
      });
      if (!crew) {
        throw new NotFoundException(`Crew ${crewId} not found`);
      }

      const updateData: any = {};
      if (dto.crewName) updateData.crewName = dto.crewName;
      if (dto.crewLeaderId) updateData.crewLeaderId = dto.crewLeaderId;
      if (dto.maxConcurrentProjects !== undefined) updateData.maxConcurrentProjects = dto.maxConcurrentProjects;
      if (dto.status) updateData.status = dto.status;
      if (dto.serviceAreas) updateData.serviceAreas = dto.serviceAreas;
      if (dto.notes !== undefined) updateData.notes = dto.notes;

      return await tx.installationCrew.update({
        where: { id: crewId },
        data: updateData,
        include: {
          crewLeader: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    });
  }

  /**
   * Adds a technician to a crew
   */
  async addCrewMember(organizationId: string, crewId: string, dto: AddCrewMemberDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const crew = await tx.installationCrew.findFirst({
        where: { id: crewId, organizationId },
      });
      if (!crew) {
        throw new NotFoundException(`Crew ${crewId} not found`);
      }

      const tech = await tx.technicianProfile.findFirst({
        where: { id: dto.technicianProfileId, organizationId },
      });
      if (!tech) {
        throw new NotFoundException(`Technician ${dto.technicianProfileId} not found`);
      }

      // Check if already active member
      const existing = await tx.crewMember.findFirst({
        where: { crewId, technicianProfileId: dto.technicianProfileId, organizationId },
      });

      if (existing) {
        if (existing.isActive) {
          throw new ConflictException(`Technician is already an active member of this crew`);
        }
        return await tx.crewMember.update({
          where: { id: existing.id },
          data: { isActive: true, roleInCrew: dto.roleInCrew || 'TECHNICIAN', joinedAt: new Date(), leftAt: null },
        });
      }

      return await tx.crewMember.create({
        data: {
          organizationId,
          crewId,
          technicianProfileId: dto.technicianProfileId,
          roleInCrew: dto.roleInCrew || 'TECHNICIAN',
        },
      });
    });
  }

  /**
   * Removes a member from a crew
   */
  async removeCrewMember(organizationId: string, crewId: string, technicianProfileId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const member = await tx.crewMember.findFirst({
        where: { crewId, technicianProfileId, organizationId, isActive: true },
      });
      if (!member) {
        throw new NotFoundException(`Active crew member record not found`);
      }

      return await tx.crewMember.update({
        where: { id: member.id },
        data: { isActive: false, leftAt: new Date() },
      });
    });
  }

  /**
   * Assigns a crew to a project and verifies concurrent project capacity
   */
  async assignCrewToProject(organizationId: string, projectId: string, crewId: string, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: projectId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${projectId} not found`);
      }

      const crew = await tx.installationCrew.findFirst({
        where: { id: crewId, organizationId },
        include: {
          assignedProjects: {
            where: { installationStatus: { notIn: ['COMPLETED', 'CANCELLED'] } },
          },
        },
      });
      if (!crew) {
        throw new NotFoundException(`Crew ${crewId} not found`);
      }

      if (crew.assignedProjects.length >= crew.maxConcurrentProjects) {
        this.logger.warn(
          `Crew ${crew.crewCode} has reached its concurrent capacity limit (${crew.assignedProjects.length}/${crew.maxConcurrentProjects})`,
        );
      }

      const updated = await tx.projectInitiation.update({
        where: { id: projectId },
        data: {
          assignedCrewId: crewId,
          installationStatus:
            project.installationStatus === 'READY_FOR_INSTALLATION' ||
            project.installationStatus === 'SITE_READINESS_PENDING'
              ? 'CREW_ASSIGNED'
              : project.installationStatus,
        },
      });

      this.logger.log(`Assigned crew ${crew.crewCode} to project ${project.projectCode}`);
      return updated;
    });
  }

  /**
   * Assigns individual technician to project
   */
  async assignTechnicianToProject(organizationId: string, projectId: string, dto: AssignProjectTechnicianDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: projectId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${projectId} not found`);
      }

      const tech = await tx.technicianProfile.findFirst({
        where: { id: dto.technicianProfileId, organizationId },
      });
      if (!tech) {
        throw new NotFoundException(`Technician ${dto.technicianProfileId} not found`);
      }

      const assignment = await tx.projectTechnicianAssignment.create({
        data: {
          organizationId,
          projectInitiationId: projectId,
          technicianProfileId: dto.technicianProfileId,
          role: dto.role || 'TECHNICIAN',
          notes: dto.notes,
        },
        include: {
          technicianProfile: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      });

      // Update technician availability to ASSIGNED
      await tx.technicianProfile.update({
        where: { id: dto.technicianProfileId },
        data: { availabilityStatus: 'ASSIGNED' },
      });

      return assignment;
    });
  }
}
