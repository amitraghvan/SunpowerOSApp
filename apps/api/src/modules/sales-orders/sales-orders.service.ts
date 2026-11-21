import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateSalesOrderDto,
  RecordAdvancePaymentDto,
  ConfirmSalesOrderDto,
} from '@solaros/contracts';
import {
  SalesOrderStatus,
  FulfillmentStatus,
  PaymentStatus,
  ProjectHandoverStatus,
  QuotationStatus,
} from '@solaros/types';

@Injectable()
export class SalesOrdersService {
  private readonly logger = new Logger(SalesOrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * 1. Create Sales Order from Accepted Quotation / Signed Contract
   */
  async createSalesOrder(organizationId: string, dto: CreateSalesOrderDto, userId?: string) {
    const orderNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'SALES_ORDER',
      'SO',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const quote = await tx.quotation.findFirst({
        where: { id: dto.quotationId, organizationId },
        include: {
          customer: true,
          design: true,
          bom: { include: { items: true } },
        },
      });

      if (!quote) {
        throw new NotFoundException(`Quotation ${dto.quotationId} not found`);
      }

      if (quote.status !== QuotationStatus.ACCEPTED && quote.status !== QuotationStatus.APPROVED) {
        throw new BadRequestException(
          `Cannot create Sales Order for quotation in '${quote.status}' status. Quotation must be APPROVED or ACCEPTED.`,
        );
      }

      if (dto.contractId) {
        const contract = await tx.contract.findFirst({
          where: { id: dto.contractId, organizationId },
        });
        if (!contract) {
          throw new NotFoundException(`Contract ${dto.contractId} not found`);
        }
      }

      const grandTotal = quote.grandTotal.toNumber();
      const advancePercent = dto.advanceRequiredPercentage ?? 20.0;
      const advanceRequired = Number(((grandTotal * advancePercent) / 100.0).toFixed(2));

      const milestones = [
        {
          milestoneType: 'ADVANCE',
          name: 'Advance Mobilization Payment',
          percentage: advancePercent,
          amount: advanceRequired,
          isPaid: false,
        },
        {
          milestoneType: 'DISPATCH',
          name: 'Material Procurement & Dispatch Balance',
          percentage: 60.0,
          amount: Number((grandTotal * 0.60).toFixed(2)),
          isPaid: false,
        },
        {
          milestoneType: 'COMPLETION',
          name: 'Installation & Handover Balance',
          percentage: 100.0 - advancePercent - 60.0,
          amount: Number(((grandTotal * (100.0 - advancePercent - 60.0)) / 100.0).toFixed(2)),
          isPaid: false,
        },
      ];

      const order = await tx.salesOrder.create({
        data: {
          organizationId,
          orderNumber,
          customerId: quote.customerId,
          contractId: dto.contractId,
          quotationId: quote.id,
          designId: quote.designId,
          bomId: quote.bomId,
          totalAmount: quote.grandTotal,
          advanceRequired,
          advanceReceived: 0,
          status: SalesOrderStatus.DRAFT,
          fulfillmentStatus: FulfillmentStatus.NOT_STARTED,
          paymentStatus: PaymentStatus.UNPAID,
          prerequisitesMet: false,
          createdById: userId,
          milestones: {
            create: milestones.map((m) => ({
              organizationId,
              milestoneType: m.milestoneType,
              name: m.name,
              percentage: m.percentage,
              amount: m.amount,
              isPaid: m.isPaid,
            })),
          },
        },
        include: {
          customer: true,
          milestones: true,
          quotation: true,
        },
      });

      return order;
    });
  }

  /**
   * 2. Record Customer Advance Payment
   */
  async recordAdvancePayment(
    organizationId: string,
    orderId: string,
    dto: RecordAdvancePaymentDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const order = await tx.salesOrder.findFirst({
        where: { id: orderId, organizationId },
        include: { milestones: true },
      });

      if (!order) {
        throw new NotFoundException(`Sales Order ${orderId} not found`);
      }

      const newAdvanceReceived = Number((order.advanceReceived.toNumber() + dto.amount).toFixed(2));
      const advanceMet = newAdvanceReceived >= order.advanceRequired.toNumber();
      const isFullyPaid = newAdvanceReceived >= order.totalAmount.toNumber();

      if (advanceMet) {
        await tx.salesOrderMilestone.updateMany({
          where: {
            salesOrderId: orderId,
            milestoneType: 'ADVANCE',
          },
          data: {
            isPaid: true,
          },
        });
      }

      return await tx.salesOrder.update({
        where: { id: orderId },
        data: {
          advanceReceived: newAdvanceReceived,
          prerequisitesMet: advanceMet,
          paymentStatus: isFullyPaid
            ? PaymentStatus.PAID
            : newAdvanceReceived > 0
            ? PaymentStatus.PARTIALLY_PAID
            : PaymentStatus.UNPAID,
        },
        include: {
          customer: true,
          milestones: true,
          projectInitiation: true,
        },
      });
    });
  }

  /**
   * 3. Confirm Order & Trigger Project Initiation Handoff (Phase 3/4/5)
   */
  async confirmSalesOrder(
    organizationId: string,
    orderId: string,
    dto: ConfirmSalesOrderDto,
    userId?: string,
  ) {
    const projectCode = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'PROJECT',
      'PRJ',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const order = await tx.salesOrder.findFirst({
        where: { id: orderId, organizationId },
        include: {
          customer: true,
          design: {
            include: {
              revisions: { take: 1, orderBy: { revisionNumber: 'desc' } },
              site: true,
            },
          },
          bom: { include: { items: true } },
          projectInitiation: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Sales Order ${orderId} not found`);
      }

      if (!order.prerequisitesMet && order.advanceReceived.toNumber() < order.advanceRequired.toNumber()) {
        throw new BadRequestException(
          `Commercial Prerequisites Failed: Minimum advance payment of ₹${order.advanceRequired.toString()} is required. Current advance received is ₹${order.advanceReceived.toString()}.`,
        );
      }

      if (order.status === SalesOrderStatus.CONFIRMED && order.projectInitiation) {
        return order;
      }

      const projectName = `Solar Installation - ${order.customer.name} (${order.design.targetCapacityKw.toString()} kWp)`;

      const confirmedOrder = await tx.salesOrder.update({
        where: { id: orderId },
        data: {
          status: SalesOrderStatus.CONFIRMED,
          fulfillmentStatus: FulfillmentStatus.PROCUREMENT,
          confirmedAt: new Date(),
          confirmedById: userId,
        },
      });

      const projectInitiation = await tx.projectInitiation.create({
        data: {
          organizationId,
          salesOrderId: orderId,
          projectCode,
          projectName,
          customerId: order.customerId,
          siteId: order.design.siteId,
          systemCapacityKw: order.design.targetCapacityKw,
          systemType: order.design.systemType,
          bomSnapshot: {
            bomNumber: order.bom.bomNumber,
            totalMaterialCost: order.bom.totalMaterialCost,
            itemsCount: order.bom.items.length,
            items: order.bom.items,
          } as any,
          designSnapshot: {
            designNumber: order.design.designNumber,
            targetCapacityKw: order.design.targetCapacityKw,
            systemType: order.design.systemType,
            connectionType: order.design.connectionType,
            latestRevision: order.design.revisions[0],
          } as any,
          handoverStatus: ProjectHandoverStatus.READY_FOR_PROCUREMENT,
          handedOverAt: new Date(),
          initiatedById: userId ?? order.createdById ?? order.customerId,
        },
      });

      return {
        ...confirmedOrder,
        projectInitiation,
      };
    });
  }

  /**
   * 4. Get Sales Order by ID
   */
  async getOrder(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const order = await tx.salesOrder.findFirst({
        where: { id, organizationId },
        include: {
          customer: true,
          contract: true,
          quotation: true,
          design: {
            include: {
              site: true,
              revisions: { take: 1, orderBy: { revisionNumber: 'desc' } },
            },
          },
          bom: { include: { items: true } },
          milestones: { orderBy: { createdAt: 'asc' } },
          projectInitiation: true,
        },
      });

      if (!order) {
        throw new NotFoundException(`Sales Order ${id} not found`);
      }

      return order;
    });
  }

  /**
   * 5. List Sales Orders for Tenant
   */
  async listOrders(organizationId: string | { organizationId: string }, query?: { customerId?: string; status?: string }) {
    const orgId =
      typeof organizationId === 'object' && organizationId !== null && 'organizationId' in organizationId
        ? (organizationId as any).organizationId
        : organizationId;
    return await this.prisma.forTenant(orgId, async (tx) => {
      const where: any = { organizationId: orgId };
      if (query?.customerId) where.customerId = query.customerId;
      if (query?.status) where.status = query.status;

      return await tx.salesOrder.findMany({
        where,
        include: {
          customer: true,
          milestones: true,
          projectInitiation: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }
}
