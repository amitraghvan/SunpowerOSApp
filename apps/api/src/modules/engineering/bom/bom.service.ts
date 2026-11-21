import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NumberingService } from '../../../common/services/numbering.service';
import { BOMCategory, BOMStatus } from '@solaros/types';

@Injectable()
export class BomService {
  private readonly logger = new Logger(BomService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * Generates a topology-complete Bill of Materials from an Engineering Design Revision
   */
  async generateBomForDesignRevision(
    organizationId: string,
    designId: string,
    revisionNumber: number,
    userId?: string,
  ) {
    const bomNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'BOM',
      'BOM',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const design = await tx.engineeringDesign.findFirst({
        where: { id: designId, organizationId },
        include: {
          revisions: {
            where: { revisionNumber },
            include: {
              panelVariant: { include: { product: true } },
              inverterVariant: { include: { product: true } },
              batteryVariant: { include: { product: true } },
              structureVariant: { include: { product: true } },
            },
          },
        },
      });

      if (!design) {
        throw new NotFoundException(`Engineering Design ${designId} not found`);
      }

      const revision = design.revisions[0];
      if (!revision) {
        throw new NotFoundException(`Design revision ${revisionNumber} not found for design ${designId}`);
      }

      if (revision.totalDcCapacityKw.toNumber() <= 0) {
        throw new BadRequestException('Cannot generate BOM for a revision with zero DC capacity. Run technical sizing first.');
      }

      const items: Array<{
        category: string;
        variantId?: string | null;
        itemCode: string;
        description: string;
        quantity: number;
        uom: string;
        wastageAllowancePercent: number;
        effectiveQuantity: number;
        unitCost: number;
        totalCost: number;
      }> = [];

      // 1. SOLAR_GENERATION: PV Modules
      if (revision.panelVariant) {
        const qty = revision.moduleQuantity;
        const unitCost = revision.panelVariant.costPrice.toNumber();
        items.push({
          category: BOMCategory.SOLAR_GENERATION,
          variantId: revision.panelVariantId,
          itemCode: revision.panelVariant.sku,
          description: `${revision.panelVariant.product.name} ${revision.moduleRatedPowerWatts?.toString()}W Mono PERC/TopCon Module`,
          quantity: qty,
          uom: 'NOS',
          wastageAllowancePercent: 0,
          effectiveQuantity: qty,
          unitCost,
          totalCost: qty * unitCost,
        });
      }

      // 2. POWER_CONVERSION: Inverters
      if (revision.inverterVariant) {
        const qty = revision.inverterQuantity;
        const unitCost = revision.inverterVariant.costPrice.toNumber();
        items.push({
          category: BOMCategory.POWER_CONVERSION,
          variantId: revision.inverterVariantId,
          itemCode: revision.inverterVariant.sku,
          description: `${revision.inverterVariant.product.name} ${revision.inverterRatedPowerKw?.toString()}kW On-Grid/Hybrid Inverter`,
          quantity: qty,
          uom: 'NOS',
          wastageAllowancePercent: 0,
          effectiveQuantity: qty,
          unitCost,
          totalCost: qty * unitCost,
        });
      }

      // 3. STORAGE: Batteries (if applicable)
      if (revision.batteryVariant && (revision.batteryQuantity ?? 0) > 0) {
        const qty = revision.batteryQuantity!;
        const unitCost = revision.batteryVariant.costPrice.toNumber();
        items.push({
          category: BOMCategory.STORAGE,
          variantId: revision.batteryVariantId,
          itemCode: revision.batteryVariant.sku,
          description: `${revision.batteryVariant.product.name} ${revision.batteryCapacityKwh?.toString()}kWh Storage Unit`,
          quantity: qty,
          uom: 'NOS',
          wastageAllowancePercent: 0,
          effectiveQuantity: qty,
          unitCost,
          totalCost: qty * unitCost,
        });
      }

      // 4. MOUNTING: Structures & Fasteners
      const structureQty = Math.ceil(revision.moduleQuantity / 2);
      const structureCostPerTable = 1450.0;
      items.push({
        category: BOMCategory.MOUNTING,
        variantId: revision.structureVariantId ?? null,
        itemCode: revision.structureVariant?.sku ?? 'STR-ALUM-ELEV',
        description: `Elevated HDGI / Anodized Aluminum Mounting Structure with ${revision.tiltDegrees?.toString() || '15'}° Tilt`,
        quantity: structureQty,
        uom: 'SET',
        wastageAllowancePercent: 0,
        effectiveQuantity: structureQty,
        unitCost: structureCostPerTable,
        totalCost: structureQty * structureCostPerTable,
      });

      const clampsQty = revision.moduleQuantity * 4;
      items.push({
        category: BOMCategory.MOUNTING,
        itemCode: 'FAST-SS304-CLAMPS',
        description: 'SS304 Mid & End Clamps with EPDM Rubber Padding and SS Allen Bolts',
        quantity: clampsQty,
        uom: 'NOS',
        wastageAllowancePercent: 5.0,
        effectiveQuantity: Math.ceil(clampsQty * 1.05),
        unitCost: 45.0,
        totalCost: Math.ceil(clampsQty * 1.05) * 45.0,
      });

      // 5. ELECTRICAL_BOS: Cables, Distribution Boxes, Protection
      const dcCableLengthMeters = Math.max(30, revision.moduleQuantity * 5);
      const dcCableSize = revision.dcCableSizeSqMm?.toNumber() ?? 4.0;
      items.push({
        category: BOMCategory.ELECTRICAL_BOS,
        itemCode: `CBL-DC-${dcCableSize}SQMM`,
        description: `TUV Certified 1.5kV Cu Solar DC Cable ${dcCableSize} sq.mm (Red & Black)`,
        quantity: dcCableLengthMeters,
        uom: 'METERS',
        wastageAllowancePercent: 8.0,
        effectiveQuantity: Math.ceil(dcCableLengthMeters * 1.08),
        unitCost: 55.0,
        totalCost: Math.ceil(dcCableLengthMeters * 1.08) * 55.0,
      });

      const acCableLengthMeters = 25;
      const acCableSize = revision.acCableSizeSqMm?.toNumber() ?? 4.0;
      items.push({
        category: BOMCategory.ELECTRICAL_BOS,
        itemCode: `CBL-AC-${acCableSize}SQMM`,
        description: `4-Core / 3-Core Copper Armoured AC Cable ${acCableSize} sq.mm (IS 1554)`,
        quantity: acCableLengthMeters,
        uom: 'METERS',
        wastageAllowancePercent: 5.0,
        effectiveQuantity: Math.ceil(acCableLengthMeters * 1.05),
        unitCost: 110.0,
        totalCost: Math.ceil(acCableLengthMeters * 1.05) * 110.0,
      });

      items.push({
        category: BOMCategory.ELECTRICAL_BOS,
        itemCode: 'AJB-DCDB-1000V',
        description: `Solar DCDB IP65 Enclosure with 1000V Type II SPD and ${revision.fuseRatingAmps?.toString() || '15'}A DC Fuses`,
        quantity: 1,
        uom: 'NOS',
        wastageAllowancePercent: 0,
        effectiveQuantity: 1,
        unitCost: 3200.0,
        totalCost: 3200.0,
      });

      items.push({
        category: BOMCategory.ELECTRICAL_BOS,
        itemCode: 'ACDB-IP65-MCB',
        description: `Solar ACDB IP65 Enclosure with ${revision.mainMcbRatingAmps?.toString() || '32'}A MCB and Type II AC SPD`,
        quantity: 1,
        uom: 'NOS',
        wastageAllowancePercent: 0,
        effectiveQuantity: 1,
        unitCost: 3800.0,
        totalCost: 3800.0,
      });

      const earthingPits = revision.earthingRodCount ?? 2;
      items.push({
        category: BOMCategory.ELECTRICAL_BOS,
        itemCode: 'EARTH-CP-ROD',
        description: 'Copper Bonded Chemical Earthing Electrode (17.2mm x 3m) with 25kg Compound Bag',
        quantity: earthingPits,
        uom: 'SET',
        wastageAllowancePercent: 0,
        effectiveQuantity: earthingPits,
        unitCost: 2800.0,
        totalCost: earthingPits * 2800.0,
      });

      items.push({
        category: BOMCategory.ELECTRICAL_BOS,
        itemCode: 'LA-COPPER-SPIKE',
        description: 'Solid Copper Multi-Spike Lightning Arrester with 1-meter Mast & Insulator',
        quantity: 1,
        uom: 'SET',
        wastageAllowancePercent: 0,
        effectiveQuantity: 1,
        unitCost: 2100.0,
        totalCost: 2100.0,
      });

      const mc4Pairs = Math.max(4, revision.stringCount * 2);
      items.push({
        category: BOMCategory.ELECTRICAL_BOS,
        itemCode: 'CONN-MC4-PAIR',
        description: 'IP68 1500V UV Resistant MC4 Solar Cable Connectors (Male + Female pair)',
        quantity: mc4Pairs,
        uom: 'SET',
        wastageAllowancePercent: 10.0,
        effectiveQuantity: Math.ceil(mc4Pairs * 1.1),
        unitCost: 65.0,
        totalCost: Math.ceil(mc4Pairs * 1.1) * 65.0,
      });

      // 6. SERVICES: Erection, Testing, Commissioning, Liaison
      const capacityKw = revision.totalDcCapacityKw.toNumber();
      items.push({
        category: BOMCategory.SERVICES,
        itemCode: 'SRV-INSTALL-MECH',
        description: 'Mechanical Structure Erection, Module Mounting, and Alignment Services',
        quantity: capacityKw,
        uom: 'LOT',
        wastageAllowancePercent: 0,
        effectiveQuantity: capacityKw,
        unitCost: 2500.0,
        totalCost: capacityKw * 2500.0,
      });

      items.push({
        category: BOMCategory.SERVICES,
        itemCode: 'SRV-INSTALL-ELEC',
        description: 'Electrical Cabling, Conduit Laying, Inverter Termination & Earth Pit Testing',
        quantity: capacityKw,
        uom: 'LOT',
        wastageAllowancePercent: 0,
        effectiveQuantity: capacityKw,
        unitCost: 2000.0,
        totalCost: capacityKw * 2000.0,
      });

      items.push({
        category: BOMCategory.SERVICES,
        itemCode: 'SRV-DISCOM-LIAISON',
        description: 'DISCOM Net Metering Application, CEIG / Electrical Inspectorate Liaison',
        quantity: 1,
        uom: 'LOT',
        wastageAllowancePercent: 0,
        effectiveQuantity: 1,
        unitCost: 4500.0,
        totalCost: 4500.0,
      });

      const totalMaterialCost = items.reduce((sum, item) => sum + item.totalCost, 0);

      const bom = await tx.billOfMaterials.create({
        data: {
          organizationId,
          bomNumber,
          designId,
          revisionNumber,
          version: 1,
          status: BOMStatus.DRAFT,
          totalMaterialCost,
          currency: 'INR',
          createdById: userId,
          notes: `Automated BOM generated for ${design.title} (${capacityKw} kWp DC)`,
          items: {
            create: items.map((i) => ({
              organizationId,
              category: i.category,
              variantId: i.variantId,
              itemCode: i.itemCode,
              description: i.description,
              quantity: i.quantity,
              uom: i.uom,
              wastageAllowancePercent: i.wastageAllowancePercent,
              effectiveQuantity: i.effectiveQuantity,
              unitCost: i.unitCost,
              totalCost: i.totalCost,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      await tx.engineeringDesignRevision.update({
        where: {
          designId_revisionNumber: {
            designId,
            revisionNumber,
          },
        },
        data: {
          bomGenerated: true,
        },
      });

      this.logger.log(`Created BOM ${bom.bomNumber} with ${bom.items.length} line items.`);
      return bom;
    });
  }

  /**
   * Approves and freezes a BOM
   */
  async approveBom(organizationId: string, bomId: string, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const bom = await tx.billOfMaterials.findFirst({
        where: { id: bomId, organizationId },
      });

      if (!bom) {
        throw new NotFoundException(`BOM ${bomId} not found`);
      }

      if (bom.status === BOMStatus.FROZEN || bom.status === BOMStatus.APPROVED) {
        return bom;
      }

      return await tx.billOfMaterials.update({
        where: { id: bomId },
        data: {
          status: BOMStatus.APPROVED,
          approvedById: userId,
          approvedAt: new Date(),
        },
        include: { items: true },
      });
    });
  }

  /**
   * Retrieves BOM by ID
   */
  async getBomById(organizationId: string, bomId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const bom = await tx.billOfMaterials.findFirst({
        where: { id: bomId, organizationId },
        include: {
          items: true,
          design: {
            include: {
              customer: true,
              site: true,
            },
          },
        },
      });

      if (!bom) {
        throw new NotFoundException(`BOM ${bomId} not found`);
      }

      return bom;
    });
  }
}
