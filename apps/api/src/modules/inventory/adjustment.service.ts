import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import { StockService } from './stock.service';
import {
  CreateStockCountDto,
  SubmitStockCountDto,
  CreateStockAdjustmentDto,
  ApproveStockAdjustmentDto,
} from '@solaros/contracts';
import {
  StockCountStatus,
  StockAdjustmentStatus,
  MovementType,
} from '@solaros/types';

@Injectable()
export class AdjustmentService {
  private readonly logger = new Logger(AdjustmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
    private readonly stockService: StockService,
  ) {}

  // ===========================================================================
  // 1. STOCK COUNTS (Physical & Cycle Counts)
  // ===========================================================================

  async createStockCount(organizationId: string, dto: CreateStockCountDto, userId?: string) {
    const countNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'COUNT',
      'CNT',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: { id: dto.warehouseId, organizationId },
      });
      if (!warehouse) throw new NotFoundException(`Warehouse ${dto.warehouseId} not found`);

      // If lines were not provided, initialize with current active products
      let linesData: any[] = [];
      if (dto.lines && dto.lines.length > 0) {
        linesData = dto.lines.map((l) => ({
          organizationId,
          productVariantId: l.productVariantId,
          locationId: l.locationId || dto.locationId,
          systemQuantity: 0,
          countedQuantity: Number(l.countedQuantity),
          varianceQuantity: Number(l.countedQuantity),
          notes: l.notes,
        }));
      } else {
        const variants = await tx.productVariant.findMany({
          where: { organizationId, isActive: true },
          take: 50,
        });

        linesData = variants.map((v) => ({
          organizationId,
          productVariantId: v.id,
          locationId: dto.locationId,
          systemQuantity: 0,
          countedQuantity: 0,
          varianceQuantity: 0,
        }));
      }

      const stockCount = await tx.stockCount.create({
        data: {
          organizationId,
          countNumber,
          warehouseId: dto.warehouseId,
          locationId: dto.locationId,
          countType: dto.countType || 'PHYSICAL',
          status: StockCountStatus.PLANNED,
          notes: dto.notes,
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

      this.logger.log(`Created stock count ${countNumber}`);
      return stockCount;
    });
  }

  async submitStockCount(
    organizationId: string,
    countId: string,
    dto: SubmitStockCountDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const count = await tx.stockCount.findFirst({
        where: { id: countId, organizationId },
        include: { lines: true },
      });

      if (!count) throw new NotFoundException(`Stock count ${countId} not found`);

      for (const lineDto of dto.lines) {
        // Find system on hand quantity for this product
        const movements = await tx.inventoryReceiptMovement.findMany({
          where: { organizationId, productVariantId: lineDto.productVariantId },
        });

        let systemQty = 0;
        for (const m of movements) {
          const q = Number(m.quantity);
          if (
            m.movementType === MovementType.PURCHASE_RECEIPT ||
            m.movementType === MovementType.CUSTOMER_RETURN
          ) {
            systemQty += q;
          } else if (m.movementType === MovementType.STOCK_ADJUSTMENT) {
            systemQty += q;
          } else if (
            m.movementType === MovementType.DISPATCH_ISSUE ||
            m.movementType === MovementType.SUPPLIER_RETURN
          ) {
            systemQty -= q;
          }
        }

        const countedQty = Number(lineDto.countedQuantity);
        const varianceQty = countedQty - systemQty;

        // Upsert or update line
        const existingLine = count.lines.find((l) => l.productVariantId === lineDto.productVariantId);
        if (existingLine) {
          await tx.stockCountLine.update({
            where: { id: existingLine.id },
            data: {
              systemQuantity: systemQty,
              countedQuantity: countedQty,
              varianceQuantity: varianceQty,
              notes: lineDto.notes,
            },
          });
        } else {
          await tx.stockCountLine.create({
            data: {
              organizationId,
              stockCountId: countId,
              productVariantId: lineDto.productVariantId,
              locationId: lineDto.locationId || count.locationId,
              systemQuantity: systemQty,
              countedQuantity: countedQty,
              varianceQuantity: varianceQty,
              notes: lineDto.notes,
            },
          });
        }
      }

      return await tx.stockCount.update({
        where: { id: countId },
        data: {
          status: StockCountStatus.SUBMITTED,
          countedById: userId,
          countedAt: new Date(),
          notes: dto.notes || count.notes,
        },
        include: {
          lines: {
            include: { productVariant: { select: { sku: true, name: true } } },
          },
        },
      });
    });
  }

  async listStockCounts(
    organizationId: string,
    filters?: { warehouseId?: string; status?: string; search?: string },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
      if (filters?.status) where.status = filters.status;
      if (filters?.search) {
        where.countNumber = { contains: filters.search, mode: 'insensitive' };
      }

      return await tx.stockCount.findMany({
        where,
        include: {
          warehouse: { select: { code: true, name: true } },
          countedBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { lines: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  // ===========================================================================
  // 2. STOCK ADJUSTMENTS
  // ===========================================================================

  async createStockAdjustment(
    organizationId: string,
    dto: CreateStockAdjustmentDto,
    userId?: string,
  ) {
    const adjustmentNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'ADJUSTMENT',
      'ADJ',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: { id: dto.productVariantId, organizationId },
      });
      if (!variant) throw new NotFoundException(`Product variant ${dto.productVariantId} not found`);

      const unitCost = Number(dto.unitCost || variant.costPrice);
      const quantity = Number(dto.quantity);
      const totalValue = Math.abs(quantity) * unitCost;

      const adjustment = await tx.stockAdjustment.create({
        data: {
          organizationId,
          adjustmentNumber,
          stockCountId: dto.stockCountId,
          warehouseId: dto.warehouseId,
          locationId: dto.locationId,
          productVariantId: dto.productVariantId,
          adjustmentType: dto.adjustmentType,
          quantity,
          unitCost,
          totalValue,
          status: StockAdjustmentStatus.SUBMITTED,
          reason: dto.reason,
          notes: dto.notes,
          createdById: userId,
        },
        include: {
          productVariant: { select: { sku: true, name: true } },
          warehouse: { select: { code: true, name: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      this.logger.log(`Created adjustment ${adjustmentNumber} for variant ${variant.sku}`);
      return adjustment;
    });
  }

  async approveStockAdjustment(
    organizationId: string,
    adjustmentId: string,
    dto?: ApproveStockAdjustmentDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const adjustment = await tx.stockAdjustment.findFirst({
        where: { id: adjustmentId, organizationId },
      });

      if (!adjustment) throw new NotFoundException(`Adjustment ${adjustmentId} not found`);
      if (adjustment.status === StockAdjustmentStatus.POSTED) {
        throw new BadRequestException(`Adjustment ${adjustment.adjustmentNumber} is already posted`);
      }

      // Segregation of Duties Check
      if (userId && adjustment.createdById && adjustment.createdById === userId) {
        throw new BadRequestException(
          'Segregation of duties policy violation: The user who created the stock adjustment cannot approve it.',
        );
      }

      // Post the immutable inventory movement to the authoritative ledger
      const movement = await this.stockService.recordMovement(
        organizationId,
        {
          movementType: MovementType.STOCK_ADJUSTMENT,
          productVariantId: adjustment.productVariantId,
          fromLocationId: Number(adjustment.quantity) < 0 ? adjustment.locationId : null,
          toLocationId: Number(adjustment.quantity) > 0 ? adjustment.locationId : null,
          quantity: Number(adjustment.quantity),
          unitCost: Number(adjustment.unitCost),
          totalValue: Number(adjustment.totalValue),
          referenceType: 'ADJUSTMENT',
          referenceId: adjustment.adjustmentNumber,
          notes: `Stock adjustment: ${adjustment.reason}`,
          createdById: userId,
        },
        tx,
      );

      const updated = await tx.stockAdjustment.update({
        where: { id: adjustmentId },
        data: {
          status: StockAdjustmentStatus.POSTED,
          approvedById: userId,
          approvedAt: new Date(),
          postedAt: new Date(),
          movementId: movement.id,
          notes: dto?.notes ? `${adjustment.notes || ''} [Approved: ${dto.notes}]` : adjustment.notes,
        },
        include: {
          productVariant: { select: { sku: true, name: true } },
          warehouse: { select: { code: true, name: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      this.logger.log(`Approved and posted adjustment ${adjustment.adjustmentNumber}`);
      return updated;
    });
  }

  async listStockAdjustments(
    organizationId: string,
    filters?: { warehouseId?: string; status?: string; search?: string },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
      if (filters?.status) where.status = filters.status;
      if (filters?.search) {
        where.OR = [
          { adjustmentNumber: { contains: filters.search, mode: 'insensitive' } },
          { reason: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await tx.stockAdjustment.findMany({
        where,
        include: {
          warehouse: { select: { code: true, name: true } },
          productVariant: { select: { sku: true, name: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }
}
