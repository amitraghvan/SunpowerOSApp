import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  GenerateMRPFromProjectDto,
  CreatePurchaseRequisitionDto,
  ApproveRequisitionDto,
  RejectRequisitionDto,
  CreateRFQDto,
  SubmitSupplierQuotationDto,
  AwardRFQDto,
  CreatePurchaseOrderDto,
  CreatePORevisionDto,
  ApprovePurchaseOrderDto,
  CreateDeliveryScheduleDto,
} from '@solaros/contracts';
import {
  MaterialRequirementStatus,
  RequisitionStatus,
  RFQStatus,
  SupplierQuotationStatus,
  PurchaseOrderStatus,
  POApprovalStatus,
  DeliveryScheduleStatus,
} from '@solaros/types';

@Injectable()
export class ProcurementService {
  private readonly logger = new Logger(ProcurementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  // ===========================================================================
  // 1. MATERIAL REQUIREMENT PLANNING (MRP)
  // ===========================================================================

  async generateMRPFromProject(organizationId: string, dto: GenerateMRPFromProjectDto, userId?: string) {
    const requirementNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'REQUISITION',
      'MRP',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
        include: {
          salesOrder: {
            include: {
              bom: {
                include: {
                  items: {
                    include: {
                      variant: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!project) {
        throw new NotFoundException(`ProjectInitiation ${dto.projectInitiationId} not found`);
      }

      const bomItems = project.salesOrder?.bom?.items || [];
      if (bomItems.length === 0) {
        throw new BadRequestException(`No BOM items found for project ${project.projectCode}`);
      }

      let totalEstimatedCost = 0;
      const linesData = [];

      for (const item of bomItems) {
        if (!item.variantId) continue;

        // Check stock availability in inventory
        const existingStock = await tx.productSerial.count({
          where: {
            organizationId,
            productVariantId: item.variantId,
            status: 'IN_STOCK',
          },
        });

        const allocatedStock = await tx.productSerial.count({
          where: {
            organizationId,
            productVariantId: item.variantId,
            status: 'ALLOCATED',
          },
        });

        const requiredQty = Number(item.effectiveQuantity);
        const netProcurementQty = Math.max(0, requiredQty - existingStock + allocatedStock);
        const unitCost = Number(item.unitCost);
        const lineTotal = netProcurementQty * unitCost;

        totalEstimatedCost += lineTotal;

        linesData.push({
          organizationId,
          productVariantId: item.variantId,
          category: item.category,
          requiredQuantity: requiredQty,
          existingStockQuantity: existingStock,
          allocatedStockQuantity: allocatedStock,
          netProcurementQuantity: netProcurementQty,
          estimatedUnitCost: unitCost,
          estimatedTotalCost: lineTotal,
          unitOfMeasure: item.uom || 'PCS',
          notes: `Auto-planned from BOM Item: ${item.itemCode} - ${item.description}`,
        });
      }

      const mrp = await tx.materialRequirement.create({
        data: {
          organizationId,
          requirementNumber,
          title: `MRP for Project ${project.projectCode} (${project.projectName})`,
          projectInitiationId: project.id,
          salesOrderId: project.salesOrderId,
          bomId: project.salesOrder?.bomId,
          status: MaterialRequirementStatus.CALCULATED,
          totalItems: linesData.length,
          estimatedTotalAmount: totalEstimatedCost,
          plannedDate: dto.plannedDate || new Date(),
          createdById: userId,
          lines: {
            create: linesData,
          },
        },
        include: {
          lines: {
            include: {
              productVariant: true,
            },
          },
          projectInitiation: true,
        },
      });

      this.logger.log(`Generated MRP ${mrp.requirementNumber} for Project ${project.projectCode}`);
      return mrp;
    });
  }

  async listMaterialRequirements(organizationId: string, filters?: { status?: string; search?: string }) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.status) where.status = filters.status;
      if (filters?.search) {
        where.OR = [
          { requirementNumber: { contains: filters.search, mode: 'insensitive' } },
          { title: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await tx.materialRequirement.findMany({
        where,
        include: {
          projectInitiation: { select: { projectCode: true, projectName: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { lines: true, purchaseRequisitions: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async getMaterialRequirement(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const mrp = await tx.materialRequirement.findFirst({
        where: { id, organizationId },
        include: {
          projectInitiation: true,
          salesOrder: true,
          bom: true,
          lines: {
            include: {
              productVariant: {
                include: { product: true },
              },
            },
          },
          purchaseRequisitions: true,
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      if (!mrp) throw new NotFoundException(`MaterialRequirement ${id} not found`);
      return mrp;
    });
  }

  async convertMRPToRequisition(organizationId: string, mrpId: string, userId?: string) {
    const requisitionNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'REQUISITION',
      'PR',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const mrp = await tx.materialRequirement.findFirst({
        where: { id: mrpId, organizationId },
        include: { lines: true },
      });

      if (!mrp) throw new NotFoundException(`MRP ${mrpId} not found`);

      // Filter lines where net procurement qty > 0
      const activeLines = mrp.lines.filter((l) => Number(l.netProcurementQuantity) > 0);
      if (activeLines.length === 0) {
        throw new BadRequestException('No items with net procurement quantity greater than zero.');
      }

      const totalEstimated = activeLines.reduce(
        (sum, l) => sum + Number(l.netProcurementQuantity) * Number(l.estimatedUnitCost),
        0,
      );

      const pr = await tx.purchaseRequisition.create({
        data: {
          organizationId,
          requisitionNumber,
          title: `Requisition from ${mrp.requirementNumber}`,
          purpose: 'PROJECT_SPECIFIC',
          status: RequisitionStatus.DRAFT,
          priority: 'HIGH',
          projectInitiationId: mrp.projectInitiationId,
          salesOrderId: mrp.salesOrderId,
          materialRequirementId: mrp.id,
          requestedById: userId,
          totalEstimatedAmount: totalEstimated,
          lines: {
            create: activeLines.map((l) => ({
              organizationId,
              productVariantId: l.productVariantId,
              requestedQuantity: l.netProcurementQuantity,
              approvedQuantity: l.netProcurementQuantity,
              estimatedUnitCost: l.estimatedUnitCost,
              estimatedTotalCost: Number(l.netProcurementQuantity) * Number(l.estimatedUnitCost),
              notes: l.notes,
            })),
          },
        },
        include: { lines: true },
      });

      await tx.materialRequirement.update({
        where: { id: mrpId },
        data: { status: MaterialRequirementStatus.CONVERTED_TO_PR },
      });

      return pr;
    });
  }

  // ===========================================================================
  // 2. PURCHASE REQUISITIONS (PR)
  // ===========================================================================

  async createRequisition(organizationId: string, dto: CreatePurchaseRequisitionDto, userId?: string) {
    const requisitionNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'REQUISITION',
      'PR',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      let totalAmount = 0;
      const lines = dto.lines.map((l) => {
        const lineTotal = l.requestedQuantity * l.estimatedUnitCost;
        totalAmount += lineTotal;
        return {
          organizationId,
          productVariantId: l.productVariantId,
          requestedQuantity: l.requestedQuantity,
          approvedQuantity: l.requestedQuantity,
          estimatedUnitCost: l.estimatedUnitCost,
          estimatedTotalCost: lineTotal,
          notes: l.notes,
        };
      });

      return await tx.purchaseRequisition.create({
        data: {
          organizationId,
          requisitionNumber,
          title: dto.title,
          purpose: dto.purpose || 'PROJECT_SPECIFIC',
          status: RequisitionStatus.DRAFT,
          priority: dto.priority || 'MEDIUM',
          requiredByDate: dto.requiredByDate,
          projectInitiationId: dto.projectInitiationId,
          salesOrderId: dto.salesOrderId,
          materialRequirementId: dto.materialRequirementId,
          requestedById: userId,
          totalEstimatedAmount: totalAmount,
          notes: dto.notes,
          lines: {
            create: lines,
          },
        },
        include: {
          lines: {
            include: { productVariant: true },
          },
        },
      });
    });
  }

  async submitRequisition(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const pr = await tx.purchaseRequisition.findFirst({
        where: { id, organizationId },
      });
      if (!pr) throw new NotFoundException(`Requisition ${id} not found`);

      return await tx.purchaseRequisition.update({
        where: { id },
        data: { status: RequisitionStatus.SUBMITTED },
      });
    });
  }

  async approveRequisition(organizationId: string, id: string, dto: ApproveRequisitionDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const pr = await tx.purchaseRequisition.findFirst({
        where: { id, organizationId },
        include: { lines: true },
      });
      if (!pr) throw new NotFoundException(`Requisition ${id} not found`);

      if (dto.lines && dto.lines.length > 0) {
        for (const lineUpdate of dto.lines) {
          await tx.purchaseRequisitionLine.update({
            where: { id: lineUpdate.lineId },
            data: { approvedQuantity: lineUpdate.approvedQuantity },
          });
        }
      }

      return await tx.purchaseRequisition.update({
        where: { id },
        data: {
          status: RequisitionStatus.APPROVED,
          approvedById: userId,
          approvedAt: new Date(),
          notes: dto.notes ? `${pr.notes || ''}\nApproval notes: ${dto.notes}` : pr.notes,
        },
        include: { lines: true },
      });
    });
  }

  async rejectRequisition(organizationId: string, id: string, dto: RejectRequisitionDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      return await tx.purchaseRequisition.update({
        where: { id },
        data: {
          status: RequisitionStatus.REJECTED,
          rejectionReason: dto.rejectionReason,
        },
      });
    });
  }

  async listRequisitions(organizationId: string, filters?: { status?: string; priority?: string; search?: string }) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.status) where.status = filters.status;
      if (filters?.priority) where.priority = filters.priority;
      if (filters?.search) {
        where.OR = [
          { requisitionNumber: { contains: filters.search, mode: 'insensitive' } },
          { title: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await tx.purchaseRequisition.findMany({
        where,
        include: {
          requestedBy: { select: { id: true, firstName: true, lastName: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { lines: true, purchaseOrders: true, rfqs: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async getRequisition(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const pr = await tx.purchaseRequisition.findFirst({
        where: { id, organizationId },
        include: {
          lines: {
            include: {
              productVariant: { include: { product: true } },
            },
          },
          projectInitiation: true,
          salesOrder: true,
          requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          rfqs: true,
          purchaseOrders: true,
        },
      });

      if (!pr) throw new NotFoundException(`Requisition ${id} not found`);
      return pr;
    });
  }

  // ===========================================================================
  // 3. REQUEST FOR QUOTATION (RFQ) & QUOTE COMPARISON
  // ===========================================================================

  async createRFQ(organizationId: string, dto: CreateRFQDto, userId?: string) {
    const rfqNumber = await this.numberingService.getNextDocumentNumber(organizationId, 'RFQ', 'RFQ');

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const rfq = await tx.rFQ.create({
        data: {
          organizationId,
          rfqNumber,
          title: dto.title,
          requisitionId: dto.requisitionId,
          status: RFQStatus.ISSUED,
          issueDate: new Date(),
          dueDate: dto.dueDate,
          termsAndConditions: dto.termsAndConditions,
          notes: dto.notes,
          createdById: userId,
          lines: {
            create: dto.lines.map((l) => ({
              organizationId,
              productVariantId: l.productVariantId,
              targetQuantity: l.targetQuantity,
              targetUnitPrice: l.targetUnitPrice,
              targetDeliveryDate: l.targetDeliveryDate,
              specifications: l.specifications,
            })),
          },
          suppliers: {
            create: dto.supplierIds.map((supplierId) => ({
              organizationId,
              supplierId,
              invitationStatus: 'INVITED',
            })),
          },
        },
        include: {
          lines: { include: { productVariant: true } },
          suppliers: { include: { supplier: true } },
        },
      });

      if (dto.requisitionId) {
        await tx.purchaseRequisition.update({
          where: { id: dto.requisitionId },
          data: { status: RequisitionStatus.RFQ_GENERATED },
        });
      }

      return rfq;
    });
  }

  async listRFQs(organizationId: string, filters?: { status?: string; search?: string }) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.status) where.status = filters.status;
      if (filters?.search) {
        where.OR = [
          { rfqNumber: { contains: filters.search, mode: 'insensitive' } },
          { title: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await tx.rFQ.findMany({
        where,
        include: {
          suppliers: { include: { supplier: { select: { supplierCode: true, legalName: true } } } },
          _count: { select: { lines: true, quotations: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async getRFQ(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const rfq = await tx.rFQ.findFirst({
        where: { id, organizationId },
        include: {
          lines: {
            include: { productVariant: { include: { product: true } } },
          },
          suppliers: {
            include: { supplier: true },
          },
          quotations: {
            include: {
              supplier: true,
              lines: { include: { productVariant: true } },
            },
          },
          requisition: true,
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      if (!rfq) throw new NotFoundException(`RFQ ${id} not found`);
      return rfq;
    });
  }

  async submitSupplierQuotation(organizationId: string, dto: SubmitSupplierQuotationDto) {
    const quotationNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'SUPPLIER_QUOTE',
      'SQ',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      let subtotal = 0;
      let totalTax = 0;

      const lines = dto.lines.map((l) => {
        const qty = Number(l.quotedQuantity);
        const price = Number(l.unitPrice);
        const taxRate = Number(l.taxRatePercent ?? 18);
        const linePrice = qty * price;
        const lineTax = linePrice * (taxRate / 100);

        subtotal += linePrice;
        totalTax += lineTax;

        return {
          organizationId,
          rfqLineId: l.rfqLineId,
          productVariantId: l.productVariantId,
          quotedQuantity: qty,
          unitPrice: price,
          taxRatePercent: taxRate,
          taxAmount: lineTax,
          totalPrice: linePrice + lineTax,
          deliveryLeadTimeDays: l.deliveryLeadTimeDays,
          notes: l.notes,
        };
      });

      const freight = Number(dto.freightCharges ?? 0);
      const other = Number(dto.otherCharges ?? 0);
      const grandTotal = subtotal + totalTax + freight + other;

      const quotation = await tx.supplierQuotation.create({
        data: {
          organizationId,
          quotationNumber,
          rfqId: dto.rfqId,
          supplierId: dto.supplierId,
          supplierQuoteReference: dto.supplierQuoteReference,
          validUntilDate: dto.validUntilDate,
          currency: dto.currency || 'INR',
          subtotalAmount: subtotal,
          taxAmount: totalTax,
          freightCharges: freight,
          otherCharges: other,
          totalAmount: grandTotal,
          deliveryLeadTimeDays: dto.deliveryLeadTimeDays,
          paymentTerms: dto.paymentTerms,
          warrantyTerms: dto.warrantyTerms,
          status: SupplierQuotationStatus.RECEIVED,
          notes: dto.notes,
          lines: {
            create: lines,
          },
        },
        include: {
          lines: true,
          supplier: true,
        },
      });

      if (dto.rfqId) {
        await tx.rFQSupplier.updateMany({
          where: {
            rfqId: dto.rfqId,
            supplierId: dto.supplierId,
            organizationId,
          },
          data: {
            invitationStatus: 'QUOTED',
            respondedAt: new Date(),
          },
        });

        await tx.rFQ.update({
          where: { id: dto.rfqId },
          data: { status: RFQStatus.RESPONSES_RECEIVED },
        });
      }

      return quotation;
    });
  }

  async compareQuotesForRFQ(organizationId: string, rfqId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const rfq = await tx.rFQ.findFirst({
        where: { id: rfqId, organizationId },
        include: {
          lines: { include: { productVariant: true } },
          quotations: {
            include: {
              supplier: true,
              lines: { include: { productVariant: true } },
            },
          },
        },
      });

      if (!rfq) throw new NotFoundException(`RFQ ${rfqId} not found`);

      // Rank quotations by lowest total amount
      const sorted = [...rfq.quotations].sort(
        (a, b) => Number(a.totalAmount) - Number(b.totalAmount),
      );

      const rankedQuotations = sorted.map((q, idx) => ({
        ...q,
        rank: idx + 1,
        isLowestBid: idx === 0,
      }));

      return {
        rfq: {
          id: rfq.id,
          rfqNumber: rfq.rfqNumber,
          title: rfq.title,
          dueDate: rfq.dueDate,
        },
        totalQuotes: rfq.quotations.length,
        lines: rfq.lines,
        comparison: rankedQuotations,
      };
    });
  }

  async awardRFQ(organizationId: string, rfqId: string, dto: AwardRFQDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const rfq = await tx.rFQ.findFirst({
        where: { id: rfqId, organizationId },
        include: {
          quotations: { include: { lines: true } },
        },
      });

      if (!rfq) throw new NotFoundException(`RFQ ${rfqId} not found`);

      const winningQuote = rfq.quotations.find((q) => q.id === dto.winningQuotationId);
      if (!winningQuote) {
        throw new NotFoundException(`Quotation ${dto.winningQuotationId} not found under RFQ ${rfqId}`);
      }

      // Mark winning quote
      await tx.supplierQuotation.updateMany({
        where: { rfqId, organizationId },
        data: { isWinning: false, status: SupplierQuotationStatus.REJECTED },
      });

      await tx.supplierQuotation.update({
        where: { id: winningQuote.id },
        data: { isWinning: true, status: SupplierQuotationStatus.ACCEPTED },
      });

      await tx.rFQ.update({
        where: { id: rfqId },
        data: {
          status: RFQStatus.AWARDED,
          awardedSupplierId: dto.winningSupplierId,
          notes: dto.awardJustification
            ? `${rfq.notes || ''}\nAward justification: ${dto.awardJustification}`
            : rfq.notes,
        },
      });

      this.logger.log(`Awarded RFQ ${rfq.rfqNumber} to Supplier ${dto.winningSupplierId}`);
      return { awarded: true, winningQuoteId: winningQuote.id };
    });
  }

  // ===========================================================================
  // 4. PURCHASE ORDERS (PO)
  // ===========================================================================

  async createPurchaseOrder(organizationId: string, dto: CreatePurchaseOrderDto, userId?: string) {
    const poNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'PURCHASE_ORDER',
      'PO',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      let subtotal = 0;
      let totalTax = 0;

      const lines = dto.lines.map((l) => {
        const qty = Number(l.orderedQuantity);
        const unitPrice = Number(l.unitPrice);
        const discountPct = Number(l.discountPercent ?? 0);
        const discountedPrice = unitPrice * (1 - discountPct / 100);
        const lineSubtotal = qty * discountedPrice;
        const taxRate = Number(l.taxRatePercent ?? 18);
        const taxAmount = lineSubtotal * (taxRate / 100);
        const lineTotal = lineSubtotal + taxAmount;

        subtotal += lineSubtotal;
        totalTax += taxAmount;

        return {
          organizationId,
          productVariantId: l.productVariantId,
          itemDescription: l.itemDescription,
          hsnCode: l.hsnCode,
          orderedQuantity: qty,
          unitPrice,
          discountPercent: discountPct,
          taxRatePercent: taxRate,
          taxAmount,
          totalAmount: lineTotal,
          expectedDate: l.expectedDate,
        };
      });

      const freight = Number(dto.freightAmount ?? 0);
      const rawTotal = subtotal + totalTax + freight;
      const roundedTotal = Math.round(rawTotal);
      const roundOff = roundedTotal - rawTotal;

      const po = await tx.purchaseOrder.create({
        data: {
          organizationId,
          poNumber,
          version: 1,
          requisitionId: dto.requisitionId,
          quotationId: dto.quotationId,
          supplierId: dto.supplierId,
          projectInitiationId: dto.projectInitiationId,
          salesOrderId: dto.salesOrderId,
          status: PurchaseOrderStatus.PENDING_APPROVAL,
          approvalStatus: POApprovalStatus.PENDING,
          orderDate: new Date(),
          expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : new Date(Date.now() + 7 * 86400000),
          billingAddress: dto.billingAddress,
          shippingAddress: dto.shippingAddress,
          currency: dto.currency || 'INR',
          subtotalAmount: subtotal,
          taxAmount: totalTax,
          freightAmount: freight,
          roundOff,
          totalAmount: roundedTotal,
          paymentTerms: dto.paymentTerms || 'NET_30',
          termsAndConditions: dto.termsAndConditions,
          notes: dto.notes,
          createdById: userId,
          lines: {
            create: lines,
          },
        },
        include: {
          lines: { include: { productVariant: true } },
          supplier: true,
        },
      });

      if (dto.requisitionId) {
        await tx.purchaseRequisition.update({
          where: { id: dto.requisitionId },
          data: { status: RequisitionStatus.ORDERED },
        });
      }

      return po;
    });
  }

  async approvePurchaseOrder(organizationId: string, id: string, dto: ApprovePurchaseOrderDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const po = await tx.purchaseOrder.findFirst({
        where: { id, organizationId },
      });
      if (!po) throw new NotFoundException(`PO ${id} not found`);

      if (dto.decision === 'APPROVE') {
        return await tx.purchaseOrder.update({
          where: { id },
          data: {
            status: PurchaseOrderStatus.APPROVED,
            approvalStatus: POApprovalStatus.APPROVED,
            approvedById: userId,
            approvedAt: new Date(),
            notes: dto.notes ? `${po.notes || ''}\nApproval notes: ${dto.notes}` : po.notes,
          },
          include: { lines: true, supplier: true },
        });
      } else {
        return await tx.purchaseOrder.update({
          where: { id },
          data: {
            status: PurchaseOrderStatus.DRAFT,
            approvalStatus: POApprovalStatus.REJECTED,
            notes: dto.rejectionReason
              ? `${po.notes || ''}\nRejection reason: ${dto.rejectionReason}`
              : po.notes,
          },
          include: { lines: true, supplier: true },
        });
      }
    });
  }

  async createPORevision(organizationId: string, originalPoId: string, dto: CreatePORevisionDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const originalPo = await tx.purchaseOrder.findFirst({
        where: { id: originalPoId, organizationId },
        include: { lines: true },
      });

      if (!originalPo) throw new NotFoundException(`PO ${originalPoId} not found`);

      const nextVersion = originalPo.version + 1;

      let subtotal = 0;
      let totalTax = 0;

      const lines = dto.lines.map((l) => {
        const qty = Number(l.orderedQuantity);
        const unitPrice = Number(l.unitPrice);
        const discountPct = Number(l.discountPercent ?? 0);
        const discountedPrice = unitPrice * (1 - discountPct / 100);
        const lineSubtotal = qty * discountedPrice;
        const taxRate = Number(l.taxRatePercent ?? 18);
        const taxAmount = lineSubtotal * (taxRate / 100);
        const lineTotal = lineSubtotal + taxAmount;

        subtotal += lineSubtotal;
        totalTax += taxAmount;

        return {
          organizationId,
          productVariantId: l.productVariantId,
          itemDescription: l.itemDescription,
          hsnCode: l.hsnCode,
          orderedQuantity: qty,
          unitPrice,
          discountPercent: discountPct,
          taxRatePercent: taxRate,
          taxAmount,
          totalAmount: lineTotal,
        };
      });

      const roundedTotal = Math.round(subtotal + totalTax + Number(originalPo.freightAmount));
      const roundOff = roundedTotal - (subtotal + totalTax + Number(originalPo.freightAmount));

      return await tx.purchaseOrder.create({
        data: {
          organizationId,
          poNumber: originalPo.poNumber,
          version: nextVersion,
          originalPoId: originalPo.originalPoId || originalPo.id,
          requisitionId: originalPo.requisitionId,
          quotationId: originalPo.quotationId,
          supplierId: originalPo.supplierId,
          projectInitiationId: originalPo.projectInitiationId,
          salesOrderId: originalPo.salesOrderId,
          status: PurchaseOrderStatus.PENDING_APPROVAL,
          approvalStatus: POApprovalStatus.PENDING,
          orderDate: new Date(),
          expectedDeliveryDate: dto.expectedDeliveryDate || originalPo.expectedDeliveryDate,
          billingAddress: originalPo.billingAddress ?? undefined,
          shippingAddress: originalPo.shippingAddress ?? undefined,
          currency: originalPo.currency,
          subtotalAmount: subtotal,
          taxAmount: totalTax,
          freightAmount: originalPo.freightAmount,
          roundOff,
          totalAmount: roundedTotal,
          paymentTerms: originalPo.paymentTerms,
          termsAndConditions: dto.termsAndConditions || originalPo.termsAndConditions,
          versionComments: dto.versionComments,
          notes: dto.notes,
          createdById: userId,
          lines: {
            create: lines,
          },
        },
        include: {
          lines: true,
          supplier: true,
        },
      });
    });
  }

  async createDeliverySchedule(organizationId: string, poId: string, dto: CreateDeliveryScheduleDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const line = await tx.purchaseOrderLine.findFirst({
        where: { id: dto.purchaseOrderLineId, purchaseOrderId: poId, organizationId },
      });

      if (!line) throw new NotFoundException(`PO Line ${dto.purchaseOrderLineId} not found`);

      return await tx.purchaseDeliverySchedule.create({
        data: {
          organizationId,
          purchaseOrderId: poId,
          purchaseOrderLineId: dto.purchaseOrderLineId,
          scheduledQuantity: dto.scheduledQuantity,
          scheduledDate: dto.scheduledDate,
          status: DeliveryScheduleStatus.PENDING,
          courierTransporter: dto.courierTransporter,
          trackingReference: dto.trackingReference,
          notes: dto.notes,
        },
      });
    });
  }

  async listPurchaseOrders(
    organizationId: string,
    filters?: {
      status?: string;
      supplierId?: string;
      projectInitiationId?: string;
      search?: string;
      skip?: number;
      take?: number;
    },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.status) where.status = filters.status;
      if (filters?.supplierId) where.supplierId = filters.supplierId;
      if (filters?.projectInitiationId) where.projectInitiationId = filters.projectInitiationId;
      if (filters?.search) {
        where.OR = [
          { poNumber: { contains: filters.search, mode: 'insensitive' } },
          { supplier: { legalName: { contains: filters.search, mode: 'insensitive' } } },
        ];
      }

      const [total, items] = await Promise.all([
        tx.purchaseOrder.count({ where }),
        tx.purchaseOrder.findMany({
          where,
          include: {
            supplier: { select: { supplierCode: true, legalName: true, gstin: true } },
            projectInitiation: { select: { projectCode: true, projectName: true } },
            createdBy: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { lines: true, goodsReceiptNotes: true, deliverySchedules: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: filters?.skip ?? 0,
          take: filters?.take ?? 50,
        }),
      ]);

      return { total, items };
    });
  }

  async getPurchaseOrder(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const po = await tx.purchaseOrder.findFirst({
        where: { id, organizationId },
        include: {
          supplier: true,
          lines: {
            include: {
              productVariant: { include: { product: true } },
              deliverySchedules: true,
              goodsReceiptLines: true,
            },
          },
          deliverySchedules: true,
          goodsReceiptNotes: {
            include: { lines: true },
          },
          supplierReturns: true,
          projectInitiation: true,
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          approvedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          revisions: true,
        },
      });

      if (!po) throw new NotFoundException(`PO ${id} not found`);
      return po;
    });
  }

  async acknowledgePO(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      return await tx.purchaseOrder.update({
        where: { id },
        data: { status: PurchaseOrderStatus.ACKNOWLEDGED },
      });
    });
  }

  // ===========================================================================
  // 5. PROCUREMENT ANALYTICS & DASHBOARD
  // ===========================================================================

  async getProcurementDashboardMetrics(organizationId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const [
        totalSuppliers,
        activeSuppliers,
        pendingPRs,
        approvedPOs,
        totalSpendAgg,
        recentPOs,
      ] = await Promise.all([
        tx.supplier.count({ where: { organizationId, deletedAt: null } }),
        tx.supplier.count({ where: { organizationId, status: 'ACTIVE', deletedAt: null } }),
        tx.purchaseRequisition.count({
          where: { organizationId, status: { in: ['SUBMITTED', 'DRAFT'] } },
        }),
        tx.purchaseOrder.count({
          where: { organizationId, status: { in: ['APPROVED', 'ISSUED', 'ACKNOWLEDGED'] } },
        }),
        tx.purchaseOrder.aggregate({
          where: { organizationId, status: { notIn: ['CANCELLED', 'DRAFT'] } },
          _sum: { totalAmount: true },
        }),
        tx.purchaseOrder.findMany({
          where: { organizationId },
          include: { supplier: { select: { legalName: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

      return {
        totalSuppliers,
        activeSuppliers,
        pendingPRs,
        approvedPOs,
        totalProcurementSpend: Number(totalSpendAgg._sum.totalAmount ?? 0),
        recentPOs,
      };
    });
  }
}
