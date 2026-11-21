import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateInventoryLocationDto,
  CreateGoodsReceiptNoteDto,
  PerformInspectionDto,
  RegisterSerialNumbersDto,
  UpdateSerialStatusDto,
  CreateSupplierReturnDto,
} from '@solaros/contracts';
import {
  GRNStatus,
  LineInspectionStatus,
  InspectionOutcome,
  ProductSerialStatus,
  MovementType,
  SupplierReturnStatus,
  PurchaseOrderStatus,
} from '@solaros/types';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  // ===========================================================================
  // 1. INVENTORY LOCATIONS
  // ===========================================================================

  async createLocation(organizationId: string, dto: CreateInventoryLocationDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const existing = await tx.inventoryLocation.findFirst({
        where: { organizationId, code: dto.code },
      });
      if (existing) throw new ConflictException(`Location code ${dto.code} already exists`);

      return await tx.inventoryLocation.create({
        data: {
          organizationId,
          code: dto.code,
          name: dto.name,
          type: dto.type,
          address: dto.address,
          isDefaultReceiving: dto.isDefaultReceiving ?? false,
        },
      });
    });
  }

  async listLocations(organizationId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      return await tx.inventoryLocation.findMany({
        where: { organizationId, isActive: true },
        orderBy: { code: 'asc' },
      });
    });
  }

  // ===========================================================================
  // 2. GOODS RECEIPT NOTES (GRN)
  // ===========================================================================

  async createGoodsReceiptNote(organizationId: string, dto: CreateGoodsReceiptNoteDto, userId?: string) {
    const grnNumber = await this.numberingService.getNextDocumentNumber(organizationId, 'GRN', 'GRN');

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const po = await tx.purchaseOrder.findFirst({
        where: { id: dto.purchaseOrderId, organizationId },
        include: { lines: true },
      });

      if (!po) throw new NotFoundException(`Purchase Order ${dto.purchaseOrderId} not found`);

      const linesData = [];
      let totalReceivedOnPO = 0;
      let totalOrderedOnPO = 0;

      for (const poLine of po.lines) {
        totalOrderedOnPO += Number(poLine.orderedQuantity);
      }

      for (const lineDto of dto.lines) {
        const matchingPoLine = po.lines.find((pl) => pl.id === lineDto.purchaseOrderLineId);
        if (!matchingPoLine) {
          throw new BadRequestException(`PO Line ${lineDto.purchaseOrderLineId} does not belong to PO ${po.poNumber}`);
        }

        const challanQty = Number(lineDto.challanQuantity ?? lineDto.receivedQuantity);
        const receivedQty = Number(lineDto.receivedQuantity);
        const shortageQty = Number(lineDto.shortageQuantity ?? Math.max(0, challanQty - receivedQty));
        const damagedQty = Number(lineDto.damagedQuantity ?? 0);
        const excessQty = Number(lineDto.excessQuantity ?? Math.max(0, receivedQty - challanQty));
        const unitCost = lineDto.unitCost !== undefined && lineDto.unitCost !== null
          ? Number(lineDto.unitCost)
          : Number(matchingPoLine.unitPrice);

        linesData.push({
          organizationId,
          purchaseOrderLineId: lineDto.purchaseOrderLineId,
          productVariantId: lineDto.productVariantId,
          challanQuantity: challanQty,
          receivedQuantity: receivedQty,
          acceptedQuantity: 0,
          rejectedQuantity: 0,
          shortageQuantity: shortageQty,
          damagedQuantity: damagedQty,
          excessQuantity: excessQty,
          unitCost,
          inspectionStatus: LineInspectionStatus.PENDING,
          notes: lineDto.notes,
        });

        // Update received quantity on PO line
        const newReceivedQty = Number(matchingPoLine.receivedQuantity) + receivedQty;
        const isFully = newReceivedQty >= Number(matchingPoLine.orderedQuantity);

        await tx.purchaseOrderLine.update({
          where: { id: matchingPoLine.id },
          data: {
            receivedQuantity: newReceivedQty,
            isFullyReceived: isFully,
          },
        });

        totalReceivedOnPO += newReceivedQty;
      }

      const grn = await tx.goodsReceiptNote.create({
        data: {
          organizationId,
          grnNumber,
          purchaseOrderId: dto.purchaseOrderId,
          supplierId: dto.supplierId,
          supplierInvoiceNumber: dto.supplierInvoiceNumber,
          supplierInvoiceDate: dto.supplierInvoiceDate,
          supplierChallanNumber: dto.supplierChallanNumber,
          supplierChallanDate: dto.supplierChallanDate,
          gatePassNumber: dto.gatePassNumber,
          vehicleNumber: dto.vehicleNumber,
          transporterName: dto.transporterName,
          lrNumber: dto.lrNumber,
          receivedDate: new Date(),
          status: GRNStatus.INSPECTION_PENDING,
          receivedById: userId,
          receivedLocationId: dto.receivedLocationId,
          remarks: dto.remarks,
          lines: {
            create: linesData,
          },
        },
        include: {
          lines: { include: { productVariant: true } },
          supplier: true,
          purchaseOrder: true,
        },
      });

      // Update PO status to PARTIALLY_RECEIVED or FULLY_RECEIVED
      const poStatus =
        totalReceivedOnPO >= totalOrderedOnPO
          ? PurchaseOrderStatus.FULLY_RECEIVED
          : PurchaseOrderStatus.PARTIALLY_RECEIVED;

      await tx.purchaseOrder.update({
        where: { id: dto.purchaseOrderId },
        data: { status: poStatus },
      });

      this.logger.log(`Created GRN ${grn.grnNumber} for PO ${po.poNumber}`);
      return grn;
    });
  }

  async listGoodsReceiptNotes(
    organizationId: string,
    filters?: { status?: string; supplierId?: string; search?: string; skip?: number; take?: number },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.status) where.status = filters.status;
      if (filters?.supplierId) where.supplierId = filters.supplierId;
      if (filters?.search) {
        where.OR = [
          { grnNumber: { contains: filters.search, mode: 'insensitive' } },
          { supplierInvoiceNumber: { contains: filters.search, mode: 'insensitive' } },
          { supplierChallanNumber: { contains: filters.search, mode: 'insensitive' } },
          { gatePassNumber: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [total, items] = await Promise.all([
        tx.goodsReceiptNote.count({ where }),
        tx.goodsReceiptNote.findMany({
          where,
          include: {
            supplier: { select: { supplierCode: true, legalName: true } },
            purchaseOrder: { select: { poNumber: true, totalAmount: true } },
            receivedBy: { select: { id: true, firstName: true, lastName: true } },
            receivedLocation: { select: { code: true, name: true } },
            _count: { select: { lines: true, qualityInspections: true, serials: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: filters?.skip ?? 0,
          take: filters?.take ?? 50,
        }),
      ]);

      return { total, items };
    });
  }

  async getGoodsReceiptNote(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const grn = await tx.goodsReceiptNote.findFirst({
        where: { id, organizationId },
        include: {
          supplier: true,
          purchaseOrder: {
            include: { lines: true },
          },
          receivedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          receivedLocation: true,
          lines: {
            include: {
              productVariant: { include: { product: true } },
              qualityInspections: true,
              serials: true,
            },
          },
          qualityInspections: {
            include: { inspectedBy: { select: { id: true, firstName: true, lastName: true } } },
          },
          serials: true,
          supplierReturns: true,
        },
      });

      if (!grn) throw new NotFoundException(`GRN ${id} not found`);
      return grn;
    });
  }

  // ===========================================================================
  // 3. QUALITY INSPECTION (QIR)
  // ===========================================================================

  async performQualityInspection(organizationId: string, dto: PerformInspectionDto, userId?: string) {
    const inspectionNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'INSPECTION',
      'QIR',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const grnLine = await tx.goodsReceiptLine.findFirst({
        where: { id: dto.goodsReceiptLineId, goodsReceiptNoteId: dto.goodsReceiptNoteId, organizationId },
      });

      if (!grnLine) {
        throw new NotFoundException(`GRN Line ${dto.goodsReceiptLineId} not found`);
      }

      const passed = Number(dto.passedQuantity);
      const rejected = Number(dto.rejectedQuantity);
      const conditional = Number(dto.conditionalQuantity ?? 0);

      const inspection = await tx.qualityInspection.create({
        data: {
          organizationId,
          inspectionNumber,
          goodsReceiptNoteId: dto.goodsReceiptNoteId,
          goodsReceiptLineId: dto.goodsReceiptLineId,
          productVariantId: dto.productVariantId,
          inspectionType: dto.inspectionType || 'COMPLETE',
          totalInspectedQuantity: dto.totalInspectedQuantity,
          passedQuantity: passed,
          rejectedQuantity: rejected,
          conditionalQuantity: conditional,
          overallOutcome: dto.overallOutcome,
          checklistResults: dto.checklistResults,
          measurements: dto.measurements,
          photoEvidenceUrls: dto.photoEvidenceUrls || [],
          rejectionReasons: dto.rejectionReasons || [],
          actionRecommended: dto.actionRecommended,
          inspectedById: userId,
          inspectedAt: new Date(),
          inspectorNotes: dto.inspectorNotes,
        },
      });

      // Determine line inspection status
      let lineStatus: string = LineInspectionStatus.PASSED;
      if (dto.overallOutcome === InspectionOutcome.FAIL) {
        lineStatus = LineInspectionStatus.REJECTED;
      } else if (dto.overallOutcome === InspectionOutcome.CONDITIONAL_PASS) {
        lineStatus = LineInspectionStatus.CONDITIONAL_PASS;
      }

      // Update GRN Line
      await tx.goodsReceiptLine.update({
        where: { id: dto.goodsReceiptLineId },
        data: {
          acceptedQuantity: passed + conditional,
          rejectedQuantity: rejected,
          inspectionStatus: lineStatus,
        },
      });

      // Update PO Line accepted & rejected
      await tx.purchaseOrderLine.update({
        where: { id: grnLine.purchaseOrderLineId },
        data: {
          acceptedQuantity: { increment: passed + conditional },
          rejectedQuantity: { increment: rejected },
        },
      });

      // Check if all lines in GRN are inspected
      const allLines = await tx.goodsReceiptLine.findMany({
        where: { goodsReceiptNoteId: dto.goodsReceiptNoteId, organizationId },
      });

      const pendingLines = allLines.filter((l) => l.inspectionStatus === LineInspectionStatus.PENDING);
      if (pendingLines.length === 0) {
        const hasRejections = allLines.some((l) => Number(l.rejectedQuantity) > 0);
        const hasAcceptance = allLines.some((l) => Number(l.acceptedQuantity) > 0);

        let grnOutcome = GRNStatus.INSPECTED;
        if (hasAcceptance && !hasRejections) grnOutcome = GRNStatus.FULLY_ACCEPTED;
        else if (hasAcceptance && hasRejections) grnOutcome = GRNStatus.PARTIALLY_ACCEPTED;
        else if (!hasAcceptance && hasRejections) grnOutcome = GRNStatus.REJECTED;

        await tx.goodsReceiptNote.update({
          where: { id: dto.goodsReceiptNoteId },
          data: { status: grnOutcome },
        });
      }

      return inspection;
    });
  }

  // ===========================================================================
  // 4. SERIAL & BATCH REGISTRATION (TRACEABILITY)
  // ===========================================================================

  async registerSerialNumbers(organizationId: string, dto: RegisterSerialNumbersDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const grn = await tx.goodsReceiptNote.findFirst({
        where: { id: dto.goodsReceiptNoteId, organizationId },
        include: { receivedLocation: true },
      });

      if (!grn) throw new NotFoundException(`GRN ${dto.goodsReceiptNoteId} not found`);

      const registeredSerials = [];
      const movementsData = [];

      for (const item of dto.serials) {
        const existingSerial = await tx.productSerial.findFirst({
          where: {
            organizationId,
            manufacturerSerialNumber: item.manufacturerSerialNumber,
            productVariantId: dto.productVariantId,
          },
        });

        if (existingSerial) {
          throw new ConflictException(
            `Serial number ${item.manufacturerSerialNumber} is already registered for this variant`,
          );
        }

        const internalAssetCode = await this.numberingService.getNextDocumentNumber(
          organizationId,
          'SERIAL',
          'AST',
        );

        const serial = await tx.productSerial.create({
          data: {
            organizationId,
            productVariantId: dto.productVariantId,
            goodsReceiptNoteId: dto.goodsReceiptNoteId,
            goodsReceiptLineId: dto.goodsReceiptLineId,
            inspectionId: dto.inspectionId,
            manufacturerSerialNumber: item.manufacturerSerialNumber,
            internalAssetCode,
            barcode: item.barcode || internalAssetCode,
            qrCode: item.qrCode || `SOLAROS:${internalAssetCode}`,
            batchNumber: item.batchNumber,
            status: ProductSerialStatus.IN_STOCK,
            storageLocationId: grn.receivedLocationId,
            electricalSpecs: item.electricalSpecs,
            warrantyPeriodMonths: item.warrantyPeriodMonths ?? 60,
            registeredById: userId,
          },
        });

        registeredSerials.push(serial);

        // Ledger Movement
        const movementNumber = await this.numberingService.getNextDocumentNumber(
          organizationId,
          'MOVEMENT',
          'MOV',
        );

        movementsData.push({
          organizationId,
          movementNumber,
          movementType: MovementType.PURCHASE_RECEIPT,
          productVariantId: dto.productVariantId,
          toLocationId: grn.receivedLocationId,
          quantity: 1,
          unitCost: 0,
          totalValue: 0,
          referenceType: 'GRN',
          referenceId: grn.grnNumber,
          batchNumber: item.batchNumber,
          notes: `Serial registered: ${serial.manufacturerSerialNumber} (${serial.internalAssetCode})`,
          createdById: userId,
        });
      }

      // Record Inbound Ledger Movements
      for (const mov of movementsData) {
        await tx.inventoryReceiptMovement.create({ data: mov });
      }

      this.logger.log(
        `Registered ${registeredSerials.length} serials for variant ${dto.productVariantId} under GRN ${grn.grnNumber}`,
      );
      return registeredSerials;
    });
  }

  async listSerials(
    organizationId: string,
    filters?: {
      productVariantId?: string;
      status?: string;
      batchNumber?: string;
      search?: string;
      skip?: number;
      take?: number;
    },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.productVariantId) where.productVariantId = filters.productVariantId;
      if (filters?.status) where.status = filters.status;
      if (filters?.batchNumber) where.batchNumber = filters.batchNumber;
      if (filters?.search) {
        where.OR = [
          { manufacturerSerialNumber: { contains: filters.search, mode: 'insensitive' } },
          { internalAssetCode: { contains: filters.search, mode: 'insensitive' } },
          { barcode: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const [total, items] = await Promise.all([
        tx.productSerial.count({ where }),
        tx.productSerial.findMany({
          where,
          include: {
            productVariant: { include: { product: true } },
            storageLocation: { select: { code: true, name: true } },
            goodsReceiptNote: { select: { grnNumber: true, receivedDate: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: filters?.skip ?? 0,
          take: filters?.take ?? 50,
        }),
      ]);

      return { total, items };
    });
  }

  async getSerialDetails(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const serial = await tx.productSerial.findFirst({
        where: { id, organizationId },
        include: {
          productVariant: { include: { product: true } },
          goodsReceiptNote: { include: { supplier: true, purchaseOrder: true } },
          qualityInspection: true,
          storageLocation: true,
          registeredBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      if (!serial) throw new NotFoundException(`Serial ${id} not found`);
      return serial;
    });
  }

  async updateSerialStatus(organizationId: string, id: string, dto: UpdateSerialStatusDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      return await tx.productSerial.update({
        where: { id },
        data: {
          status: dto.status,
          storageLocationId: dto.storageLocationId,
        },
      });
    });
  }

  // ===========================================================================
  // 5. SUPPLIER RETURNS & REPLACEMENTS
  // ===========================================================================

  async createSupplierReturn(organizationId: string, dto: CreateSupplierReturnDto, userId?: string) {
    const returnNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'SUPPLIER_RETURN',
      'RET',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      let totalReturnAmount = 0;
      const linesData = [];

      for (const lineDto of dto.lines) {
        const qty = Number(lineDto.returnedQuantity);
        const price = Number(lineDto.unitPrice);
        const lineTotal = qty * price;
        totalReturnAmount += lineTotal;

        linesData.push({
          organizationId,
          productVariantId: lineDto.productVariantId,
          goodsReceiptLineId: lineDto.goodsReceiptLineId,
          returnedQuantity: qty,
          unitPrice: price,
          totalAmount: lineTotal,
          serialNumbers: lineDto.serialNumbers || [],
          reason: lineDto.reason,
        });

        // If serial numbers are provided, update their status to RETURNED_TO_VENDOR
        if (lineDto.serialNumbers && lineDto.serialNumbers.length > 0) {
          await tx.productSerial.updateMany({
            where: {
              organizationId,
              manufacturerSerialNumber: { in: lineDto.serialNumbers },
            },
            data: {
              status: ProductSerialStatus.RETURNED_TO_VENDOR,
            },
          });
        }
      }

      const ret = await tx.supplierReturn.create({
        data: {
          organizationId,
          returnNumber,
          supplierId: dto.supplierId,
          goodsReceiptNoteId: dto.goodsReceiptNoteId,
          purchaseOrderId: dto.purchaseOrderId,
          status: SupplierReturnStatus.SUBMITTED,
          returnType: dto.returnType,
          totalReturnAmount,
          reason: dto.reason,
          debitNoteNumber: dto.debitNoteNumber,
          transporterDetails: dto.transporterDetails,
          createdById: userId,
          lines: {
            create: linesData,
          },
        },
        include: {
          lines: { include: { productVariant: true } },
          supplier: true,
        },
      });

      // Record Inventory Ledger Movement (SUPPLIER_RETURN)
      const movementNumber = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'MOVEMENT',
        'MOV',
      );

      for (const line of linesData) {
        await tx.inventoryReceiptMovement.create({
          data: {
            organizationId,
            movementNumber,
            movementType: MovementType.SUPPLIER_RETURN,
            productVariantId: line.productVariantId,
            quantity: line.returnedQuantity,
            unitCost: line.unitPrice,
            totalValue: line.totalAmount,
            referenceType: 'RETURN',
            referenceId: ret.returnNumber,
            notes: `Supplier return dispatch: ${ret.returnNumber} (${dto.reason})`,
            createdById: userId,
          },
        });
      }

      return ret;
    });
  }

  async listSupplierReturns(organizationId: string, filters?: { status?: string; search?: string }) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.status) where.status = filters.status;
      if (filters?.search) {
        where.OR = [
          { returnNumber: { contains: filters.search, mode: 'insensitive' } },
          { debitNoteNumber: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await tx.supplierReturn.findMany({
        where,
        include: {
          supplier: { select: { supplierCode: true, legalName: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { lines: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  async getSupplierReturn(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const ret = await tx.supplierReturn.findFirst({
        where: { id, organizationId },
        include: {
          supplier: true,
          lines: { include: { productVariant: true } },
          goodsReceiptNote: true,
          purchaseOrder: true,
          createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      if (!ret) throw new NotFoundException(`SupplierReturn ${id} not found`);
      return ret;
    });
  }

  // ===========================================================================
  // 6. INBOUND LEDGER MOVEMENTS
  // ===========================================================================

  async listMovements(
    organizationId: string,
    filters?: { productVariantId?: string; movementType?: string; search?: string },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.productVariantId) where.productVariantId = filters.productVariantId;
      if (filters?.movementType) where.movementType = filters.movementType;
      if (filters?.search) {
        where.OR = [
          { movementNumber: { contains: filters.search, mode: 'insensitive' } },
          { referenceId: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await tx.inventoryReceiptMovement.findMany({
        where,
        include: {
          productVariant: { select: { sku: true, name: true } },
          fromLocation: { select: { code: true, name: true } },
          toLocation: { select: { code: true, name: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }
}
