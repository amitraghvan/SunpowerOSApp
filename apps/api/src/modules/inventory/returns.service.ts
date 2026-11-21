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
  CreateCustomerReturnDto,
  InspectCustomerReturnDto,
} from '@solaros/contracts';
import {
  CustomerReturnStatus,
  RestockDecision,
  MovementType,
} from '@solaros/types';

@Injectable()
export class ReturnsService {
  private readonly logger = new Logger(ReturnsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
    private readonly stockService: StockService,
  ) {}

  async createCustomerReturn(
    organizationId: string,
    dto: CreateCustomerReturnDto,
    userId?: string,
  ) {
    const returnNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'CUSTOMER_RETURN',
      'CRN',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: { id: dto.warehouseId, organizationId },
      });
      if (!warehouse) throw new NotFoundException(`Warehouse ${dto.warehouseId} not found`);

      const linesData = dto.lines.map((l) => ({
        organizationId,
        productVariantId: l.productVariantId,
        returnedQuantity: Number(l.returnedQuantity),
        inspectedQuantity: 0,
        acceptedQuantity: 0,
        rejectedQuantity: 0,
        serialNumbers: l.serialNumbers || [],
        status: 'PENDING',
        notes: l.notes,
      }));

      const customerReturn = await tx.customerReturn.create({
        data: {
          organizationId,
          returnNumber,
          customerId: dto.customerId,
          warehouseId: dto.warehouseId,
          salesOrderId: dto.salesOrderId,
          projectInitiationId: dto.projectInitiationId,
          returnReason: dto.returnReason,
          status: CustomerReturnStatus.REQUESTED,
          createdById: userId,
          lines: {
            create: linesData,
          },
        },
        include: {
          lines: {
            include: { productVariant: { select: { sku: true, name: true } } },
          },
          customer: { select: { name: true, phone: true } },
          warehouse: { select: { code: true, name: true } },
        },
      });

      this.logger.log(`Created customer return ${returnNumber}`);
      return customerReturn;
    });
  }

  async receiveCustomerReturn(organizationId: string, returnId: string, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const ret = await tx.customerReturn.findFirst({
        where: { id: returnId, organizationId },
      });

      if (!ret) throw new NotFoundException(`Return ${returnId} not found`);

      return await tx.customerReturn.update({
        where: { id: returnId },
        data: {
          status: CustomerReturnStatus.INSPECTION_PENDING,
          receivedAt: new Date(),
        },
      });
    });
  }

  async inspectCustomerReturn(
    organizationId: string,
    returnId: string,
    dto: InspectCustomerReturnDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const ret = await tx.customerReturn.findFirst({
        where: { id: returnId, organizationId },
        include: { lines: true },
      });

      if (!ret) throw new NotFoundException(`Return ${returnId} not found`);

      // Find receiving location for this warehouse
      const receivingLocation = await tx.inventoryLocation.findFirst({
        where: { organizationId, warehouseId: ret.warehouseId, isDefaultReceiving: true },
      });

      let nextStatus = CustomerReturnStatus.CLOSED;

      if (dto.restockDecision === RestockDecision.RESTOCK) {
        nextStatus = CustomerReturnStatus.RESTOCKED;

        // Create inbound stock movements to add back into inventory
        for (const line of ret.lines) {
          const qty = Number(dto.acceptedQuantity ?? line.returnedQuantity);

          await this.stockService.recordMovement(
            organizationId,
            {
              movementType: MovementType.CUSTOMER_RETURN,
              productVariantId: line.productVariantId,
              fromLocationId: null,
              toLocationId: receivingLocation?.id,
              quantity: qty,
              referenceType: 'RETURN',
              referenceId: ret.returnNumber,
              notes: `Customer return restocked: ${ret.returnNumber}`,
              createdById: userId,
            },
            tx,
          );

          // Update serials to IN_STOCK
          if (line.serialNumbers && line.serialNumbers.length > 0) {
            await tx.productSerial.updateMany({
              where: {
                organizationId,
                manufacturerSerialNumber: { in: line.serialNumbers },
              },
              data: {
                status: 'IN_STOCK',
                warehouseId: ret.warehouseId,
                storageLocationId: receivingLocation?.id,
                activeDispatchOrderId: null,
                activeReservationId: null,
              },
            });
          }

          await tx.customerReturnLine.update({
            where: { id: line.id },
            data: {
              inspectedQuantity: Number(line.returnedQuantity),
              acceptedQuantity: qty,
              rejectedQuantity: 0,
              status: 'ACCEPTED',
            },
          });
        }
      } else if (dto.restockDecision === RestockDecision.QUARANTINE) {
        nextStatus = CustomerReturnStatus.QUARANTINED;

        for (const line of ret.lines) {
          if (line.serialNumbers && line.serialNumbers.length > 0) {
            await tx.productSerial.updateMany({
              where: {
                organizationId,
                manufacturerSerialNumber: { in: line.serialNumbers },
              },
              data: {
                status: 'QUARANTINE',
              },
            });
          }
        }
      } else {
        nextStatus = CustomerReturnStatus.REJECTED;

        for (const line of ret.lines) {
          if (line.serialNumbers && line.serialNumbers.length > 0) {
            await tx.productSerial.updateMany({
              where: {
                organizationId,
                manufacturerSerialNumber: { in: line.serialNumbers },
              },
              data: {
                status: 'RETIRED',
              },
            });
          }
        }
      }

      const updated = await tx.customerReturn.update({
        where: { id: returnId },
        data: {
          status: nextStatus,
          restockDecision: dto.restockDecision,
          inspectionNotes: dto.inspectionNotes,
          inspectedById: userId,
          inspectedAt: new Date(),
        },
        include: { lines: true },
      });

      this.logger.log(`Inspected return ${ret.returnNumber}: outcome=${dto.restockDecision}`);
      return updated;
    });
  }

  async listCustomerReturns(
    organizationId: string,
    filters?: { warehouseId?: string; status?: string; search?: string },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.warehouseId) where.warehouseId = filters.warehouseId;
      if (filters?.status) where.status = filters.status;
      if (filters?.search) {
        where.OR = [
          { returnNumber: { contains: filters.search, mode: 'insensitive' } },
          { returnReason: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await tx.customerReturn.findMany({
        where,
        include: {
          customer: { select: { name: true, phone: true } },
          warehouse: { select: { code: true, name: true } },
          salesOrder: { select: { orderNumber: true } },
          _count: { select: { lines: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async getCustomerReturn(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const ret = await tx.customerReturn.findFirst({
        where: { id, organizationId },
        include: {
          customer: true,
          warehouse: true,
          salesOrder: true,
          projectInitiation: true,
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          inspectedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          lines: {
            include: {
              productVariant: { include: { product: true } },
            },
          },
        },
      });

      if (!ret) throw new NotFoundException(`Customer return ${id} not found`);
      return ret;
    });
  }
}
