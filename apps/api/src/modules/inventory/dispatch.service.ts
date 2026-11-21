import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import { StockService } from './stock.service';
import {
  CreateDispatchOrderDto,
  CreateDeliveryChallanDto,
  ConfirmDeliveryDto,
} from '@solaros/contracts';
import {
  DispatchOrderStatus,
  ProofOfDeliveryStatus,
  MovementType,
  StockReservationStatus,
} from '@solaros/types';

@Injectable()
export class DispatchService {
  private readonly logger = new Logger(DispatchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
    private readonly stockService: StockService,
  ) {}

  // ===========================================================================
  // 1. DISPATCH ORDER CREATION & LIFECYCLE
  // ===========================================================================

  async createDispatchOrder(organizationId: string, dto: CreateDispatchOrderDto, userId?: string) {
    const dispatchNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'DISPATCH',
      'DSP',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      let linesData: any[] = [];

      if (dto.lines && dto.lines.length > 0) {
        linesData = dto.lines.map((l) => ({
          organizationId,
          productVariantId: l.productVariantId,
          dispatchedQuantity: Number(l.dispatchedQuantity),
          serialNumbers: l.serialNumbers || [],
          batchNumber: l.batchNumber,
        }));
      } else if (dto.packingOrderId) {
        const packing = await tx.packingOrder.findFirst({
          where: { id: dto.packingOrderId, organizationId },
          include: { lines: true },
        });

        if (!packing) throw new NotFoundException(`Packing order ${dto.packingOrderId} not found`);

        linesData = packing.lines.map((pl) => ({
          organizationId,
          productVariantId: pl.productVariantId,
          dispatchedQuantity: Number(pl.packedQuantity),
          serialNumbers: pl.scannedSerials || [],
          batchNumber: pl.batchNumber,
        }));
      } else {
        throw new BadRequestException('Either explicit lines or packingOrderId must be provided');
      }

      const dispatchOrder = await tx.dispatchOrder.create({
        data: {
          organizationId,
          dispatchNumber,
          salesOrderId: dto.salesOrderId,
          projectInitiationId: dto.projectInitiationId,
          warehouseId: dto.warehouseId,
          customerId: dto.customerId,
          packingOrderId: dto.packingOrderId,
          deliveryAddress: dto.deliveryAddress,
          status: DispatchOrderStatus.READY_FOR_DISPATCH,
          dispatchDate: new Date(),
          transporterName: dto.transporterName,
          vehicleNumber: dto.vehicleNumber,
          driverName: dto.driverName,
          driverPhone: dto.driverPhone,
          shippingNotes: dto.shippingNotes,
          lines: {
            create: linesData,
          },
        },
        include: {
          lines: {
            include: { productVariant: { select: { sku: true, name: true } } },
          },
          salesOrder: { select: { orderNumber: true } },
          customer: { select: { name: true, phone: true } },
          warehouse: { select: { code: true, name: true } },
        },
      });

      this.logger.log(`Created dispatch order ${dispatchNumber} for tenant ${organizationId}`);
      return dispatchOrder;
    });
  }

  async approveDispatchOrder(organizationId: string, dispatchId: string, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const dispatch = await tx.dispatchOrder.findFirst({
        where: { id: dispatchId, organizationId },
      });

      if (!dispatch) throw new NotFoundException(`Dispatch order ${dispatchId} not found`);
      if (dispatch.status !== DispatchOrderStatus.READY_FOR_DISPATCH && dispatch.status !== DispatchOrderStatus.DRAFT) {
        throw new BadRequestException(`Cannot approve dispatch order in status ${dispatch.status}`);
      }

      return await tx.dispatchOrder.update({
        where: { id: dispatchId },
        data: {
          status: DispatchOrderStatus.APPROVED,
          approvedById: userId,
          approvedAt: new Date(),
        },
      });
    });
  }

  /**
   * Posts the dispatch order:
   * 1. Transactionally updates stock ledger with DISPATCH_ISSUE movements
   * 2. Marks serial numbers as DISPATCHED
   * 3. Consumes active reservations
   * 4. Updates status to DISPATCHED
   * Idempotent & protected against duplicate stock deductions!
   */
  async postDispatchOrder(organizationId: string, dispatchId: string, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      // Row-level lock to prevent concurrent double posting
      await tx.$executeRawUnsafe(
        `SELECT "id" FROM "dispatch_orders" WHERE "id" = '${dispatchId}' AND "organizationId" = '${organizationId}' FOR UPDATE`,
      );

      const dispatch = await tx.dispatchOrder.findFirst({
        where: { id: dispatchId, organizationId },
        include: { lines: true },
      });

      if (!dispatch) throw new NotFoundException(`Dispatch order ${dispatchId} not found`);

      if (
        dispatch.status === DispatchOrderStatus.DISPATCHED ||
        dispatch.status === DispatchOrderStatus.IN_TRANSIT ||
        dispatch.status === DispatchOrderStatus.DELIVERED
      ) {
        throw new ConflictException(
          `Dispatch order ${dispatch.dispatchNumber} is already posted in status ${dispatch.status}. Duplicate stock reduction prevented!`,
        );
      }

      // Record outbound stock movements
      for (const line of dispatch.lines) {
        const qty = Number(line.dispatchedQuantity);

        await this.stockService.recordMovement(
          organizationId,
          {
            movementType: MovementType.DISPATCH_ISSUE,
            productVariantId: line.productVariantId,
            fromLocationId: null, // Out from warehouse
            toLocationId: null,
            quantity: qty,
            referenceType: 'DISPATCH',
            referenceId: dispatch.dispatchNumber,
            batchNumber: line.batchNumber,
            notes: `Dispatch order posted: ${dispatch.dispatchNumber}`,
            createdById: userId,
          },
          tx,
        );

        // Update serial numbers status
        if (line.serialNumbers && line.serialNumbers.length > 0) {
          await tx.productSerial.updateMany({
            where: {
              organizationId,
              manufacturerSerialNumber: { in: line.serialNumbers },
            },
            data: {
              status: 'DISPATCHED',
              activeDispatchOrderId: dispatch.id,
              storageLocationId: null,
            },
          });
        }
      }

      // Mark associated project reservation as CONSUMED if applicable
      if (dispatch.salesOrderId) {
        await tx.stockReservation.updateMany({
          where: {
            organizationId,
            salesOrderId: dispatch.salesOrderId,
            status: { in: [StockReservationStatus.RESERVED, StockReservationStatus.PARTIALLY_RESERVED] },
          },
          data: {
            status: StockReservationStatus.CONSUMED,
          },
        });
      }

      const updated = await tx.dispatchOrder.update({
        where: { id: dispatchId },
        data: {
          status: DispatchOrderStatus.DISPATCHED,
          dispatchedById: userId,
          dispatchedAt: new Date(),
        },
        include: { lines: true },
      });

      this.logger.log(`Posted dispatch order ${dispatch.dispatchNumber}: stock successfully deducted`);
      return updated;
    });
  }

  // ===========================================================================
  // 2. DELIVERY CHALLAN GENERATION
  // ===========================================================================

  async generateDeliveryChallan(
    organizationId: string,
    dto: CreateDeliveryChallanDto,
    userId?: string,
  ) {
    const challanNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'CHALLAN',
      'DCH',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const dispatch = await tx.dispatchOrder.findFirst({
        where: { id: dto.dispatchOrderId, organizationId },
        include: {
          customer: true,
          salesOrder: true,
          lines: { include: { productVariant: { include: { product: true } } } },
        },
      });

      if (!dispatch) throw new NotFoundException(`Dispatch order ${dto.dispatchOrderId} not found`);

      // Check if challan already exists
      const existingChallan = await tx.deliveryChallan.findFirst({
        where: { dispatchOrderId: dto.dispatchOrderId, organizationId },
      });
      if (existingChallan) {
        return existingChallan;
      }

      const challan = await tx.deliveryChallan.create({
        data: {
          organizationId,
          challanNumber,
          dispatchOrderId: dto.dispatchOrderId,
          salesOrderId: dispatch.salesOrderId,
          projectInitiationId: dispatch.projectInitiationId,
          customerId: dispatch.customerId,
          challanDate: new Date(),
          transporterName: dto.transporterName || dispatch.transporterName,
          vehicleNumber: dto.vehicleNumber || dispatch.vehicleNumber,
          receiverName: dto.receiverName || dispatch.customer.name,
          receiverPhone: dto.receiverPhone || dispatch.customer.phone,
          deliverySite: dto.deliverySite || dispatch.deliveryAddress,
          termsAndConditions:
            dto.termsAndConditions ||
            '1. Goods once sold/dispatched will not be taken back without authorized inspection.\n2. Warranty is subject to manufacturer terms.\n3. SunPower Solutions is not liable for transit damages after formal handoff unless insured transit is opted.',
          createdById: userId,
        },
        include: {
          dispatchOrder: {
            include: {
              lines: { include: { productVariant: { include: { product: true } } } },
              warehouse: true,
            },
          },
          customer: true,
          salesOrder: true,
        },
      });

      this.logger.log(`Generated Delivery Challan ${challanNumber} for dispatch ${dispatch.dispatchNumber}`);
      return challan;
    });
  }

  // ===========================================================================
  // 3. PROOF OF DELIVERY (POD) CONFIRMATION
  // ===========================================================================

  async confirmDelivery(
    organizationId: string,
    dispatchId: string,
    dto: ConfirmDeliveryDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const dispatch = await tx.dispatchOrder.findFirst({
        where: { id: dispatchId, organizationId },
        include: { deliveryChallan: true },
      });

      if (!dispatch) throw new NotFoundException(`Dispatch order ${dispatchId} not found`);

      // Check existing POD
      const existingPOD = await tx.proofOfDelivery.findFirst({
        where: { dispatchOrderId: dispatchId, organizationId },
      });
      if (existingPOD) {
        throw new ConflictException(`Proof of delivery already recorded for dispatch ${dispatch.dispatchNumber}`);
      }

      const podStatus = dto.isDamaged
        ? ProofOfDeliveryStatus.PARTIAL_DELIVERY
        : ProofOfDeliveryStatus.DELIVERY_CONFIRMED;

      const pod = await tx.proofOfDelivery.create({
        data: {
          organizationId,
          dispatchOrderId: dispatchId,
          deliveryChallanId: dispatch.deliveryChallan?.id,
          deliveredAt: new Date(),
          receiverName: dto.receiverName,
          receiverPhone: dto.receiverPhone,
          receiverSignatureUrl: dto.receiverSignatureUrl,
          proofDocumentUrls: dto.proofDocumentUrls || [],
          isDamaged: dto.isDamaged || false,
          damageDescription: dto.damageDescription,
          shortageQuantity: dto.shortageQuantity || 0,
          notes: dto.notes,
          status: podStatus,
          recordedById: userId,
        },
      });

      // Update dispatch order status to DELIVERED
      await tx.dispatchOrder.update({
        where: { id: dispatchId },
        data: {
          status: DispatchOrderStatus.DELIVERED,
        },
      });

      // Update serial status to DELIVERED
      await tx.productSerial.updateMany({
        where: {
          organizationId,
          activeDispatchOrderId: dispatchId,
        },
        data: {
          status: 'DELIVERED',
        },
      });

      this.logger.log(`Confirmed delivery for dispatch ${dispatch.dispatchNumber} to ${dto.receiverName}`);
      return pod;
    });
  }

  // ===========================================================================
  // 4. QUERIES & GETTERS
  // ===========================================================================

  async listDispatchOrders(
    organizationId: string,
    filters?: { warehouseId?: string; status?: string; search?: string },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
      if (filters?.status) where.status = filters.status;
      if (filters?.search) {
        where.OR = [
          { dispatchNumber: { contains: filters.search, mode: 'insensitive' } },
          { transporterName: { contains: filters.search, mode: 'insensitive' } },
          { customer: { name: { contains: filters.search, mode: 'insensitive' } } },
        ];
      }

      return await tx.dispatchOrder.findMany({
        where,
        include: {
          customer: { select: { name: true, phone: true } },
          warehouse: { select: { code: true, name: true } },
          salesOrder: { select: { orderNumber: true } },
          deliveryChallan: { select: { challanNumber: true } },
          proofOfDelivery: { select: { status: true, deliveredAt: true } },
          _count: { select: { lines: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async getDispatchOrder(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const dispatch = await tx.dispatchOrder.findFirst({
        where: { id, organizationId },
        include: {
          customer: true,
          warehouse: true,
          salesOrder: true,
          projectInitiation: true,
          deliveryChallan: true,
          proofOfDelivery: true,
          lines: {
            include: {
              productVariant: { include: { product: true } },
            },
          },
        },
      });

      if (!dispatch) throw new NotFoundException(`Dispatch order ${id} not found`);
      return dispatch;
    });
  }

  async listDeliveryChallans(organizationId: string, filters?: { search?: string }) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.search) {
        where.OR = [
          { challanNumber: { contains: filters.search, mode: 'insensitive' } },
          { receiverName: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await tx.deliveryChallan.findMany({
        where,
        include: {
          customer: { select: { name: true, phone: true } },
          salesOrder: { select: { orderNumber: true } },
          dispatchOrder: { select: { dispatchNumber: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async getDeliveryChallan(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const challan = await tx.deliveryChallan.findFirst({
        where: { id, organizationId },
        include: {
          customer: true,
          salesOrder: true,
          dispatchOrder: {
            include: {
              warehouse: true,
              lines: {
                include: {
                  productVariant: { include: { product: true } },
                },
              },
            },
          },
          proofsOfDelivery: true,
        },
      });

      if (!challan) throw new NotFoundException(`Delivery Challan ${id} not found`);
      return challan;
    });
  }
}
