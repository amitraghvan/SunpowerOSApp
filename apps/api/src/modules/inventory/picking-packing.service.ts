import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreatePickingOrderDto,
  ConfirmPickingOrderDto,
  CreatePackingOrderDto,
  ConfirmPackingOrderDto,
} from '@solaros/contracts';
import {
  PickingOrderStatus,
  PackingOrderStatus,
} from '@solaros/types';

@Injectable()
export class PickingPackingService {
  private readonly logger = new Logger(PickingPackingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  // ===========================================================================
  // 1. MATERIAL PICKING
  // ===========================================================================

  async createPickingOrder(organizationId: string, dto: CreatePickingOrderDto, userId?: string) {
    const pickingNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'PICKING',
      'PCK',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      let linesData: any[] = [];
      let salesOrderId = dto.salesOrderId;
      let projectInitiationId = dto.projectInitiationId;

      // If reservationId is supplied, auto-populate lines from reservation lines
      if (dto.reservationId) {
        const reservation = await tx.stockReservation.findFirst({
          where: { id: dto.reservationId, organizationId },
          include: { lines: true },
        });

        if (!reservation) throw new NotFoundException(`Reservation ${dto.reservationId} not found`);

        salesOrderId = reservation.salesOrderId || undefined;
        projectInitiationId = reservation.projectInitiationId || undefined;

        linesData = reservation.lines.map((rl) => ({
          organizationId,
          reservationLineId: rl.id,
          productVariantId: rl.productVariantId,
          locationId: rl.locationId,
          requiredQuantity: Number(rl.quantityReserved),
          pickedQuantity: 0,
          shortageQuantity: 0,
          scannedSerials: [],
          status: 'PENDING',
        }));
      }

      const pickingOrder = await tx.pickingOrder.create({
        data: {
          organizationId,
          pickingNumber,
          reservationId: dto.reservationId,
          salesOrderId,
          projectInitiationId,
          warehouseId: dto.warehouseId,
          status: PickingOrderStatus.READY,
          notes: dto.notes,
          pickedById: userId,
          lines: {
            create: linesData,
          },
        },
        include: {
          lines: {
            include: { productVariant: { select: { sku: true, name: true } } },
          },
          warehouse: { select: { code: true, name: true } },
        },
      });

      this.logger.log(`Created picking order ${pickingNumber}`);
      return pickingOrder;
    });
  }

  async confirmPicking(
    organizationId: string,
    pickingId: string,
    dto: ConfirmPickingOrderDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const picking = await tx.pickingOrder.findFirst({
        where: { id: pickingId, organizationId },
        include: { lines: true },
      });

      if (!picking) throw new NotFoundException(`Picking order ${pickingId} not found`);

      let totalLines = picking.lines.length;
      let fullyPickedCount = 0;

      for (const lineConfirm of dto.lines) {
        const line = picking.lines.find((l) => l.id === lineConfirm.pickingOrderLineId);
        if (!line) {
          throw new BadRequestException(`Picking line ${lineConfirm.pickingOrderLineId} not found`);
        }

        const pickedQty = Number(lineConfirm.pickedQuantity);
        const reqQty = Number(line.requiredQuantity);

        if (pickedQty > reqQty) {
          throw new BadRequestException(
            `Cannot pick more than reserved quantity: picked ${pickedQty} > required ${reqQty}`,
          );
        }

        const shortageQty = Math.max(0, reqQty - pickedQty);
        const lineStatus = shortageQty === 0 ? 'PICKED' : 'SHORT_PICKED';

        if (lineStatus === 'PICKED') fullyPickedCount++;

        // Update serials if scanned
        if (lineConfirm.scannedSerials && lineConfirm.scannedSerials.length > 0) {
          await tx.productSerial.updateMany({
            where: {
              organizationId,
              manufacturerSerialNumber: { in: lineConfirm.scannedSerials },
            },
            data: {
              status: 'PICKED',
            },
          });
        }

        // Update reservation line quantityPicked if connected
        if (line.reservationLineId) {
          await tx.stockReservationLine.update({
            where: { id: line.reservationLineId },
            data: {
              quantityPicked: { increment: pickedQty },
            },
          });
        }

        await tx.pickingOrderLine.update({
          where: { id: line.id },
          data: {
            pickedQuantity: pickedQty,
            shortageQuantity: shortageQty,
            scannedSerials: lineConfirm.scannedSerials || [],
            batchNumber: lineConfirm.batchNumber,
            status: lineStatus,
          },
        });
      }

      const overallStatus =
        fullyPickedCount === totalLines ? PickingOrderStatus.PICKED : PickingOrderStatus.PARTIALLY_PICKED;

      const updated = await tx.pickingOrder.update({
        where: { id: pickingId },
        data: {
          status: overallStatus,
          completedAt: new Date(),
          pickedById: userId || picking.pickedById,
          notes: dto.notes || picking.notes,
        },
        include: {
          lines: {
            include: { productVariant: { select: { sku: true, name: true } } },
          },
        },
      });

      this.logger.log(`Confirmed picking order ${picking.pickingNumber}: ${overallStatus}`);
      return updated;
    });
  }

  async listPickingOrders(
    organizationId: string,
    filters?: { warehouseId?: string; status?: string; search?: string },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
      if (filters?.status) where.status = filters.status;
      if (filters?.search) {
        where.pickingNumber = { contains: filters.search, mode: 'insensitive' };
      }

      return await tx.pickingOrder.findMany({
        where,
        include: {
          warehouse: { select: { code: true, name: true } },
          salesOrder: { select: { orderNumber: true } },
          projectInitiation: { select: { projectCode: true, projectName: true } },
          _count: { select: { lines: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async getPickingOrder(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const picking = await tx.pickingOrder.findFirst({
        where: { id, organizationId },
        include: {
          warehouse: true,
          salesOrder: true,
          projectInitiation: true,
          lines: {
            include: {
              productVariant: { include: { product: true } },
              location: true,
            },
          },
        },
      });

      if (!picking) throw new NotFoundException(`Picking order ${id} not found`);
      return picking;
    });
  }

  // ===========================================================================
  // 2. PACKING WORKSPACE
  // ===========================================================================

  async createPackingOrder(organizationId: string, dto: CreatePackingOrderDto, userId?: string) {
    const packingNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'PACKING',
      'PAK',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      let linesData: any[] = [];
      let salesOrderId = dto.salesOrderId;
      let projectInitiationId = dto.projectInitiationId;

      // Default solar checklist
      const defaultChecklist = [
        { item: 'Solar modules verified and inspected for micro-cracks', verified: false },
        { item: 'Inverter model, wattage, and accessories checked', verified: false },
        { item: 'Battery units and BMS verified (if applicable)', verified: false },
        { item: 'BOS mounting rails, clamps, and fasteners counted', verified: false },
        { item: 'DC/AC surge protection devices and cables verified', verified: false },
        { item: 'Serial numbers scanned and verified', verified: false },
        { item: 'Delivery challan and safety manuals enclosed', verified: false },
        { item: 'Final box strapping and weather-proof packaging complete', verified: false },
      ];

      if (dto.pickingOrderId) {
        const picking = await tx.pickingOrder.findFirst({
          where: { id: dto.pickingOrderId, organizationId },
          include: { lines: true },
        });

        if (!picking) throw new NotFoundException(`Picking order ${dto.pickingOrderId} not found`);
        salesOrderId = picking.salesOrderId || undefined;
        projectInitiationId = picking.projectInitiationId || undefined;

        linesData = picking.lines.map((pl) => ({
          organizationId,
          productVariantId: pl.productVariantId,
          packedQuantity: Number(pl.pickedQuantity),
          boxNumber: 'BOX-01',
          scannedSerials: pl.scannedSerials || [],
          batchNumber: pl.batchNumber,
        }));
      }

      const packingOrder = await tx.packingOrder.create({
        data: {
          organizationId,
          packingNumber,
          pickingOrderId: dto.pickingOrderId,
          salesOrderId,
          projectInitiationId,
          warehouseId: dto.warehouseId,
          status: PackingOrderStatus.PACKING_IN_PROGRESS,
          packageCount: dto.packageCount || 1,
          totalWeightKg: dto.totalWeightKg,
          dimensions: dto.dimensions,
          checklistResults: dto.checklistResults || defaultChecklist,
          notes: dto.notes,
          packedById: userId,
          lines: {
            create: linesData,
          },
        },
        include: {
          lines: {
            include: { productVariant: { select: { sku: true, name: true } } },
          },
          warehouse: { select: { code: true, name: true } },
        },
      });

      this.logger.log(`Created packing order ${packingNumber}`);
      return packingOrder;
    });
  }

  async confirmPacking(
    organizationId: string,
    packingId: string,
    dto: ConfirmPackingOrderDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const packing = await tx.packingOrder.findFirst({
        where: { id: packingId, organizationId },
      });

      if (!packing) throw new NotFoundException(`Packing order ${packingId} not found`);

      // Verify mandatory checklist completion
      const checklist = (dto.checklistResults || (packing.checklistResults as any[])) || [];
      const unverified = checklist.filter((item: any) => !item.verified);

      if (unverified.length > 0) {
        throw new BadRequestException(
          `Cannot confirm packing: ${unverified.length} checklist item(s) are still unverified.`,
        );
      }

      const updated = await tx.packingOrder.update({
        where: { id: packingId },
        data: {
          status: PackingOrderStatus.VERIFIED,
          packageCount: dto.packageCount || packing.packageCount,
          totalWeightKg: dto.totalWeightKg || packing.totalWeightKg,
          dimensions: dto.dimensions || packing.dimensions,
          checklistResults: checklist,
          verifiedById: userId,
          verifiedAt: new Date(),
          notes: dto.notes || packing.notes,
        },
        include: {
          lines: {
            include: { productVariant: { select: { sku: true, name: true } } },
          },
        },
      });

      this.logger.log(`Confirmed and verified packing order ${packing.packingNumber}`);
      return updated;
    });
  }

  async listPackingOrders(
    organizationId: string,
    filters?: { warehouseId?: string; status?: string; search?: string },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
      if (filters?.status) where.status = filters.status;
      if (filters?.search) {
        where.packingNumber = { contains: filters.search, mode: 'insensitive' };
      }

      return await tx.packingOrder.findMany({
        where,
        include: {
          warehouse: { select: { code: true, name: true } },
          salesOrder: { select: { orderNumber: true } },
          projectInitiation: { select: { projectCode: true, projectName: true } },
          verifiedBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { lines: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async getPackingOrder(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const packing = await tx.packingOrder.findFirst({
        where: { id, organizationId },
        include: {
          warehouse: true,
          salesOrder: true,
          projectInitiation: true,
          pickingOrder: true,
          packedBy: { select: { id: true, firstName: true, lastName: true } },
          verifiedBy: { select: { id: true, firstName: true, lastName: true } },
          lines: {
            include: {
              productVariant: { include: { product: true } },
            },
          },
        },
      });

      if (!packing) throw new NotFoundException(`Packing order ${id} not found`);
      return packing;
    });
  }
}
