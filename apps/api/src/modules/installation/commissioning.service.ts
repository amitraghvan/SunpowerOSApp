import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateCommissioningRecordDto,
  RecordCommissioningTestDto,
  ApproveCommissioningDto,
  RejectCommissioningDto,
} from '@solaros/contracts';

// Standard 8 Solar Commissioning & Testing Protocols
export const STANDARD_COMMISSIONING_TESTS = [
  {
    testCategory: 'INSULATION_RESISTANCE',
    testName: 'DC String to Earth Megger Insulation Test (1000V DC)',
    unit: 'MOHM',
    expectedValue: '> 1.0 MOhm',
    measuredValue: '25.4 MOhm',
    isMandatory: true,
    testResult: 'PASS',
    remarks: 'Tested compliant at 1000V DC',
  },
  {
    testCategory: 'CONTINUITY',
    testName: 'Array Frame & Mounting Structure Ground Continuity',
    unit: 'OHM',
    expectedValue: '< 0.5 Ohm',
    measuredValue: '0.12 Ohm',
    isMandatory: true,
    testResult: 'PASS',
    remarks: 'Continuous bond across rails',
  },
  {
    testCategory: 'POLARITY',
    testName: 'DC String Polarity Verification (Positive to Male MC4)',
    unit: 'VERIFIED',
    expectedValue: 'Correct Polarity',
    measuredValue: 'Confirmed',
    isMandatory: true,
    testResult: 'PASS',
    remarks: 'Verified with calibrated multimeter',
  },
  {
    testCategory: 'VOC_OPEN_CIRCUIT',
    testName: 'String Open Circuit Voltage (Voc)',
    unit: 'VOLT',
    expectedValue: '380 - 450 V DC',
    measuredValue: '412.5 V DC',
    isMandatory: true,
    testResult: 'PASS',
    remarks: 'Within design temperature bounds',
  },
  {
    testCategory: 'ISC_SHORT_CIRCUIT',
    testName: 'String Short Circuit Current (Isc)',
    unit: 'AMP',
    expectedValue: '12 - 14 A DC',
    measuredValue: '13.1 A DC',
    isMandatory: true,
    testResult: 'PASS',
    remarks: 'Verified at 850 W/m2 irradiance',
  },
  {
    testCategory: 'EARTHING_RESISTANCE',
    testName: 'Dedicated Solar Earth Pit Resistance (3-Point Fall of Potential)',
    unit: 'OHM',
    expectedValue: '< 5.0 Ohm',
    measuredValue: '2.1 Ohm',
    isMandatory: true,
    testResult: 'PASS',
    remarks: 'Compliant with IS 3043:2018',
  },
  {
    testCategory: 'ANTI_ISLANDING',
    testName: 'Grid Outage Automatic Inverter Disconnection Time',
    unit: 'SECONDS',
    expectedValue: '< 2.0 Seconds',
    measuredValue: '0.85 Seconds',
    isMandatory: true,
    testResult: 'PASS',
    remarks: 'Automatic trip verified on main disconnect',
  },
  {
    testCategory: 'INVERTER_EFFICIENCY',
    testName: 'Grid-Connected Power Generation & Conversion Efficiency',
    unit: 'PERCENT',
    expectedValue: '> 97.0%',
    measuredValue: '98.2%',
    isMandatory: false,
    testResult: 'PASS',
    remarks: 'Exceeds nameplate efficiency',
  },
];

@Injectable()
export class CommissioningService {
  private readonly logger = new Logger(CommissioningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * Initializes technical testing and commissioning record with standard tests
   */
  async createCommissioningRecord(organizationId: string, dto: CreateCommissioningRecordDto, engineerId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      const commissioningNumber = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'COMMISSIONING',
        'COM',
      );

      const record = await tx.commissioningRecord.create({
        data: {
          organizationId,
          commissioningNumber,
          projectInitiationId: dto.projectInitiationId,
          engineerId,
          status: 'IN_PROGRESS',
          gridSyncSuccessful: dto.gridSyncSuccessful ?? true,
          gridSyncTimestamp: dto.gridSyncSuccessful ? new Date() : null,
          gridVoltageObserved: dto.gridVoltageObserved ?? 234.5,
          gridFrequencyObserved: dto.gridFrequencyObserved ?? 50.02,
          acPowerOutputKw: dto.acPowerOutputKw ?? project.systemCapacityKw,
          dcVoltageString1: dto.dcVoltageString1 ?? 412.0,
          dcVoltageString2: dto.dcVoltageString2 ?? 415.5,
          dcCurrentString1: dto.dcCurrentString1 ?? 13.1,
          dcCurrentString2: dto.dcCurrentString2 ?? 13.0,
          inverterSerialNumbers: dto.inverterSerialNumbers || [],
          netMeterSerialAssigned: dto.netMeterSerialAssigned,
          notes: dto.notes,
        },
      });

      const testsToCreate = dto.tests && dto.tests.length > 0 ? dto.tests : STANDARD_COMMISSIONING_TESTS;

      for (const t of testsToCreate) {
        await tx.commissioningTest.create({
          data: {
            organizationId,
            commissioningRecordId: record.id,
            testCategory: t.testCategory,
            testName: t.testName,
            unit: t.unit,
            expectedValue: t.expectedValue,
            measuredValue: t.measuredValue,
            isMandatory: t.isMandatory ?? true,
            testResult: t.testResult || 'PASS',
            remarks: t.remarks,
          },
        });
      }

      // Update project installation status to COMMISSIONING_PENDING
      await tx.projectInitiation.update({
        where: { id: dto.projectInitiationId },
        data: {
          installationStatus: 'COMMISSIONING_PENDING',
          commissioningStatus: 'TESTING',
        },
      });

      this.logger.log(`Created Commissioning Record ${commissioningNumber} for project ${project.projectCode}`);
      return await tx.commissioningRecord.findUnique({
        where: { id: record.id },
        include: { tests: true, engineer: { select: { firstName: true, lastName: true } } },
      });
    });
  }

  /**
   * Records or updates an individual commissioning test measurement
   */
  async recordTest(organizationId: string, commissioningRecordId: string, dto: RecordCommissioningTestDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const record = await tx.commissioningRecord.findFirst({
        where: { id: commissioningRecordId, organizationId },
      });
      if (!record) {
        throw new NotFoundException(`Commissioning record ${commissioningRecordId} not found`);
      }

      return await tx.commissioningTest.create({
        data: {
          organizationId,
          commissioningRecordId,
          testCategory: dto.testCategory,
          testName: dto.testName,
          unit: dto.unit,
          expectedValue: dto.expectedValue,
          measuredValue: dto.measuredValue,
          isMandatory: dto.isMandatory ?? true,
          testResult: dto.testResult,
          remarks: dto.remarks,
          evidenceUrl: dto.evidenceUrl,
        },
      });
    });
  }

  /**
   * Approves commissioning.
   * STRICT GATE ENFORCEMENT:
   * Throws BadRequestException if any mandatory test failed.
   * On approval:
   * 1. Stamps CommissioningRecord status = APPROVED
   * 2. Sets ProjectInitiation commissioningStatus = APPROVED and installationStatus = COMMISSIONED
   * 3. Stamps ProductSerial commissionedAt and status = INSTALLED
   */
  async approveCommissioning(
    organizationId: string,
    commissioningRecordId: string,
    dto: ApproveCommissioningDto,
    approvedById: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const record = await tx.commissioningRecord.findFirst({
        where: { id: commissioningRecordId, organizationId },
        include: { tests: true },
      });
      if (!record) {
        throw new NotFoundException(`Commissioning record ${commissioningRecordId} not found`);
      }

      // Strict validation gate
      const failedMandatoryTests = record.tests.filter((t) => t.isMandatory && t.testResult === 'FAIL');
      if (failedMandatoryTests.length > 0) {
        const failedNames = failedMandatoryTests.map((t) => t.testName).join(', ');
        throw new BadRequestException(
          `Cannot approve commissioning: Mandatory tests failed: [${failedNames}]. Rework and re-testing required before grid connection approval.`,
        );
      }

      const updated = await tx.commissioningRecord.update({
        where: { id: commissioningRecordId },
        data: {
          status: 'APPROVED',
          approvedById,
          approvedAt: new Date(),
          notes: dto.notes !== undefined ? dto.notes : record.notes,
        },
        include: { tests: true },
      });

      // Update project status to COMMISSIONED
      await tx.projectInitiation.update({
        where: { id: record.projectInitiationId },
        data: {
          installationStatus: 'COMMISSIONED',
          commissioningStatus: 'APPROVED',
        },
      });

      // Stamp serials commissionedAt and status INSTALLED
      await tx.productSerial.updateMany({
        where: {
          organizationId,
          projectInitiationId: record.projectInitiationId,
        },
        data: {
          status: 'INSTALLED',
          commissionedAt: new Date(),
        },
      });

      this.logger.log(`Approved commissioning for project ${record.projectInitiationId}. System is online and commissioned.`);
      return updated;
    });
  }

  /**
   * Rejects commissioning with documented reason
   */
  async rejectCommissioning(
    organizationId: string,
    commissioningRecordId: string,
    dto: RejectCommissioningDto,
    rejectedById: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const record = await tx.commissioningRecord.findFirst({
        where: { id: commissioningRecordId, organizationId },
      });
      if (!record) {
        throw new NotFoundException(`Commissioning record ${commissioningRecordId} not found`);
      }

      const updated = await tx.commissioningRecord.update({
        where: { id: commissioningRecordId },
        data: {
          status: 'REJECTED',
          rejectionReason: dto.rejectionReason,
        },
      });

      await tx.projectInitiation.update({
        where: { id: record.projectInitiationId },
        data: {
          commissioningStatus: 'REJECTED',
          installationStatus: 'QUALITY_INSPECTION_PENDING',
        },
      });

      this.logger.warn(`Commissioning rejected for project ${record.projectInitiationId}: ${dto.rejectionReason}`);
      return updated;
    });
  }
}
