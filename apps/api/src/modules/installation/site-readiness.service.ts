import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateSiteReadinessRecordDto,
  RecordReadinessCheckDto,
  AuthorizeReadinessExceptionDto,
} from '@solaros/contracts';

// Standard 12-point Solar Site Readiness Checklist
export const STANDARD_SITE_READINESS_ITEMS = [
  {
    checkItemKey: 'ROOF_SAFE_ACCESS',
    description: 'Safe ladder / staircase roof access available with anchor points',
    isMandatory: true,
  },
  {
    checkItemKey: 'STRUCTURAL_INTEGRITY',
    description: 'Roof surface, purlins, and RCC slab verified free from cracks and structural deflection',
    isMandatory: true,
  },
  {
    checkItemKey: 'SHADOW_FREE_CONFIRMATION',
    description: 'Solar layout area verified shadow-free during prime daylight hours (9 AM - 4 PM)',
    isMandatory: true,
  },
  {
    checkItemKey: 'SECURE_STORAGE_AREA',
    description: 'Secured, dry storage space on site available for panels, inverter, and BOS equipment',
    isMandatory: true,
  },
  {
    checkItemKey: 'WATER_AND_POWER_AVAILABLE',
    description: 'Continuous construction power (230V AC) and water supply available for drilling and module cleaning',
    isMandatory: true,
  },
  {
    checkItemKey: 'DISCOM_NOC_STATUS',
    description: 'DISCOM initial feasibility NOC or registration slip verified on record',
    isMandatory: true,
  },
  {
    checkItemKey: 'ROOF_WATERPROOFING',
    description: 'Roof waterproofing membrane intact and anchor chemical sealing locations marked',
    isMandatory: true,
  },
  {
    checkItemKey: 'ELECTRICAL_ROOM_CLEARANCE',
    description: 'Main LT panel / AC-DB installation wall clearance meets safety working space',
    isMandatory: true,
  },
  {
    checkItemKey: 'EARTHING_LOCATION_IDENTIFIED',
    description: 'Soil location for chemical earthing pits (AC, DC, and Lightning) tested and marked',
    isMandatory: true,
  },
  {
    checkItemKey: 'CABLE_TRENCH_CONDUIT_ROUTE',
    description: 'DC cable riser path and conduit penetrations planned without sharp bends',
    isMandatory: false,
  },
  {
    checkItemKey: 'LIGHTNING_ARRESTER_CLEARANCE',
    description: 'Highest rooftop elevation available for early streamer emission (ESE) / copper LA pole',
    isMandatory: false,
  },
  {
    checkItemKey: 'CLIENT_PERMIT_TO_WORK',
    description: 'Owner/facility manager permit-to-work and security gate pass issued for crew',
    isMandatory: true,
  },
];

@Injectable()
export class SiteReadinessService {
  private readonly logger = new Logger(SiteReadinessService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * Creates a pre-installation site readiness audit and initializes the 12 standard checks
   */
  async createReadinessRecord(organizationId: string, dto: CreateSiteReadinessRecordDto, inspectedById: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      const readinessCode = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'READINESS',
        'SRR',
      );

      const record = await tx.siteReadinessRecord.create({
        data: {
          organizationId,
          readinessCode,
          projectInitiationId: dto.projectInitiationId,
          overallStatus: 'PENDING',
          inspectedById,
          roofAccessAvailable: dto.roofAccessAvailable ?? true,
          structuralIntegrityVerified: dto.structuralIntegrityVerified ?? true,
          shadowFreeAreaConfirmed: dto.shadowFreeAreaConfirmed ?? true,
          storageAreaSecured: dto.storageAreaSecured ?? true,
          waterAndElectricityAvailable: dto.waterAndElectricityAvailable ?? true,
          discomNocAvailable: dto.discomNocAvailable ?? true,
          notes: dto.notes,
        },
      });

      // Prepare check items
      const itemsToCreate = dto.checks && dto.checks.length > 0
        ? dto.checks
        : STANDARD_SITE_READINESS_ITEMS.map((item) => ({
            checkItemKey: item.checkItemKey,
            description: item.description,
            isMandatory: item.isMandatory,
            status: 'PASS',
            remarks: null,
          }));

      for (const item of itemsToCreate) {
        await tx.siteReadinessCheck.create({
          data: {
            organizationId,
            readinessRecordId: record.id,
            checkItemKey: item.checkItemKey,
            description: item.description,
            isMandatory: item.isMandatory ?? true,
            status: item.status || 'PASS',
            remarks: item.remarks,
          },
        });
      }

      // Check if all mandatory pass
      const allMandatoryPass = itemsToCreate
        .filter((i) => i.isMandatory)
        .every((i) => i.status === 'PASS');

      const initialStatus = allMandatoryPass ? 'APPROVED' : 'REJECTED';

      const updatedRecord = await tx.siteReadinessRecord.update({
        where: { id: record.id },
        data: { overallStatus: initialStatus },
        include: { checks: true, inspectedBy: { select: { firstName: true, lastName: true } } },
      });

      // Update project installation status if approved
      if (initialStatus === 'APPROVED') {
        await tx.projectInitiation.update({
          where: { id: dto.projectInitiationId },
          data: { installationStatus: 'READY_FOR_EXECUTION' },
        });
      } else {
        await tx.projectInitiation.update({
          where: { id: dto.projectInitiationId },
          data: { installationStatus: 'SITE_READINESS_PENDING' },
        });
      }

      this.logger.log(`Created Site Readiness ${readinessCode} for project ${project.projectCode}: status=${initialStatus}`);
      return updatedRecord;
    });
  }

  /**
   * Retrieves readiness record for a project
   */
  async getReadinessRecord(organizationId: string, projectId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const record = await tx.siteReadinessRecord.findFirst({
        where: { projectInitiationId: projectId, organizationId },
        include: {
          inspectedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          checks: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return record;
    });
  }

  /**
   * Records individual check update
   */
  async recordCheck(organizationId: string, readinessRecordId: string, dto: RecordReadinessCheckDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const record = await tx.siteReadinessRecord.findFirst({
        where: { id: readinessRecordId, organizationId },
      });
      if (!record) {
        throw new NotFoundException(`Site readiness record ${readinessRecordId} not found`);
      }

      const existingCheck = await tx.siteReadinessCheck.findFirst({
        where: { readinessRecordId, checkItemKey: dto.checkItemKey, organizationId },
      });

      let check;
      if (existingCheck) {
        check = await tx.siteReadinessCheck.update({
          where: { id: existingCheck.id },
          data: {
            status: dto.status,
            remarks: dto.remarks !== undefined ? dto.remarks : existingCheck.remarks,
            photoUrl: dto.photoUrl !== undefined ? dto.photoUrl : existingCheck.photoUrl,
          },
        });
      } else {
        check = await tx.siteReadinessCheck.create({
          data: {
            organizationId,
            readinessRecordId,
            checkItemKey: dto.checkItemKey,
            description: dto.description,
            isMandatory: dto.isMandatory ?? true,
            status: dto.status,
            remarks: dto.remarks,
            photoUrl: dto.photoUrl,
          },
        });
      }

      // Re-evaluate overall readiness
      const allChecks = await tx.siteReadinessCheck.findMany({
        where: { readinessRecordId, organizationId },
      });

      const failedMandatory = allChecks.filter((c) => c.isMandatory && c.status === 'FAIL');

      if (failedMandatory.length === 0 && record.overallStatus === 'REJECTED') {
        await tx.siteReadinessRecord.update({
          where: { id: readinessRecordId },
          data: { overallStatus: 'APPROVED' },
        });
        await tx.projectInitiation.update({
          where: { id: record.projectInitiationId },
          data: { installationStatus: 'READY_FOR_EXECUTION' },
        });
      }

      return check;
    });
  }

  /**
   * Records controlled supervisor exception when mandatory checks cannot be fully satisfied immediately
   */
  async authorizeException(
    organizationId: string,
    readinessRecordId: string,
    dto: AuthorizeReadinessExceptionDto,
    supervisorUserId: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const record = await tx.siteReadinessRecord.findFirst({
        where: { id: readinessRecordId, organizationId },
      });
      if (!record) {
        throw new NotFoundException(`Site readiness record ${readinessRecordId} not found`);
      }

      const updated = await tx.siteReadinessRecord.update({
        where: { id: readinessRecordId },
        data: {
          overallStatus: 'APPROVED_WITH_EXCEPTION',
          exceptionReason: dto.exceptionReason,
          exceptionAuthorizedById: supervisorUserId,
          approvedById: supervisorUserId,
          approvedAt: new Date(),
        },
        include: { checks: true },
      });

      // Advance project to READY_FOR_EXECUTION
      await tx.projectInitiation.update({
        where: { id: record.projectInitiationId },
        data: { installationStatus: 'READY_FOR_EXECUTION' },
      });

      this.logger.log(`Supervisor exception authorized on readiness ${record.readinessCode} by ${supervisorUserId}`);
      return updated;
    });
  }

  /**
   * Approves site readiness
   */
  async approveReadiness(organizationId: string, readinessRecordId: string, approvedById: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const record = await tx.siteReadinessRecord.findFirst({
        where: { id: readinessRecordId, organizationId },
        include: { checks: true },
      });
      if (!record) {
        throw new NotFoundException(`Site readiness record ${readinessRecordId} not found`);
      }

      const failedMandatory = record.checks.filter((c) => c.isMandatory && c.status === 'FAIL');
      if (failedMandatory.length > 0) {
        throw new BadRequestException(
          `Cannot approve site readiness: ${failedMandatory.length} mandatory check(s) failed. Authorize an exception if safe to proceed.`,
        );
      }

      const updated = await tx.siteReadinessRecord.update({
        where: { id: readinessRecordId },
        data: {
          overallStatus: 'APPROVED',
          approvedById,
          approvedAt: new Date(),
        },
      });

      await tx.projectInitiation.update({
        where: { id: record.projectInitiationId },
        data: { installationStatus: 'READY_FOR_EXECUTION' },
      });

      return updated;
    });
  }
}
