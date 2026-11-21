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
  CreateStockReservationDto,
  ReleaseStockReservationDto,
} from '@solaros/contracts';
import {
  StockReservationStatus,
  ProjectAllocationStatus,
  MovementType,
} from '@solaros/types';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
    private readonly stockService: StockService,
  ) {}

  /**
   * Reserves available stock against project BOM with concurrency protection and shortage tracking
   */
  async createReservation(organizationId: string, dto: CreateStockReservationDto, userId?: string) {
    const reservationNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'RESERVATION',
      'RES',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      let salesOrderId = dto.salesOrderId;
      let projectInitiationId = dto.projectInitiationId;

      // If projectInitiationId is provided, get salesOrderId
      if (projectInitiationId && !salesOrderId) {
        const project = await tx.projectInitiation.findFirst({
          where: { id: projectInitiationId, organizationId },
        });
        if (!project) throw new NotFoundException(`Project ${projectInitiationId} not found`);
        salesOrderId = project.salesOrderId;
      }

      // If salesOrderId is provided, get projectInitiationId
      if (salesOrderId && !projectInitiationId) {
        const project = await tx.projectInitiation.findFirst({
          where: { salesOrderId, organizationId },
        });
        if (project) projectInitiationId = project.id;
      }

      let lineItemsToReserve: Array<{
        productVariantId: string;
        quantityRequested: number;
        bomItemId?: string;
        warehouseId?: string;
      }> = [];

      // If explicit lines were sent, use them
      if (dto.lines && dto.lines.length > 0) {
        lineItemsToReserve = dto.lines.map((l: any) => ({
          productVariantId: l.productVariantId,
          quantityRequested: Number(l.quantityRequested ?? l.quantity ?? 1),
          bomItemId: l.bomItemId,
          warehouseId: l.warehouseId || dto.warehouseId,
        }));
      } else if (salesOrderId) {
        // Automatically resolve from the SalesOrder and its approved BOM
        const so = await tx.salesOrder.findFirst({
          where: { id: salesOrderId, organizationId },
          include: {
            bom: {
              include: {
                items: {
                  where: { variantId: { not: null } },
                },
              },
            },
          },
        });

        if (!so) throw new NotFoundException(`Sales Order ${salesOrderId} not found`);
        if (!so.bom || !so.bom.items || so.bom.items.length === 0) {
          throw new BadRequestException(`Sales order ${so.orderNumber} has no valid BOM items to reserve`);
        }

        lineItemsToReserve = so.bom.items.map((item) => ({
          productVariantId: item.variantId!,
          quantityRequested: Number(item.effectiveQuantity || item.quantity),
          bomItemId: item.id,
          warehouseId: dto.warehouseId,
        }));
      } else {
        throw new BadRequestException('Either salesOrderId, projectInitiationId, or explicit lines must be provided');
      }

      // Concurrency check and lock:
      // For each product variant, lock and compute currently available stock
      const createdLines = [];
      let totalRequestedItems = 0;
      let fullyAllocatedItems = 0;
      let partialItems = 0;
      let shortageItems = 0;

      for (const item of lineItemsToReserve) {
        totalRequestedItems++;
        const reqQty = Number(item.quantityRequested);

        // Lock the variant record to prevent race conditions during reservation
        await tx.$executeRawUnsafe(
          `SELECT "id" FROM "product_variants" WHERE "id" = '${item.productVariantId}' AND "organizationId" = '${organizationId}' FOR UPDATE`,
        );

        // Calculate current on-hand stock for this variant
        const movements = await tx.inventoryReceiptMovement.findMany({
          where: { organizationId, productVariantId: item.productVariantId },
        });

        let onHand = 0;
        for (const m of movements) {
          const q = Number(m.quantity);
          if (
            m.movementType === MovementType.PURCHASE_RECEIPT ||
            m.movementType === MovementType.CUSTOMER_RETURN
          ) {
            onHand += q;
          } else if (m.movementType === MovementType.STOCK_ADJUSTMENT) {
            onHand += q;
          } else if (
            m.movementType === MovementType.DISPATCH_ISSUE ||
            m.movementType === MovementType.SUPPLIER_RETURN
          ) {
            onHand -= q;
          }
        }

        // Active reservations for this variant
        const activeLines = await tx.stockReservationLine.findMany({
          where: {
            organizationId,
            productVariantId: item.productVariantId,
            reservation: {
              status: { in: [StockReservationStatus.RESERVED, StockReservationStatus.PARTIALLY_RESERVED] },
            },
          },
        });

        const currentReserved = activeLines.reduce(
          (acc, cur) => acc + Math.max(0, Number(cur.quantityReserved) - Number(cur.quantityPicked)),
          0,
        );

        const available = Math.max(0, onHand - currentReserved);

        // Allocate up to available stock
        const canReserve = Math.min(reqQty, available);
        const outstanding = reqQty - canReserve;

        let lineStatus = 'ACTIVE';
        if (canReserve === 0) {
          shortageItems++;
          lineStatus = 'SHORTAGE';
        } else if (canReserve < reqQty) {
          partialItems++;
          lineStatus = 'ACTIVE';
        } else {
          fullyAllocatedItems++;
          lineStatus = 'ACTIVE';
        }

        createdLines.push({
          organizationId,
          productVariantId: item.productVariantId,
          warehouseId: item.warehouseId || dto.warehouseId,
          bomItemId: item.bomItemId,
          quantityRequested: reqQty,
          quantityReserved: canReserve,
          quantityOutstanding: outstanding,
          quantityPicked: 0,
          status: lineStatus,
        });

        // If serial tracking is present and canReserve > 0, reserve unallocated serials
        if (canReserve > 0) {
          const availableSerials = await tx.productSerial.findMany({
            where: {
              organizationId,
              productVariantId: item.productVariantId,
              status: 'IN_STOCK',
              activeReservationId: null,
            },
            take: Math.floor(canReserve),
          });

          for (const s of availableSerials) {
            await tx.productSerial.update({
              where: { id: s.id },
              data: {
                activeReservationId: reservationNumber,
                salesOrderId,
                projectInitiationId,
                status: 'ALLOCATED',
              },
            });
          }
        }
      }

      // Determine reservation overall status
      let allocationStatus: ProjectAllocationStatus = ProjectAllocationStatus.FULLY_ALLOCATED;
      let overallStatus = StockReservationStatus.RESERVED;

      if (fullyAllocatedItems === totalRequestedItems) {
        allocationStatus = ProjectAllocationStatus.READY_FOR_PICKING;
        overallStatus = StockReservationStatus.RESERVED;
      } else if (fullyAllocatedItems > 0 || partialItems > 0) {
        allocationStatus = ProjectAllocationStatus.PARTIALLY_ALLOCATED;
        overallStatus = StockReservationStatus.PARTIALLY_RESERVED;
      } else {
        allocationStatus = ProjectAllocationStatus.SHORTAGE;
        overallStatus = StockReservationStatus.PARTIALLY_RESERVED;
      }

      const reservation = await tx.stockReservation.create({
        data: {
          organizationId,
          reservationNumber,
          salesOrderId,
          projectInitiationId,
          warehouseId: dto.warehouseId,
          reservationType:
            allocationStatus === ProjectAllocationStatus.READY_FOR_PICKING ? 'FULL' : 'PARTIAL',
          status: overallStatus,
          allocationStatus,
          notes: dto.notes,
          createdById: userId,
          lines: {
            create: createdLines,
          },
        },
        include: {
          lines: {
            include: {
              productVariant: { select: { sku: true, name: true } },
            },
          },
          salesOrder: { select: { orderNumber: true } },
          projectInitiation: { select: { projectCode: true, projectName: true } },
        },
      });

      this.logger.log(
        `Created reservation ${reservationNumber} for project ${projectInitiationId || 'adhoc'}: status=${allocationStatus}`,
      );
      return reservation;
    });
  }

  async releaseReservation(
    organizationId: string,
    reservationId: string,
    dto?: ReleaseStockReservationDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const reservation = await tx.stockReservation.findFirst({
        where: { id: reservationId, organizationId },
        include: { lines: true },
      });

      if (!reservation) {
        throw new NotFoundException(`Reservation ${reservationId} not found`);
      }

      if (reservation.status === StockReservationStatus.RELEASED) {
        throw new BadRequestException(`Reservation ${reservation.reservationNumber} is already released`);
      }

      // 1. Release serials allocated to this reservation
      await tx.productSerial.updateMany({
        where: {
          organizationId,
          activeReservationId: reservation.reservationNumber,
        },
        data: {
          activeReservationId: null,
          status: 'IN_STOCK',
        },
      });

      // 2. Update lines
      await tx.stockReservationLine.updateMany({
        where: { reservationId, organizationId },
        data: {
          status: 'RELEASED',
          quantityReserved: 0,
        },
      });

      // 3. Update reservation status
      const updated = await tx.stockReservation.update({
        where: { id: reservationId },
        data: {
          status: StockReservationStatus.RELEASED,
          allocationStatus: ProjectAllocationStatus.NOT_ALLOCATED,
          releasedById: userId,
          releasedAt: new Date(),
          notes: dto?.reason ? `${reservation.notes || ''} [Released: ${dto.reason}]` : reservation.notes,
        },
        include: { lines: true },
      });

      this.logger.log(`Released reservation ${reservation.reservationNumber}`);
      return updated;
    });
  }

  async listReservations(
    organizationId: string,
    filters?: {
      salesOrderId?: string;
      projectInitiationId?: string;
      status?: string;
      search?: string;
      skip?: number;
      take?: number;
    },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.salesOrderId) where.salesOrderId = filters.salesOrderId;
      if (filters?.projectInitiationId) where.projectInitiationId = filters.projectInitiationId;
      if (filters?.status) where.status = filters.status;
      if (filters?.search) {
        where.OR = [
          { reservationNumber: { contains: filters.search, mode: 'insensitive' } },
          { salesOrder: { orderNumber: { contains: filters.search, mode: 'insensitive' } } },
          { projectInitiation: { projectCode: { contains: filters.search, mode: 'insensitive' } } },
        ];
      }

      const [total, items] = await Promise.all([
        tx.stockReservation.count({ where }),
        tx.stockReservation.findMany({
          where,
          include: {
            salesOrder: { select: { orderNumber: true } },
            projectInitiation: { select: { projectCode: true, projectName: true } },
            warehouse: { select: { code: true, name: true } },
            createdBy: { select: { id: true, firstName: true, lastName: true } },
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

  async getReservation(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const reservation = await tx.stockReservation.findFirst({
        where: { id, organizationId },
        include: {
          salesOrder: true,
          projectInitiation: {
            include: {
              customer: true,
              site: true,
            },
          },
          warehouse: true,
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          releasedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          lines: {
            include: {
              productVariant: {
                include: { product: true },
              },
              location: true,
            },
          },
        },
      });

      if (!reservation) {
        throw new NotFoundException(`Reservation ${id} not found`);
      }

      return reservation;
    });
  }
}
