import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateUtilityTrackingDto,
  UpdateUtilityTrackingDto,
} from '@solaros/contracts';

@Injectable()
export class DiscomTrackingService {
  private readonly logger = new Logger(DiscomTrackingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * Initializes utility & DISCOM net-metering tracking record
   */
  async createUtilityTracking(organizationId: string, dto: CreateUtilityTrackingDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      const trackingCode = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'UTILITY_TRACKING',
        'UTL',
      );

      const tracking = await tx.utilityConnectionTracking.create({
        data: {
          organizationId,
          trackingCode,
          projectInitiationId: dto.projectInitiationId,
          discomName: dto.discomName,
          divisionOffice: dto.divisionOffice,
          consumerNumber: dto.consumerNumber,
          sanctionedLoadKw: dto.sanctionedLoadKw,
          solarCapacityKw: dto.solarCapacityKw || project.systemCapacityKw,
          applicationNumber: dto.applicationNumber,
          applicationSubmittedDate: dto.applicationSubmittedDate ? new Date(dto.applicationSubmittedDate) : new Date(),
          technicalFeasibilityStatus: 'PENDING',
          status: 'APPLICATION_SUBMITTED',
          subsidyPortalRegistrationId: dto.subsidyPortalRegistrationId,
          subsidyClaimStatus: dto.subsidyPortalRegistrationId ? 'SUBMITTED' : 'NOT_APPLIED',
          notes: dto.notes,
        },
      });

      this.logger.log(`Created DISCOM Tracking ${trackingCode} for consumer ${dto.consumerNumber}`);
      return tracking;
    });
  }

  /**
   * Retrieves DISCOM tracking for a project
   */
  async getUtilityTracking(organizationId: string, projectId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      return await tx.utilityConnectionTracking.findFirst({
        where: { projectInitiationId: projectId, organizationId },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  /**
   * Updates DISCOM milestones: feasibility approval, inspection date, meter testing, net meter installation, subsidy claim
   */
  async updateUtilityTracking(organizationId: string, trackingId: string, dto: UpdateUtilityTrackingDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const tracking = await tx.utilityConnectionTracking.findFirst({
        where: { id: trackingId, organizationId },
      });
      if (!tracking) {
        throw new NotFoundException(`Utility tracking ${trackingId} not found`);
      }

      const updateData: any = {};
      if (dto.applicationNumber) updateData.applicationNumber = dto.applicationNumber;
      if (dto.applicationSubmittedDate) updateData.applicationSubmittedDate = new Date(dto.applicationSubmittedDate);
      if (dto.technicalFeasibilityStatus) updateData.technicalFeasibilityStatus = dto.technicalFeasibilityStatus;
      if (dto.feasibilityApprovalDate) updateData.feasibilityApprovalDate = new Date(dto.feasibilityApprovalDate);
      if (dto.discomWorkOrderNumber) updateData.discomWorkOrderNumber = dto.discomWorkOrderNumber;
      if (dto.discomInspectionDate) updateData.discomInspectionDate = new Date(dto.discomInspectionDate);
      if (dto.discomInspectorName) updateData.discomInspectorName = dto.discomInspectorName;
      if (dto.inspectionResult) updateData.inspectionResult = dto.inspectionResult;
      if (dto.meterTestingDate) updateData.meterTestingDate = new Date(dto.meterTestingDate);
      if (dto.netMeterInstalledDate) updateData.netMeterInstalledDate = new Date(dto.netMeterInstalledDate);
      if (dto.netMeterSerialNumber) updateData.netMeterSerialNumber = dto.netMeterSerialNumber;
      if (dto.gridSynchronizationDate) updateData.gridSynchronizationDate = new Date(dto.gridSynchronizationDate);
      if (dto.ppaAgreementDate) updateData.ppaAgreementDate = new Date(dto.ppaAgreementDate);
      if (dto.subsidyClaimStatus) updateData.subsidyClaimStatus = dto.subsidyClaimStatus;
      if (dto.subsidyAmountEligible !== undefined) updateData.subsidyAmountEligible = dto.subsidyAmountEligible;
      if (dto.subsidyAmountDisbursed !== undefined) updateData.subsidyAmountDisbursed = dto.subsidyAmountDisbursed;
      if (dto.status) updateData.status = dto.status;
      if (dto.notes !== undefined) updateData.notes = dto.notes;

      // Auto-advance tracking status based on milestones
      if (dto.netMeterSerialNumber && !dto.status) {
        updateData.status = 'METER_INSTALLED';
      }
      if (dto.gridSynchronizationDate && !dto.status) {
        updateData.status = 'SYNCHRONIZED';
      }
      if (dto.subsidyAmountDisbursed && dto.subsidyAmountDisbursed > 0) {
        updateData.status = 'SUBSIDY_PROCESSED';
        updateData.subsidyClaimStatus = 'DISBURSED';
      }

      return await tx.utilityConnectionTracking.update({
        where: { id: trackingId },
        data: updateData,
      });
    });
  }
}
