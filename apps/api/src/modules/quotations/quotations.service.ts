import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import { PricingService } from './pricing.service';
import { CreateQuotationDto, RecordQuotationAcceptanceDto } from '@solaros/contracts';
import { QuotationStatus, BOMStatus, EngineeringDesignStatus } from '@solaros/types';

@Injectable()
export class QuotationsService {
  private readonly logger = new Logger(QuotationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
    private readonly pricingService: PricingService,
  ) {}

  /**
   * 1. Create a Commercial Quotation from an Approved BOM & Engineering Design
   */
  async createQuotation(organizationId: string, dto: CreateQuotationDto, userId?: string) {
    const quotationNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'QUOTATION',
      'QTN',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      // 1. Verify Design exists and is APPROVED
      const design = await tx.engineeringDesign.findFirst({
        where: { id: dto.designId, organizationId },
      });
      if (!design) {
        throw new NotFoundException(`Engineering Design ${dto.designId} not found`);
      }
      if (design.status !== EngineeringDesignStatus.APPROVED) {
        throw new BadRequestException(
          `Cannot generate quotation from design with status '${design.status}'. Design must be APPROVED.`,
        );
      }

      // 2. Verify BOM exists and is APPROVED
      const bom = await tx.billOfMaterials.findFirst({
        where: { id: dto.bomId, organizationId },
        include: { items: true },
      });
      if (!bom) {
        throw new NotFoundException(`BOM ${dto.bomId} not found`);
      }
      if (bom.status !== BOMStatus.APPROVED && bom.status !== BOMStatus.FROZEN) {
        throw new BadRequestException(
          `Cannot generate quotation from BOM with status '${bom.status}'. BOM must be APPROVED.`,
        );
      }

      // 3. Calculate Pricing, Margins, Subsidy, GST
      const pricing = this.pricingService.calculatePricing({
        systemCapacityKw: design.targetCapacityKw.toNumber(),
        totalMaterialCost: bom.totalMaterialCost.toNumber(),
        discountPercent: dto.discountPercent,
        customDiscountAmount: dto.discountAmount,
      });

      const validDays = dto.validDays ?? 30;
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validDays);

      const defaultPaymentTerms = dto.paymentTerms ?? {
        advanceBookingPercent: 20,
        materialReadinessPercent: 60,
        installationCompletePercent: 15,
        commissioningPercent: 5,
      };

      const scopeOfWork =
        dto.scopeOfWork ??
        `Turnkey supply, engineering, installation, testing, and commissioning of ${design.targetCapacityKw.toString()} kWp rooftop solar PV power plant with net metering liaison.`;

      // 4. Categorized Quotation Line Items
      const quotationItems = [
        {
          itemCategory: 'EQUIPMENT',
          description: `Solar PV Modules & Inverters Package (${design.targetCapacityKw.toString()} kWp rated capacity)`,
          quantity: 1,
          uom: 'LOT',
          unitPrice: Number((pricing.taxBreakdown.taxableAmount * 0.70).toFixed(2)),
          discountAmount: 0,
          taxPercent: 12.0,
          taxAmount: pricing.taxBreakdown.equipmentGstAmount,
          totalAmount: Number(((pricing.taxBreakdown.taxableAmount * 0.70) + pricing.taxBreakdown.equipmentGstAmount).toFixed(2)),
          sortOrder: 1,
        },
        {
          itemCategory: 'INSTALLATION',
          description: 'Mounting Structure Erection, DC/AC Cabling, Earthing & Turnkey Commissioning Services',
          quantity: 1,
          uom: 'LOT',
          unitPrice: Number((pricing.taxBreakdown.taxableAmount * 0.30).toFixed(2)),
          discountAmount: 0,
          taxPercent: 18.0,
          taxAmount: pricing.taxBreakdown.servicesGstAmount,
          totalAmount: Number(((pricing.taxBreakdown.taxableAmount * 0.30) + pricing.taxBreakdown.servicesGstAmount).toFixed(2)),
          sortOrder: 2,
        },
      ];

      const quotation = await tx.quotation.create({
        data: {
          organizationId,
          quotationNumber,
          customerId: dto.customerId,
          siteId: dto.siteId,
          designId: dto.designId,
          bomId: dto.bomId,
          activeVersionNumber: 1,
          status: QuotationStatus.DRAFT,
          totalAmount: pricing.taxBreakdown.taxableAmount,
          taxAmount: pricing.taxBreakdown.totalTaxAmount,
          grandTotal: pricing.grandTotal,
          subsidyAmount: pricing.estimate.estSubsidyAmount,
          netCustomerPayable: pricing.netCustomerPayable,
          validUntil,
          scopeOfWork,
          paymentTerms: defaultPaymentTerms,
          warrantyTerms: dto.warrantyTerms ?? '25-Year Performance Warranty on Modules, 5-Year Comprehensive Warranty on Inverter & Workmanship',
          createdById: userId,
          items: {
            create: quotationItems.map((qi) => ({
              organizationId,
              itemCategory: qi.itemCategory,
              description: qi.description,
              quantity: qi.quantity,
              uom: qi.uom,
              unitPrice: qi.unitPrice,
              discountAmount: qi.discountAmount,
              taxPercent: qi.taxPercent,
              taxAmount: qi.taxAmount,
              totalAmount: qi.totalAmount,
              sortOrder: qi.sortOrder,
            })),
          },
          costEstimate: {
            create: {
              organizationId,
              bomId: dto.bomId,
              materialCost: pricing.estimate.materialCost,
              laborCost: pricing.estimate.laborCost,
              transportCost: pricing.estimate.transportCost,
              engineeringServicesCost: pricing.estimate.engineeringServicesCost,
              statutoryFees: pricing.estimate.statutoryFees,
              subtotalCost: pricing.estimate.subtotalCost,
              overheadMarginPercent: pricing.estimate.overheadMarginPercent,
              profitMarginPercent: pricing.estimate.profitMarginPercent,
              baseSellingPrice: pricing.estimate.baseSellingPrice,
              discountPercent: pricing.estimate.discountPercent,
              discountAmount: pricing.estimate.discountAmount,
              finalSellingPrice: pricing.estimate.finalSellingPrice,
              isSubsidyEligible: pricing.estimate.isSubsidyEligible,
              estSubsidyAmount: pricing.estimate.estSubsidyAmount,
              netPayableByCustomer: pricing.estimate.netPayableByCustomer,
            },
          },
          versions: {
            create: {
              organizationId,
              versionNumber: 1,
              totalAmount: pricing.taxBreakdown.taxableAmount,
              taxAmount: pricing.taxBreakdown.totalTaxAmount,
              grandTotal: pricing.grandTotal,
              snapshotData: {
                pricing,
                designSummary: {
                  title: design.title,
                  targetCapacityKw: design.targetCapacityKw,
                  systemType: design.systemType,
                },
              } as any,
              createdById: userId,
            },
          },
        },
        include: {
          items: true,
          costEstimate: true,
          versions: true,
          customer: true,
          site: true,
        },
      });

      return quotation;
    });
  }

  /**
   * 2. Approve Quotation
   */
  async approveQuotation(organizationId: string, id: string, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const quote = await tx.quotation.findFirst({
        where: { id, organizationId },
      });
      if (!quote) {
        throw new NotFoundException(`Quotation ${id} not found`);
      }

      return await tx.quotation.update({
        where: { id },
        data: {
          status: QuotationStatus.APPROVED,
          approvedById: userId,
          approvedAt: new Date(),
        },
        include: {
          items: true,
          costEstimate: true,
          customer: true,
        },
      });
    });
  }

  /**
   * 3. Record Customer Acceptance
   */
  async recordCustomerAcceptance(
    organizationId: string,
    id: string,
    dto: RecordQuotationAcceptanceDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const quote = await tx.quotation.findFirst({
        where: { id, organizationId },
      });
      if (!quote) {
        throw new NotFoundException(`Quotation ${id} not found`);
      }

      if (quote.status !== QuotationStatus.APPROVED && quote.status !== 'SENT') {
        throw new BadRequestException(
          `Cannot accept quotation in '${quote.status}' status. Quotation must be APPROVED first.`,
        );
      }

      return await tx.quotation.update({
        where: { id },
        data: {
          status: QuotationStatus.ACCEPTED,
          acceptanceDate: new Date(),
          acceptanceMethod: dto.acceptanceMethod,
          acceptanceEvidenceUrl: dto.acceptanceEvidenceUrl,
          acceptedById: userId,
        },
        include: {
          customer: true,
          items: true,
          costEstimate: true,
        },
      });
    });
  }

  /**
   * 4. Get Quotation by ID
   */
  async getQuotation(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const quote = await tx.quotation.findFirst({
        where: { id, organizationId },
        include: {
          customer: true,
          site: true,
          design: {
            include: {
              revisions: { take: 1, orderBy: { revisionNumber: 'desc' } },
            },
          },
          bom: { include: { items: true } },
          items: true,
          costEstimate: true,
          versions: true,
        },
      });

      if (!quote) {
        throw new NotFoundException(`Quotation ${id} not found`);
      }

      return quote;
    });
  }

  /**
   * 5. List Quotations for Tenant
   */
  async listQuotations(organizationId: string, query?: { customerId?: string; status?: string }) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (query?.customerId) where.customerId = query.customerId;
      if (query?.status) where.status = query.status;

      return await tx.quotation.findMany({
        where,
        include: {
          customer: true,
          site: true,
          costEstimate: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }
}
