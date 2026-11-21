import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import { MovementType, StockReservationStatus, PickingOrderStatus, DispatchOrderStatus } from '@solaros/types';

@Injectable()
export class StockService {
  private readonly logger = new Logger(StockService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * Authoritative stock overview calculated dynamically from the immutable ledger
   * Formula: Available Stock = Accepted On-Hand Stock - Active Reservations
   */
  async getStockOverview(
    organizationId: string,
    filters?: {
      productVariantId?: string;
      warehouseId?: string;
      search?: string;
    },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      // 1. Fetch all product variants
      const variantWhere: any = { organizationId, isActive: true };
      if (filters?.productVariantId) variantWhere.id = filters.productVariantId;
      if (filters?.search) {
        variantWhere.OR = [
          { sku: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } },
          { product: { name: { contains: filters.search, mode: 'insensitive' } } },
        ];
      }

      const variants = await tx.productVariant.findMany({
        where: variantWhere,
        include: {
          product: {
            include: {
              category: true,
              manufacturer: true,
            },
          },
        },
        orderBy: { sku: 'asc' },
      });

      // 2. Fetch all movements for these variants
      const variantIds = variants.map((v) => v.id);
      const movements = await tx.inventoryReceiptMovement.findMany({
        where: {
          organizationId,
          productVariantId: { in: variantIds },
        },
        include: {
          toLocation: true,
          fromLocation: true,
        },
      });

      // 3. Fetch active reservations
      const activeReservationLines = await tx.stockReservationLine.findMany({
        where: {
          organizationId,
          productVariantId: { in: variantIds },
          reservation: {
            status: { in: [StockReservationStatus.RESERVED, StockReservationStatus.PARTIALLY_RESERVED] },
          },
        },
      });

      // 4. Fetch picked order lines
      const pickedLines = await tx.pickingOrderLine.findMany({
        where: {
          organizationId,
          productVariantId: { in: variantIds },
          pickingOrder: {
            status: { in: [PickingOrderStatus.PICKED, PickingOrderStatus.PARTIALLY_PICKED] },
          },
        },
      });

      // 5. Fetch dispatched lines
      const dispatchedLines = await tx.dispatchOrderLine.findMany({
        where: {
          organizationId,
          productVariantId: { in: variantIds },
          dispatchOrder: {
            status: { in: [DispatchOrderStatus.DISPATCHED, DispatchOrderStatus.IN_TRANSIT, DispatchOrderStatus.DELIVERED] },
          },
        },
      });

      // 6. Fetch serials in quarantine
      const quarantinedSerials = await tx.productSerial.groupBy({
        by: ['productVariantId'],
        where: {
          organizationId,
          productVariantId: { in: variantIds },
          status: 'QUARANTINE',
        },
        _count: { id: true },
      });

      const quarantinedMap = new Map<string, number>();
      for (const qs of quarantinedSerials) {
        quarantinedMap.set(qs.productVariantId, qs._count.id);
      }

      // 7. Calculate product-wise totals
      const stockSummaryList = variants.map((v) => {
        const vMovements = movements.filter((m) => m.productVariantId === v.id);
        
        let totalReceived = 0;
        let onHandStock = 0;

        for (const mov of vMovements) {
          const qty = Number(mov.quantity);
          if (
            mov.movementType === MovementType.PURCHASE_RECEIPT ||
            mov.movementType === MovementType.CUSTOMER_RETURN
          ) {
            totalReceived += qty;
            onHandStock += qty;
          } else if (mov.movementType === MovementType.STOCK_ADJUSTMENT) {
            // Adjustments can be positive or negative
            if (qty > 0) totalReceived += qty;
            onHandStock += qty;
          } else if (
            mov.movementType === MovementType.DISPATCH_ISSUE ||
            mov.movementType === MovementType.SUPPLIER_RETURN
          ) {
            onHandStock -= qty;
          }
        }

        // Active reservations (quantityReserved - quantityPicked)
        const vReservations = activeReservationLines.filter((r) => r.productVariantId === v.id);
        const activeReservedQty = vReservations.reduce(
          (acc, cur) => acc + Math.max(0, Number(cur.quantityReserved) - Number(cur.quantityPicked)),
          0,
        );

        // Picked quantity
        const vPicked = pickedLines.filter((p) => p.productVariantId === v.id);
        const pickedQty = vPicked.reduce((acc, cur) => acc + Number(cur.pickedQuantity), 0);

        // Dispatched quantity
        const vDispatched = dispatchedLines.filter((d) => d.productVariantId === v.id);
        const dispatchedQty = vDispatched.reduce((acc, cur) => acc + Number(cur.dispatchedQuantity), 0);

        // Quarantined quantity
        const quarantinedQty = quarantinedMap.get(v.id) || 0;

        // Authoritative Available Stock
        const availableStock = Math.max(0, onHandStock - activeReservedQty);

        return {
          productVariantId: v.id,
          sku: v.sku,
          productName: v.product.name,
          variantName: v.name,
          category: v.product.category?.name || 'Uncategorized',
          manufacturer: v.product.manufacturer?.name || 'Unknown',
          uom: v.product.type === 'CABLE' ? 'METERS' : 'NOS',
          totalReceived,
          onHandStock: Math.max(0, onHandStock),
          activeReservations: activeReservedQty,
          availableStock,
          pickedStock: pickedQty,
          dispatchedStock: dispatchedQty,
          quarantinedStock: quarantinedQty,
          damagedStock: 0,
        };
      });

      return stockSummaryList;
    });
  }

  async getProductStockDetails(organizationId: string, productVariantId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: { id: productVariantId, organizationId },
        include: {
          product: {
            include: {
              category: true,
              manufacturer: true,
            },
          },
        },
      });

      if (!variant) {
        throw new NotFoundException(`Product variant ${productVariantId} not found`);
      }

      // 1. All serial numbers with current status and storage locations
      const serials = await tx.productSerial.findMany({
        where: { productVariantId, organizationId },
        include: {
          storageLocation: true,
          warehouse: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      // 2. Active reservations for this variant
      const reservations = await tx.stockReservationLine.findMany({
        where: {
          productVariantId,
          organizationId,
          reservation: {
            status: { in: [StockReservationStatus.RESERVED, StockReservationStatus.PARTIALLY_RESERVED] },
          },
        },
        include: {
          reservation: {
            include: {
              projectInitiation: { select: { projectCode: true, projectName: true } },
              salesOrder: { select: { orderNumber: true } },
              warehouse: { select: { code: true, name: true } },
            },
          },
        },
      });

      // 3. Movement history
      const movements = await tx.inventoryReceiptMovement.findMany({
        where: { productVariantId, organizationId },
        include: {
          fromLocation: true,
          toLocation: true,
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      // Calculate on-hand and available
      let totalReceived = 0;
      let onHandStock = 0;

      for (const mov of movements) {
        const qty = Number(mov.quantity);
        if (
          mov.movementType === MovementType.PURCHASE_RECEIPT ||
          mov.movementType === MovementType.CUSTOMER_RETURN
        ) {
          totalReceived += qty;
          onHandStock += qty;
        } else if (mov.movementType === MovementType.STOCK_ADJUSTMENT) {
          if (qty > 0) totalReceived += qty;
          onHandStock += qty;
        } else if (
          mov.movementType === MovementType.DISPATCH_ISSUE ||
          mov.movementType === MovementType.SUPPLIER_RETURN
        ) {
          onHandStock -= qty;
        }
      }

      const activeReservedQty = reservations.reduce(
        (acc, cur) => acc + Math.max(0, Number(cur.quantityReserved) - Number(cur.quantityPicked)),
        0,
      );

      const availableStock = Math.max(0, onHandStock - activeReservedQty);

      return {
        variant: {
          id: variant.id,
          sku: variant.sku,
          name: variant.name,
          product: variant.product.name,
          category: variant.product.category?.name,
          manufacturer: variant.product.manufacturer?.name,
          costPrice: Number(variant.costPrice),
          sellingPrice: Number(variant.sellingPrice),
          uom: variant.product.type === 'CABLE' ? 'METERS' : 'NOS',
        },
        stock: {
          totalReceived,
          onHandStock: Math.max(0, onHandStock),
          activeReserved: activeReservedQty,
          availableStock,
          quarantinedStock: serials.filter((s) => s.status === 'QUARANTINE').length,
        },
        serials,
        reservations: reservations.map((r) => ({
          reservationNumber: r.reservation.reservationNumber,
          projectCode: r.reservation.projectInitiation?.projectCode,
          projectName: r.reservation.projectInitiation?.projectName,
          orderNumber: r.reservation.salesOrder?.orderNumber,
          quantityReserved: Number(r.quantityReserved),
          quantityPicked: Number(r.quantityPicked),
          status: r.status,
        })),
        movements,
      };
    });
  }

  /**
   * Helper to write an immutable movement entry into inventory_receipt_movements
   */
  async recordMovement(
    organizationId: string,
    movement: {
      movementType: MovementType | string;
      productVariantId: string;
      fromLocationId?: string | null;
      toLocationId?: string | null;
      quantity: number;
      unitCost?: number;
      totalValue?: number;
      referenceType: string;
      referenceId: string;
      batchNumber?: string | null;
      notes?: string | null;
      createdById?: string | null;
    },
    tx: any,
  ) {
    const movementNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'MOVEMENT',
      'MOV',
    );

    return await tx.inventoryReceiptMovement.create({
      data: {
        organizationId,
        movementNumber,
        movementType: movement.movementType,
        productVariantId: movement.productVariantId,
        fromLocationId: movement.fromLocationId,
        toLocationId: movement.toLocationId,
        quantity: movement.quantity,
        unitCost: movement.unitCost || 0,
        totalValue: movement.totalValue || Number(movement.quantity) * Number(movement.unitCost || 0),
        referenceType: movement.referenceType,
        referenceId: movement.referenceId,
        batchNumber: movement.batchNumber,
        notes: movement.notes,
        createdById: movement.createdById,
      },
    });
  }
}
