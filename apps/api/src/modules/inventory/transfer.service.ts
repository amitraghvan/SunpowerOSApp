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
  CreateStockTransferDto,
  ShipStockTransferDto,
  ReceiveStockTransferDto,
} from '@solaros/contracts';
import {
  StockTransferStatus,
  StockTransferType,
  MovementType,
} from '@solaros/types';

@Injectable()
export class TransferService {
  private readonly logger = new Logger(TransferService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
    private readonly stockService: StockService,
  ) {}

  async createTransfer(organizationId: string, dto: CreateStockTransferDto, userId?: string) {
    const transferNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'TRANSFER',
      'TRF',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const linesData = dto.lines.map((l) => ({
        organizationId,
        productVariantId: l.productVariantId,
        requestedQuantity: Number(l.requestedQuantity),
        shippedQuantity: 0,
        receivedQuantity: 0,
        batchNumber: l.batchNumber,
        serialNumbers: l.serialNumbers || [],
        status: 'PENDING',
      }));

      const transfer = await tx.stockTransfer.create({
        data: {
          organizationId,
          transferNumber,
          transferType: dto.transferType || StockTransferType.INTER_WAREHOUSE,
          sourceWarehouseId: dto.sourceWarehouseId,
          sourceLocationId: dto.sourceLocationId,
          destinationWarehouseId: dto.destinationWarehouseId,
          destinationLocationId: dto.destinationLocationId,
          status: StockTransferStatus.REQUESTED,
          reason: dto.reason,
          notes: dto.notes,
          requestedById: userId,
          lines: {
            create: linesData,
          },
        },
        include: {
          lines: {
            include: { productVariant: { select: { sku: true, name: true } } },
          },
          sourceWarehouse: { select: { code: true, name: true } },
          destinationWarehouse: { select: { code: true, name: true } },
        },
      });

      this.logger.log(`Created transfer ${transferNumber} for tenant ${organizationId}`);
      return transfer;
    });
  }

  async approveTransfer(organizationId: string, transferId: string, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const transfer = await tx.stockTransfer.findFirst({
        where: { id: transferId, organizationId },
      });

      if (!transfer) throw new NotFoundException(`Transfer ${transferId} not found`);
      if (transfer.status !== StockTransferStatus.REQUESTED && transfer.status !== StockTransferStatus.DRAFT) {
        throw new BadRequestException(`Cannot approve transfer in status ${transfer.status}`);
      }

      return await tx.stockTransfer.update({
        where: { id: transferId },
        data: {
          status: StockTransferStatus.APPROVED,
          approvedById: userId,
          approvedAt: new Date(),
        },
      });
    });
  }

  async shipTransfer(
    organizationId: string,
    transferId: string,
    dto?: ShipStockTransferDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const transfer = await tx.stockTransfer.findFirst({
        where: { id: transferId, organizationId },
        include: { lines: true },
      });

      if (!transfer) throw new NotFoundException(`Transfer ${transferId} not found`);
      if (transfer.status !== StockTransferStatus.APPROVED && transfer.status !== StockTransferStatus.REQUESTED) {
        throw new BadRequestException(`Cannot ship transfer in status ${transfer.status}`);
      }

      // Check stock and create source outbound movements
      for (const line of transfer.lines) {
        const qty = Number(line.requestedQuantity);

        // Record source movement: reduces source stock (fromLocationId populated)
        await this.stockService.recordMovement(
          organizationId,
          {
            movementType: MovementType.INTERNAL_TRANSFER,
            productVariantId: line.productVariantId,
            fromLocationId: transfer.sourceLocationId,
            toLocationId: null, // In transit
            quantity: qty,
            referenceType: 'TRANSFER',
            referenceId: transfer.transferNumber,
            batchNumber: line.batchNumber,
            notes: `Transfer shipped: ${transfer.transferNumber}`,
            createdById: userId,
          },
          tx,
        );

        // Update serial locations if any
        if (line.serialNumbers && line.serialNumbers.length > 0) {
          await tx.productSerial.updateMany({
            where: {
              organizationId,
              manufacturerSerialNumber: { in: line.serialNumbers },
            },
            data: {
              status: 'IN_TRANSIT',
              storageLocationId: null,
            },
          });
        }

        // Mark line shipped
        await tx.stockTransferLine.update({
          where: { id: line.id },
          data: {
            shippedQuantity: qty,
            status: 'SHIPPED',
          },
        });
      }

      const updated = await tx.stockTransfer.update({
        where: { id: transferId },
        data: {
          status: StockTransferStatus.IN_TRANSIT,
          shippedById: userId,
          shippedAt: new Date(),
          notes: dto?.notes ? `${transfer.notes || ''} [Shipped: ${dto.notes}]` : transfer.notes,
        },
        include: { lines: true },
      });

      this.logger.log(`Shipped transfer ${transfer.transferNumber}`);
      return updated;
    });
  }

  async receiveTransfer(
    organizationId: string,
    transferId: string,
    dto?: ReceiveStockTransferDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const transfer = await tx.stockTransfer.findFirst({
        where: { id: transferId, organizationId },
        include: { lines: true },
      });

      if (!transfer) throw new NotFoundException(`Transfer ${transferId} not found`);
      if (transfer.status !== StockTransferStatus.IN_TRANSIT) {
        throw new BadRequestException(`Cannot receive transfer in status ${transfer.status}. Must be IN_TRANSIT.`);
      }

      // Record destination inbound movements
      for (const line of transfer.lines) {
        const qty = Number(line.shippedQuantity || line.requestedQuantity);

        // Record destination inbound movement (toLocationId populated)
        await this.stockService.recordMovement(
          organizationId,
          {
            movementType: MovementType.INTERNAL_TRANSFER,
            productVariantId: line.productVariantId,
            fromLocationId: null,
            toLocationId: transfer.destinationLocationId,
            quantity: qty,
            referenceType: 'TRANSFER',
            referenceId: transfer.transferNumber,
            batchNumber: line.batchNumber,
            notes: `Transfer received: ${transfer.transferNumber}`,
            createdById: userId,
          },
          tx,
        );

        // Update serial locations to destination
        if (line.serialNumbers && line.serialNumbers.length > 0) {
          await tx.productSerial.updateMany({
            where: {
              organizationId,
              manufacturerSerialNumber: { in: line.serialNumbers },
            },
            data: {
              status: 'IN_STOCK',
              warehouseId: transfer.destinationWarehouseId,
              storageLocationId: transfer.destinationLocationId,
            },
          });
        }

        // Mark line received
        await tx.stockTransferLine.update({
          where: { id: line.id },
          data: {
            receivedQuantity: qty,
            status: 'RECEIVED',
          },
        });
      }

      const updated = await tx.stockTransfer.update({
        where: { id: transferId },
        data: {
          status: StockTransferStatus.COMPLETED,
          receivedById: userId,
          receivedAt: new Date(),
          notes: dto?.notes ? `${transfer.notes || ''} [Received: ${dto.notes}]` : transfer.notes,
        },
        include: { lines: true },
      });

      this.logger.log(`Completed transfer ${transfer.transferNumber}`);
      return updated;
    });
  }

  async listTransfers(
    organizationId: string,
    filters?: {
      sourceWarehouseId?: string;
      destinationWarehouseId?: string;
      status?: string;
      search?: string;
      skip?: number;
      take?: number;
    },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.sourceWarehouseId) where.sourceWarehouseId = filters.sourceWarehouseId;
      if (filters?.destinationWarehouseId) where.destinationWarehouseId = filters.destinationWarehouseId;
      if (filters?.status) where.status = filters.status;
      if (filters?.search) {
        where.OR = [
          { transferNumber: { contains: filters.search, mode: 'insensitive' } },
          { reason: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [total, items] = await Promise.all([
        tx.stockTransfer.count({ where }),
        tx.stockTransfer.findMany({
          where,
          include: {
            sourceWarehouse: { select: { code: true, name: true } },
            destinationWarehouse: { select: { code: true, name: true } },
            sourceLocation: { select: { code: true, name: true } },
            destinationLocation: { select: { code: true, name: true } },
            requestedBy: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { lines: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: filters?.skip ?? 0,
          take: filters?.take ?? 50,
        }),
      ]);

      return { total, items };
    });
  }

  async getTransfer(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const transfer = await tx.stockTransfer.findFirst({
        where: { id, organizationId },
        include: {
          sourceWarehouse: true,
          destinationWarehouse: true,
          sourceLocation: true,
          destinationLocation: true,
          requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          shippedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          receivedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          lines: {
            include: {
              productVariant: {
                include: { product: true },
              },
            },
          },
        },
      });

      if (!transfer) throw new NotFoundException(`Transfer ${id} not found`);
      return transfer;
    });
  }
}
