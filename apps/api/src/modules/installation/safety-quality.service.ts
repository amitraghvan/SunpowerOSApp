import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateSafetyRecordDto,
  AddSafetyObservationDto,
  IssueStopWorkDto,
  LiftStopWorkDto,
  ReportSafetyIncidentDto,
  CreateQualityInspectionDto,
  RecordQualityItemDto,
  RecordReworkResolutionDto,
} from '@solaros/contracts';

// Standard 6 Pre-Work Safety Items
export const STANDARD_SAFETY_CHECKLIST_ITEMS = [
  { itemKey: 'PPE_MANDATORY', description: 'Helmet, safety shoes, reflective vest, and gloves worn by all crew', isMandatory: true },
  { itemKey: 'FALL_PROTECTION', description: 'Full body harness with lifeline / static rope anchored on rooftop', isMandatory: true },
  { itemKey: 'ELECTRICAL_ISOLATION', description: 'Lockout/Tagout (LOTO) verified on LT feeder and inverter isolation switches', isMandatory: true },
  { itemKey: 'WEATHER_CHECK', description: 'No lightning, heavy rain, or wind speeds exceeding 30 km/h', isMandatory: true },
  { itemKey: 'LADDER_SECURING', description: 'Access ladder tied off at roof top edge at 4:1 safe slope angle', isMandatory: true },
  { itemKey: 'FIRST_AID_KIT', description: 'First-aid kit present on site with certified first-aider available', isMandatory: false },
];

// Standard Quality Checkpoints by Stage
export const STANDARD_QUALITY_CHECKPOINTS: Record<string, Array<{ checkpointKey: string; checkpointName: string; toleranceCriteria: string; isMandatory: boolean }>> = {
  STRUCTURE_MOUNTING: [
    { checkpointKey: 'ANCHOR_TORQUE', checkpointName: 'Anchor Bolt Fastener Torque Verification', toleranceCriteria: 'M10: 40 Nm ± 2 Nm', isMandatory: true },
    { checkpointKey: 'TILT_ANGLE', checkpointName: 'Structure Tilt Angle Verification', toleranceCriteria: 'Designed tilt ± 1 degree', isMandatory: true },
    { checkpointKey: 'CORROSION_COATING', checkpointName: 'Hot Dip Galvanization (HDG) / Pre-Galv Integrity', toleranceCriteria: 'Min 80 microns HDG', isMandatory: true },
  ],
  PANEL_ALIGNMENT_TORQUE: [
    { checkpointKey: 'MID_END_CLAMPS', checkpointName: 'Mid & End Clamp Fastener Torque', toleranceCriteria: '9-10 Nm with EPDM rubber pad', isMandatory: true },
    { checkpointKey: 'STRING_ALIGNMENT', checkpointName: 'Array Coplanar Pitch & Azimuth Alignment', toleranceCriteria: 'Parallel alignment without twist', isMandatory: true },
  ],
  DC_CABLING_CONDUIT: [
    { checkpointKey: 'MC4_CRIMPING', checkpointName: 'MC4 Connector Pull Test & IP68 Sealing', toleranceCriteria: 'Zero loose pin, audible click', isMandatory: true },
    { checkpointKey: 'UV_CONDUIT_ROUTING', checkpointName: 'DC Solar Cable in UV Resistant Flexible Conduit', toleranceCriteria: 'No exposed wire beneath modules', isMandatory: true },
  ],
  INVERTER_INSTALLATION: [
    { checkpointKey: 'WALL_CLEARANCE', checkpointName: 'Inverter Heatsink Ventilation Clearance', toleranceCriteria: 'Min 300 mm left/right, 500 mm top', isMandatory: true },
    { checkpointKey: 'INGRESS_PROTECTION', checkpointName: 'Cable Glands Tightened (IP65/IP66)', toleranceCriteria: 'All unused ports sealed with plugs', isMandatory: true },
  ],
  AC_ELECTRICAL_DISTRIBUTION: [
    { checkpointKey: 'SPD_SURGE_PROTECTION', checkpointName: 'Type II SPD Installed on AC-DB Input', toleranceCriteria: 'Healthy indicator flag (green)', isMandatory: true },
    { checkpointKey: 'MCB_RCCB_TRIP_TEST', checkpointName: 'RCCB 30mA Earth Leakage Trip Test', toleranceCriteria: 'Trip time < 40ms', isMandatory: true },
  ],
  EARTHING_LIGHTNING: [
    { checkpointKey: 'EARTH_RESISTANCE', checkpointName: 'Earth Pit Electrode Resistance to Ground', toleranceCriteria: '< 5.0 Ohms (IS 3043:2018)', isMandatory: true },
    { checkpointKey: 'ESE_LA_COVERAGE', checkpointName: 'Lightning Protection Rod Coverage Radius', toleranceCriteria: 'Class III protection radius', isMandatory: true },
  ],
  FINAL_PRE_COMMISSIONING: [
    { checkpointKey: 'PHASE_SEQUENCE', checkpointName: '3-Phase AC Sequence Alignment (R-Y-B)', toleranceCriteria: 'Clockwise rotation verified', isMandatory: true },
    { checkpointKey: 'INSULATION_RESISTANCE', checkpointName: 'DC String to Earth Megger Test at 1000V', toleranceCriteria: '> 1.0 MegaOhm', isMandatory: true },
  ],
};

@Injectable()
export class SafetyQualityService {
  private readonly logger = new Logger(SafetyQualityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  // ---------------------------------------------------------------------------
  // 1. SAFETY MANAGEMENT
  // ---------------------------------------------------------------------------

  /**
   * Creates a pre-work daily safety record with toolbox talk & PPE checks
   */
  async createSafetyRecord(organizationId: string, dto: CreateSafetyRecordDto, conductedById: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      const safetyNumber = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'SAFETY',
        'SAF',
      );

      const record = await tx.installationSafetyRecord.create({
        data: {
          organizationId,
          safetyNumber,
          projectInitiationId: dto.projectInitiationId,
          workOrderId: dto.workOrderId || null,
          conductedById,
          status: 'CLEARED',
          toolboxTalkConducted: dto.toolboxTalkConducted ?? true,
          toolboxTopic: dto.toolboxTopic || 'Safe Rooftop Installation & Fall Protection Procedures',
          ppeComplianceVerified: dto.ppeComplianceVerified ?? true,
          fallProtectionVerified: dto.fallProtectionVerified ?? true,
          electricalIsolationVerified: dto.electricalIsolationVerified ?? true,
          weatherSafeForWork: dto.weatherSafeForWork ?? true,
          stopWorkIssued: false,
          notes: dto.notes,
        },
      });

      const checklistToCreate = dto.checklistItems && dto.checklistItems.length > 0
        ? dto.checklistItems
        : STANDARD_SAFETY_CHECKLIST_ITEMS.map((item) => ({
            itemKey: item.itemKey,
            description: item.description,
            isMandatory: item.isMandatory,
            status: 'PASS',
            remarks: null,
          }));

      for (const item of checklistToCreate) {
        await tx.safetyChecklistItem.create({
          data: {
            organizationId,
            safetyRecordId: record.id,
            itemKey: item.itemKey,
            description: item.description,
            isMandatory: item.isMandatory ?? true,
            status: item.status || 'PASS',
            remarks: item.remarks,
          },
        });
      }

      this.logger.log(`Created Safety Record ${safetyNumber} for project ${project.projectCode}`);
      return await tx.installationSafetyRecord.findUnique({
        where: { id: record.id },
        include: { checklistItems: true, conductedBy: { select: { firstName: true, lastName: true } } },
      });
    });
  }

  /**
   * Adds an unsafe act / near miss safety observation
   */
  async addObservation(organizationId: string, safetyRecordId: string, dto: AddSafetyObservationDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const record = await tx.installationSafetyRecord.findFirst({
        where: { id: safetyRecordId, organizationId },
      });
      if (!record) {
        throw new NotFoundException(`Safety record ${safetyRecordId} not found`);
      }

      return await tx.safetyObservation.create({
        data: {
          organizationId,
          safetyRecordId,
          observationType: dto.observationType || 'UNSAFE_CONDITION',
          severity: dto.severity || 'MEDIUM',
          description: dto.description,
          correctiveAction: dto.correctiveAction,
          actionTakenById: userId || null,
          isResolved: false,
        },
      });
    });
  }

  /**
   * Formal stop-work issuance. Freezes work order and sets project installationStatus to ON_HOLD.
   */
  async issueStopWork(organizationId: string, safetyRecordId: string, dto: IssueStopWorkDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const record = await tx.installationSafetyRecord.findFirst({
        where: { id: safetyRecordId, organizationId },
      });
      if (!record) {
        throw new NotFoundException(`Safety record ${safetyRecordId} not found`);
      }

      const updated = await tx.installationSafetyRecord.update({
        where: { id: safetyRecordId },
        data: {
          status: 'STOP_WORK',
          stopWorkIssued: true,
          stopWorkReason: dto.stopWorkReason,
          supervisorSignOffId: userId || null,
          supervisorSignedAt: new Date(),
        },
      });

      // Put project on hold
      await tx.projectInitiation.update({
        where: { id: record.projectInitiationId },
        data: { installationStatus: 'ON_HOLD' },
      });

      this.logger.warn(`STOP-WORK issued on project ${record.projectInitiationId}: ${dto.stopWorkReason}`);
      return updated;
    });
  }

  /**
   * Lifts stop-work order and resumes project execution
   */
  async liftStopWork(organizationId: string, safetyRecordId: string, dto: LiftStopWorkDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const record = await tx.installationSafetyRecord.findFirst({
        where: { id: safetyRecordId, organizationId },
      });
      if (!record) {
        throw new NotFoundException(`Safety record ${safetyRecordId} not found`);
      }

      const updated = await tx.installationSafetyRecord.update({
        where: { id: safetyRecordId },
        data: {
          status: 'RESOLVED',
          stopWorkLiftedAt: new Date(),
          stopWorkLiftedById: userId || null,
          notes: `${record.notes || ''} [Stop-Work Lifted: ${dto.resolutionNotes}]`,
        },
      });

      // Resume project execution
      await tx.projectInitiation.update({
        where: { id: record.projectInitiationId },
        data: { installationStatus: 'INSTALLATION_IN_PROGRESS' },
      });

      this.logger.log(`Stop-Work lifted on project ${record.projectInitiationId} by ${userId}`);
      return updated;
    });
  }

  /**
   * Reports a safety incident
   */
  async reportIncident(organizationId: string, dto: ReportSafetyIncidentDto, reportedById: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      const incidentNumber = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'INCIDENT',
        'INC',
      );

      const incident = await tx.safetyIncident.create({
        data: {
          organizationId,
          incidentNumber,
          projectInitiationId: dto.projectInitiationId,
          workOrderId: dto.workOrderId || null,
          reportedById,
          severity: dto.severity || 'FIRST_AID',
          description: dto.description,
          immediateActionTaken: dto.immediateActionTaken,
          rootCause: dto.rootCause,
          preventiveAction: dto.preventiveAction,
          regulatoryReportRequired: dto.regulatoryReportRequired ?? false,
        },
      });

      this.logger.warn(`Reported safety incident ${incidentNumber} (${dto.severity}) on project ${project.projectCode}`);
      return incident;
    });
  }

  // ---------------------------------------------------------------------------
  // 2. QUALITY INSPECTION
  // ---------------------------------------------------------------------------

  /**
   * Creates stage-gate installation quality inspection
   */
  async createQualityInspection(organizationId: string, dto: CreateQualityInspectionDto, inspectorId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      const inspectionNumber = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'INSTALLATION_QUALITY',
        'IQI',
      );

      const stage = dto.stage || 'STRUCTURE_MOUNTING';
      const defaultCheckpoints = STANDARD_QUALITY_CHECKPOINTS[stage] || [];

      const itemsToCreate = dto.items && dto.items.length > 0
        ? dto.items
        : defaultCheckpoints.map((cp) => ({
            checkpointKey: cp.checkpointKey,
            checkpointName: cp.checkpointName,
            toleranceCriteria: cp.toleranceCriteria,
            observedValue: 'Verified compliant',
            isMandatory: cp.isMandatory,
            result: 'PASS',
            deviationNotes: null,
          }));

      const hasFailedMandatory = itemsToCreate.some((i) => i.isMandatory && i.result === 'FAIL');
      const overallResult = hasFailedMandatory ? 'REWORK_REQUIRED' : 'PASS';

      const inspection = await tx.installationQualityInspection.create({
        data: {
          organizationId,
          inspectionNumber,
          projectInitiationId: dto.projectInitiationId,
          workOrderId: dto.workOrderId || null,
          stage,
          inspectorId,
          overallResult,
          notes: dto.notes,
        },
      });

      for (const item of itemsToCreate) {
        await tx.qualityInspectionItem.create({
          data: {
            organizationId,
            qualityInspectionId: inspection.id,
            checkpointKey: item.checkpointKey,
            checkpointName: item.checkpointName,
            toleranceCriteria: item.toleranceCriteria,
            observedValue: item.observedValue,
            isMandatory: item.isMandatory ?? true,
            result: item.result || 'PASS',
            deviationNotes: item.deviationNotes,
          },
        });
      }

      this.logger.log(`Created Quality Inspection ${inspectionNumber} for stage ${stage}: result=${overallResult}`);
      return await tx.installationQualityInspection.findUnique({
        where: { id: inspection.id },
        include: { items: true, inspector: { select: { firstName: true, lastName: true } } },
      });
    });
  }

  /**
   * Resolves a rework requirement from a failed inspection
   */
  async resolveRework(
    organizationId: string,
    inspectionId: string,
    dto: RecordReworkResolutionDto,
    verifiedById?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const inspection = await tx.installationQualityInspection.findFirst({
        where: { id: inspectionId, organizationId },
      });
      if (!inspection) {
        throw new NotFoundException(`Quality inspection ${inspectionId} not found`);
      }

      // Mark all items as PASS
      await tx.qualityInspectionItem.updateMany({
        where: { qualityInspectionId: inspectionId, organizationId },
        data: { result: 'PASS' },
      });

      const updated = await tx.installationQualityInspection.update({
        where: { id: inspectionId },
        data: {
          overallResult: 'PASS',
          reworkCompletedAt: new Date(),
          reworkVerifiedById: verifiedById || null,
          notes: `${inspection.notes || ''} [Rework Resolved: ${dto.reworkNotes}]`,
        },
        include: { items: true },
      });

      this.logger.log(`Quality inspection ${inspection.inspectionNumber} rework resolved`);
      return updated;
    });
  }
}
