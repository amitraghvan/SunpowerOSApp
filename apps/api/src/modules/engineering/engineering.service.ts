import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import { CompatibilityService } from './compatibility/compatibility.service';
import { BomService } from './bom/bom.service';
import {
  CreateDesignDto,
  ConfigureDesignRevisionDto,
  RunCalculationDto,
} from '@solaros/contracts';
import {
  EngineeringDesignStatus,
  DesignRevisionStatus,
  CompatibilityStatus,
  ComplianceStatus,
  SolarSystemType,
  ElectricalPhase,
} from '@solaros/types';
import {
  calculateDcSizing,
  calculateStringSizing,
  evaluateDcAcRatio,
  calculateBatterySizing,
  calculateCableAndProtection,
  calculateEnergyEstimation,
} from './calculations';

@Injectable()
export class EngineeringService {
  private readonly logger = new Logger(EngineeringService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
    private readonly compatibilityService: CompatibilityService,
    private readonly bomService: BomService,
  ) {}

  /**
   * 1. Create Engineering Design Header
   * Must reference a valid Customer, Site, and an Approved Site Survey
   */
  async createDesign(organizationId: string, dto: CreateDesignDto, userId?: string) {
    // 1. Generate Concurrency-Safe Design Number first
    const designNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'DESIGN',
      'DES',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const survey = await tx.survey.findFirst({
        where: {
          id: dto.surveyId,
          organizationId,
        },
        include: {
          site: true,
        },
      });

      if (!survey) {
        throw new NotFoundException(`Site Survey ${dto.surveyId} not found in this organization`);
      }

      if (survey.status !== 'APPROVED') {
        throw new BadRequestException(
          `Cannot create Engineering Design from unapproved survey. Current survey status is '${survey.status}'. An approved technical survey is required.`,
        );
      }

      if (survey.customerId !== dto.customerId) {
        throw new BadRequestException('Survey customer does not match the provided customer ID');
      }

      const design = await tx.engineeringDesign.create({
        data: {
          organizationId,
          designNumber,
          customerId: dto.customerId,
          siteId: dto.siteId,
          surveyId: dto.surveyId,
          title: dto.title,
          systemType: dto.systemType || SolarSystemType.ON_GRID,
          connectionType: dto.connectionType || survey.phaseType || ElectricalPhase.THREE_PHASE,
          status: EngineeringDesignStatus.DRAFT,
          activeRevisionNumber: 1,
          sanctionedLoadKw: survey.sanctionedLoadKw ?? survey.site?.sanctionedLoadKw ?? null,
          targetCapacityKw: dto.targetCapacityKw,
          createdById: userId,
          revisions: {
            create: {
              organizationId,
              revisionNumber: 1,
              status: DesignRevisionStatus.DRAFT,
              createdById: userId,
              tiltDegrees: survey.roofPitchDegrees ?? 15,
              azimuthDegrees: survey.roofAzimuthDegrees ?? 180,
            },
          },
        },
        include: {
          revisions: true,
          customer: true,
          site: true,
          survey: true,
        },
      });

      return design;
    });
  }

  /**
   * 2. Configure Technical Hardware for a Revision
   */
  async configureRevision(
    organizationId: string,
    designId: string,
    revisionNumber: number,
    dto: ConfigureDesignRevisionDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const design = await tx.engineeringDesign.findFirst({
        where: { id: designId, organizationId },
        include: {
          survey: true,
          revisions: { where: { revisionNumber } },
        },
      });

      if (!design) {
        throw new NotFoundException(`Engineering Design ${designId} not found`);
      }

      if (design.status === EngineeringDesignStatus.APPROVED) {
        throw new ForbiddenException('Cannot modify a design that has already been approved. Create a new revision.');
      }

      // Fetch Panel Variant
      const panelVariant = await tx.productVariant.findFirst({
        where: { id: dto.panelVariantId, organizationId },
        include: { product: true },
      });
      if (!panelVariant) {
        throw new NotFoundException(`Solar Panel Variant ${dto.panelVariantId} not found`);
      }

      // Fetch Inverter Variant
      const inverterVariant = await tx.productVariant.findFirst({
        where: { id: dto.inverterVariantId, organizationId },
        include: { product: true },
      });
      if (!inverterVariant) {
        throw new NotFoundException(`Solar Inverter Variant ${dto.inverterVariantId} not found`);
      }

      // Sizing calculations
      const panelWatts = panelVariant.ratedCapacityWatts?.toNumber() ?? 550;
      const dcSizing = calculateDcSizing({
        targetCapacityKw: design.targetCapacityKw.toNumber(),
        moduleRatedPowerWatts: panelWatts,
        usableAreaSqFt: design.survey.usableAreaSqFt?.toNumber(),
      });

      const moduleQuantity = dto.moduleQuantity && dto.moduleQuantity > 0 ? dto.moduleQuantity : dcSizing.moduleQuantity;
      const totalDcKw = (moduleQuantity * panelWatts) / 1000;

      const inverterKw = inverterVariant.ratedCapacityWatts
        ? inverterVariant.ratedCapacityWatts.toNumber() / 1000
        : (inverterVariant.systemVoltage?.toNumber() ? inverterVariant.systemVoltage.toNumber() / 100 : 5);
      const inverterQuantity = dto.inverterQuantity ?? 1;
      const totalAcKw = inverterQuantity * inverterKw;

      // Sizing ratio
      const dcAcEvaluation = evaluateDcAcRatio(totalDcKw, totalAcKw);

      // Update revision
      const updatedRevision = await tx.engineeringDesignRevision.upsert({
        where: {
          designId_revisionNumber: {
            designId,
            revisionNumber,
          },
        },
        create: {
          organizationId,
          designId,
          revisionNumber,
          status: DesignRevisionStatus.DRAFT,
          panelVariantId: dto.panelVariantId,
          moduleQuantity,
          moduleRatedPowerWatts: panelWatts,
          totalDcCapacityKw: totalDcKw,
          inverterVariantId: dto.inverterVariantId,
          inverterQuantity,
          inverterRatedPowerKw: inverterKw,
          totalAcCapacityKw: totalAcKw,
          batteryVariantId: dto.batteryVariantId,
          batteryQuantity: dto.batteryQuantity,
          structureVariantId: dto.structureVariantId,
          tiltDegrees: dto.tiltDegrees ?? design.survey.roofPitchDegrees ?? 15,
          azimuthDegrees: dto.azimuthDegrees ?? design.survey.roofAzimuthDegrees ?? 180,
          dcAcRatio: dcAcEvaluation.ratio,
          createdById: userId,
        },
        update: {
          panelVariantId: dto.panelVariantId,
          moduleQuantity,
          moduleRatedPowerWatts: panelWatts,
          totalDcCapacityKw: totalDcKw,
          inverterVariantId: dto.inverterVariantId,
          inverterQuantity,
          inverterRatedPowerKw: inverterKw,
          totalAcCapacityKw: totalAcKw,
          batteryVariantId: dto.batteryVariantId,
          batteryQuantity: dto.batteryQuantity,
          structureVariantId: dto.structureVariantId,
          tiltDegrees: dto.tiltDegrees ?? design.survey.roofPitchDegrees ?? 15,
          azimuthDegrees: dto.azimuthDegrees ?? design.survey.roofAzimuthDegrees ?? 180,
          dcAcRatio: dcAcEvaluation.ratio,
        },
        include: {
          panelVariant: true,
          inverterVariant: true,
          batteryVariant: true,
        },
      });

      await tx.engineeringDesign.update({
        where: { id: designId },
        data: { status: EngineeringDesignStatus.CONFIGURING },
      });

      return updatedRevision;
    });
  }

  /**
   * 3. Run Pure Technical Calculations & Standards Compliance
   */
  async runCalculations(
    organizationId: string,
    designId: string,
    revisionNumber: number,
    dto: RunCalculationDto,
    userId?: string,
  ) {
    const startTime = Date.now();

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const design = await tx.engineeringDesign.findFirst({
        where: { id: designId, organizationId },
        include: {
          survey: { include: { site: true } },
          revisions: {
            where: { revisionNumber },
            include: {
              panelVariant: { include: { product: true } },
              inverterVariant: { include: { product: true } },
              batteryVariant: { include: { product: true } },
            },
          },
        },
      });

      if (!design) {
        throw new NotFoundException(`Engineering Design ${designId} not found`);
      }

      const revision = design.revisions[0];
      if (!revision || !revision.panelVariant || !revision.inverterVariant) {
        throw new BadRequestException('Revision must be configured with both solar module and inverter before running calculations.');
      }

      const panelWatts = revision.moduleRatedPowerWatts?.toNumber() ?? 550;
      const moduleQty = revision.moduleQuantity;
      const totalDcKw = revision.totalDcCapacityKw.toNumber();
      const inverterKw = revision.inverterRatedPowerKw?.toNumber() ?? 5;
      const inverterQty = revision.inverterQuantity;
      const totalAcKw = revision.totalAcCapacityKw.toNumber();

      // Electrical specs
      const voc = 50.2;
      const vmp = 42.1;
      const isc = 13.9;
      const imp = 13.1;
      const maxDcVoltage = 1000;
      const minMpptVoltage = 160;
      const maxMpptVoltage = 850;
      const mpptCount = 2;
      const maxInputCurrentPerMppt = 26;

      // 1. String Sizing
      const stringSizing = calculateStringSizing({
        moduleQuantity: moduleQty,
        moduleVoc: voc,
        moduleVmp: vmp,
        moduleIsc: isc,
        moduleImp: imp,
        inverterMaxDcVoltage: maxDcVoltage,
        inverterMinMpptVoltage: minMpptVoltage,
        inverterMaxMpptVoltage: maxMpptVoltage,
        inverterMpptCount: mpptCount,
        inverterMaxCurrentPerMppt: maxInputCurrentPerMppt,
        minDesignTempCelsius: dto.minDesignTempCelsius ?? 5,
        maxCellTempCelsius: dto.maxCellTempCelsius ?? 70,
      });

      // 2. DC/AC Ratio
      const dcAcEvaluation = evaluateDcAcRatio(totalDcKw, totalAcKw);

      // 3. Storage Sizing
      let batteryResult;
      if (design.systemType !== SolarSystemType.ON_GRID) {
        batteryResult = calculateBatterySizing({
          backupHours: 4,
          systemVoltage: 48,
        });
      }

      // 4. Conductor & Protection Sizing
      const cableProtection = calculateCableAndProtection({
        totalDcCapacityKw: totalDcKw,
        totalAcCapacityKw: totalAcKw,
        connectionType: design.connectionType as ElectricalPhase,
        distanceToMainPanelMeters: design.survey.distanceToMainPanelMeters?.toNumber() ?? 20,
        maxDcStringCurrentAmps: imp,
        stringVocCold: stringSizing.vocCold * stringSizing.modulesPerString,
      });

      // 5. Energy Generation & CO2 Yield
      const energyYield = calculateEnergyEstimation({
        totalDcCapacityKw: totalDcKw,
        dailyPeakSunHours: dto.dailyPeakSunHours ?? 4.8,
        performanceRatioPercent: 78.0,
      });

      // 6. Compatibility & Compliance Evaluation
      const compatibility = this.compatibilityService.evaluateCompatibility(
        {
          systemType: design.systemType as SolarSystemType,
          connectionType: design.connectionType as ElectricalPhase,
          targetCapacityKw: design.targetCapacityKw.toNumber(),
          panel: {
            variantId: revision.panelVariantId!,
            sku: revision.panelVariant.sku,
            ratedPowerWatts: panelWatts,
            voc,
            vmp,
            isc,
            imp,
          },
          inverter: {
            variantId: revision.inverterVariantId!,
            sku: revision.inverterVariant.sku,
            ratedPowerKw: inverterKw,
            mpptCount,
            maxDcVoltage,
            minMpptVoltage,
            maxMpptVoltage,
            maxInputCurrentPerMppt,
            maxShortCircuitCurrentPerMppt: 32,
            isHybrid: design.systemType !== SolarSystemType.ON_GRID,
            phase: design.connectionType as ElectricalPhase,
          },
        },
        stringSizing.vocCold * stringSizing.modulesPerString,
        stringSizing.vmpHot * stringSizing.modulesPerString,
        imp,
        design.survey.roofType ?? undefined,
      );

      const complianceStatus = compatibility.violations.length > 0
        ? ComplianceStatus.FAILED
        : compatibility.warnings.length > 0
        ? ComplianceStatus.WARNING
        : ComplianceStatus.PASSED;

      const executionTimeMs = Date.now() - startTime;

      const outputSnapshot = {
        stringSizing,
        dcAcEvaluation,
        cableProtection,
        energyYield,
        batteryResult,
        compatibility,
      };

      await tx.calculationRun.create({
        data: {
          organizationId,
          designId,
          revisionNumber,
          engineVersion: '2.0.0',
          rulesetVersion: 'MNRE_CEA_2026',
          inputSnapshot: dto as any,
          outputSnapshot: outputSnapshot as any,
          warnings: compatibility.warnings,
          violations: compatibility.violations,
          passed: compatibility.violations.length === 0,
          executionTimeMs,
          executedById: userId,
        },
      });

      const updatedRev = await tx.engineeringDesignRevision.update({
        where: {
          designId_revisionNumber: {
            designId,
            revisionNumber,
          },
        },
        data: {
          stringCount: stringSizing.stringCount,
          modulesPerString: stringSizing.modulesPerString,
          mpptCount,
          mpptAllocations: stringSizing.mpptAllocations as any,
          dcAcRatio: dcAcEvaluation.ratio,
          estDailyGenerationKwh: energyYield.estDailyGenerationKwh,
          estAnnualGenerationKwh: energyYield.estAnnualGenerationKwh,
          specificYieldKwhPerKwp: energyYield.specificYieldKwhPerKwp,
          performanceRatioPercent: energyYield.performanceRatioPercent,
          co2SavedTonsAnnual: energyYield.co2SavedTonsAnnual,
          dcCableSizeSqMm: cableProtection.dcCableSizeSqMm,
          acCableSizeSqMm: cableProtection.acCableSizeSqMm,
          dcDropPercent: cableProtection.dcVoltageDropPercent,
          acDropPercent: cableProtection.acVoltageDropPercent,
          mainMcbRatingAmps: cableProtection.acMcbRatingAmps,
          spdRating: cableProtection.dcSpdRating,
          fuseRatingAmps: cableProtection.dcFuseRatingAmps,
          earthingRodCount: cableProtection.earthingPitsCount,
          compatibilityStatus: compatibility.overallStatus,
          complianceStatus,
          validationReport: {
            evaluations: compatibility.evaluations,
            warnings: compatibility.warnings,
            violations: compatibility.violations,
          } as any,
          status: DesignRevisionStatus.SUBMITTED,
        },
      });

      await tx.engineeringDesign.update({
        where: { id: designId },
        data: { status: EngineeringDesignStatus.CALCULATING },
      });

      return {
        revision: updatedRev,
        output: outputSnapshot,
      };
    });
  }

  /**
   * 4. Approve Engineering Design
   */
  async approveDesign(organizationId: string, designId: string, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const design = await tx.engineeringDesign.findFirst({
        where: { id: designId, organizationId },
        include: {
          revisions: {
            orderBy: { revisionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (!design) {
        throw new NotFoundException(`Engineering Design ${designId} not found`);
      }

      const latestRevision = design.revisions[0];
      if (!latestRevision) {
        throw new BadRequestException('Design has no revisions');
      }

      if (latestRevision.compatibilityStatus === CompatibilityStatus.INCOMPATIBLE) {
        throw new BadRequestException(
          'Cannot approve an engineering design with INCOMPATIBLE hardware or critical safety violations.',
        );
      }

      await tx.engineeringDesignRevision.update({
        where: {
          designId_revisionNumber: {
            designId,
            revisionNumber: latestRevision.revisionNumber,
          },
        },
        data: { status: DesignRevisionStatus.APPROVED },
      });

      const approvedDesign = await tx.engineeringDesign.update({
        where: { id: designId },
        data: {
          status: EngineeringDesignStatus.APPROVED,
          approvedById: userId,
          approvedAt: new Date(),
        },
        include: {
          customer: true,
          site: true,
          survey: true,
          revisions: true,
        },
      });

      return approvedDesign;
    });
  }

  /**
   * 5. Get Design by ID
   */
  async getDesign(organizationId: string, designId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const design = await tx.engineeringDesign.findFirst({
        where: { id: designId, organizationId },
        include: {
          customer: true,
          site: true,
          survey: true,
          revisions: {
            include: {
              panelVariant: { include: { product: true } },
              inverterVariant: { include: { product: true } },
              batteryVariant: { include: { product: true } },
              structureVariant: { include: { product: true } },
            },
            orderBy: { revisionNumber: 'desc' },
          },
          calculationRuns: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          boms: {
            include: { items: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!design) {
        throw new NotFoundException(`Engineering Design ${designId} not found`);
      }

      return design;
    });
  }

  /**
   * 6. List Designs for Tenant
   */
  async listDesigns(organizationId: string, query?: { customerId?: string; status?: string }) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (query?.customerId) where.customerId = query.customerId;
      if (query?.status) where.status = query.status;

      return await tx.engineeringDesign.findMany({
        where,
        include: {
          customer: true,
          site: true,
          revisions: {
            orderBy: { revisionNumber: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }
}
