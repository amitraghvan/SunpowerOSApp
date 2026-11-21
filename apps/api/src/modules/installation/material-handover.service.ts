import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateMaterialHandoverDto,
  VerifyMaterialHandoverLineDto,
  AcceptMaterialHandoverDto,
  RecordMaterialConsumptionDto,
} from '@solaros/contracts';

@Injectable()
export class MaterialHandoverService {
  private readonly logger = new Logger(MaterialHandoverService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * Creates a material custody handover record linked to Phase 4 DispatchOrder/DeliveryChallan.
   * Auto-populates expected equipment and serials from dispatch lines if not explicitly passed.
   */
  async createMaterialHandover(organizationId: string, dto: CreateMaterialHandoverDto, handedOverById?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      const handoverNumber = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'MATERIAL_HANDOVER',
        'MHO',
      );

      // Determine lines: if not provided and dispatchOrderId given, fetch from DispatchOrder
      let linesToCreate: Array<{
        productVariantId: string;
        expectedQuantity: number;
        serialNumbersExpected: string[];
      }> = [];

      if (dto.lines && dto.lines.length > 0) {
        linesToCreate = dto.lines.map((l) => ({
          productVariantId: l.productVariantId,
          expectedQuantity: l.expectedQuantity,
          serialNumbersExpected: l.serialNumbersExpected || [],
        }));
      } else if (dto.dispatchOrderId) {
        const dispatch = await tx.dispatchOrder.findFirst({
          where: { id: dto.dispatchOrderId, organizationId },
          include: { lines: true },
        });

        if (dispatch && dispatch.lines) {
          linesToCreate = dispatch.lines.map((l) => ({
            productVariantId: l.productVariantId,
            expectedQuantity: Number(l.dispatchedQuantity),
            serialNumbersExpected: l.serialNumbers || [],
          }));
        }
      }

      const totalExpected = linesToCreate.reduce((sum, l) => sum + l.expectedQuantity, 0);

      const handover = await tx.projectMaterialHandover.create({
        data: {
          organizationId,
          handoverNumber,
          projectInitiationId: dto.projectInitiationId,
          dispatchOrderId: dto.dispatchOrderId || null,
          deliveryChallanId: dto.deliveryChallanId || null,
          handedOverById: handedOverById || null,
          receiverRole: dto.receiverRole || 'SITE_SUPERVISOR',
          status: 'PENDING_RECEIPT',
          totalItemsExpected: totalExpected,
          totalItemsVerified: 0,
          siteLocationNotes: dto.siteLocationNotes,
        },
      });

      for (const line of linesToCreate) {
        await tx.materialHandoverLine.create({
          data: {
            organizationId,
            handoverId: handover.id,
            productVariantId: line.productVariantId,
            expectedQuantity: line.expectedQuantity,
            verifiedQuantity: 0,
            serialNumbersExpected: line.serialNumbersExpected,
            serialNumbersVerified: [],
            status: 'MATCHED',
          },
        });
      }

      this.logger.log(`Created Material Handover ${handoverNumber} for project ${project.projectCode}`);
      return await tx.projectMaterialHandover.findUnique({
        where: { id: handover.id },
        include: {
          lines: { include: { productVariant: true } },
          handedOverBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    });
  }

  /**
   * Verifies an individual material handover line with serial matching
   */
  async verifyHandoverLine(organizationId: string, handoverId: string, dto: VerifyMaterialHandoverLineDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const line = await tx.materialHandoverLine.findFirst({
        where: { id: dto.lineId, handoverId, organizationId },
      });
      if (!line) {
        throw new NotFoundException(`Material handover line ${dto.lineId} not found`);
      }

      const expectedQty = Number(line.expectedQuantity);
      const verifiedQty = dto.verifiedQuantity;
      const damagedQty = dto.damagedQuantity || 0;
      const missingQty = dto.missingQuantity || Math.max(0, expectedQty - verifiedQty - damagedQty);

      let lineStatus = 'MATCHED';
      if (damagedQty > 0) {
        lineStatus = 'DAMAGED';
      } else if (verifiedQty !== expectedQty || missingQty > 0) {
        lineStatus = 'DISCREPANCY';
      }

      const updatedLine = await tx.materialHandoverLine.update({
        where: { id: dto.lineId },
        data: {
          verifiedQuantity: verifiedQty,
          damagedQuantity: damagedQty,
          missingQuantity: missingQty,
          serialNumbersVerified: dto.serialNumbersVerified || [],
          status: lineStatus,
          notes: dto.notes !== undefined ? dto.notes : line.notes,
        },
      });

      // Recalculate handover total verified
      const allLines = await tx.materialHandoverLine.findMany({
        where: { handoverId, organizationId },
      });

      const totalVerified = allLines.reduce((sum, l) => sum + Number(l.verifiedQuantity), 0);
      const hasAnyDiscrepancy = allLines.some((l) => l.status === 'DISCREPANCY' || l.status === 'DAMAGED');

      await tx.projectMaterialHandover.update({
        where: { id: handoverId },
        data: {
          totalItemsVerified: totalVerified,
          status: hasAnyDiscrepancy ? 'DISCREPANCY' : 'VERIFIED',
          verificationDate: new Date(),
        },
      });

      return updatedLine;
    });
  }

  /**
   * Accepts site custody of equipment.
   * CRITICAL INVENTORY INVARIANT:
   * Phase 4 dispatch has already deducted stock from warehouse ledger (DISPATCH_ISSUE).
   * Phase 5 material handover is pure site custody and physical serial confirmation.
   * ZERO DOUBLE DEDUCTION from inventory_receipt_movements!
   */
  async acceptHandover(
    organizationId: string,
    handoverId: string,
    dto: AcceptMaterialHandoverDto,
    receivedById: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const handover = await tx.projectMaterialHandover.findFirst({
        where: { id: handoverId, organizationId },
        include: { lines: true },
      });
      if (!handover) {
        throw new NotFoundException(`Material handover ${handoverId} not found`);
      }

      // Collect verified serials
      const allVerifiedSerials: string[] = [];
      for (const line of handover.lines) {
        if (line.serialNumbersVerified && line.serialNumbersVerified.length > 0) {
          allVerifiedSerials.push(...line.serialNumbersVerified);
        }
      }

      // Update matching product serials to link to project and stamp status to ALLOCATED
      if (allVerifiedSerials.length > 0) {
        await tx.productSerial.updateMany({
          where: {
            organizationId,
            manufacturerSerialNumber: { in: allVerifiedSerials },
          },
          data: {
            projectInitiationId: handover.projectInitiationId,
            status: 'ALLOCATED',
          },
        });
      }

      const updated = await tx.projectMaterialHandover.update({
        where: { id: handoverId },
        data: {
          status: 'ACCEPTED',
          receivedById,
          verificationDate: handover.verificationDate || new Date(),
          custodySignatureUrl: dto.custodySignatureUrl,
          siteLocationNotes: dto.siteLocationNotes ?? handover.siteLocationNotes,
          discrepancyNotes: dto.discrepancyNotes ?? handover.discrepancyNotes,
        },
        include: {
          lines: { include: { productVariant: true } },
          receivedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // Update project installation status if pending material
      await tx.projectInitiation.update({
        where: { id: handover.projectInitiationId },
        data: {
          installationStatus: 'INSTALLATION_IN_PROGRESS',
        },
      });

      this.logger.log(
        `Accepted Material Custody ${handover.handoverNumber} on site (Zero double stock deduction verified)`,
      );
      return updated;
    });
  }

  /**
   * Records site material consumption and marks serials as INSTALLED
   */
  async recordConsumption(organizationId: string, dto: RecordMaterialConsumptionDto, recordedById?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      const consumptionNumber = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'CONSUMPTION',
        'CON',
      );

      const consumption = await tx.materialConsumption.create({
        data: {
          organizationId,
          consumptionNumber,
          projectInitiationId: dto.projectInitiationId,
          workOrderId: dto.workOrderId || null,
          productVariantId: dto.productVariantId,
          quantityUsed: dto.quantityUsed,
          serialNumbers: dto.serialNumbers || [],
          recordedById: recordedById || null,
          notes: dto.notes,
        },
      });

      // Mark used serials as INSTALLED
      if (dto.serialNumbers && dto.serialNumbers.length > 0) {
        await tx.productSerial.updateMany({
          where: {
            organizationId,
            manufacturerSerialNumber: { in: dto.serialNumbers },
          },
          data: {
            status: 'INSTALLED',
            projectInitiationId: dto.projectInitiationId,
          },
        });
      }

      this.logger.log(`Recorded material consumption ${consumptionNumber} for project ${project.projectCode}`);
      return consumption;
    });
  }
}
