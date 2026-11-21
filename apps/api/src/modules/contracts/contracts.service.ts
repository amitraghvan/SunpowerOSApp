import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import { GenerateContractDto, SignContractDto } from '@solaros/contracts';
import { ContractStatus, QuotationStatus, PaymentMilestoneType, MilestoneStatus } from '@solaros/types';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * 1. Generate Legal & Commercial Installation Contract from Accepted Quotation
   */
  async generateContract(organizationId: string, dto: GenerateContractDto, userId?: string) {
    const contractNumber = await this.numberingService.getNextDocumentNumber(
      organizationId,
      'CONTRACT',
      'CON',
    );

    return await this.prisma.forTenant(organizationId, async (tx) => {
      const quote = await tx.quotation.findFirst({
        where: { id: dto.quotationId, organizationId },
        include: {
          customer: true,
          design: true,
        },
      });

      if (!quote) {
        throw new NotFoundException(`Quotation ${dto.quotationId} not found`);
      }

      if (quote.status !== QuotationStatus.ACCEPTED && quote.status !== QuotationStatus.APPROVED) {
        throw new BadRequestException(
          `Cannot generate contract for quotation in '${quote.status}' status. Quotation must be APPROVED or ACCEPTED.`,
        );
      }

      const totalValue = quote.grandTotal.toNumber();

      const defaultMilestones = [
        {
          milestoneType: PaymentMilestoneType.ADVANCE_BOOKING,
          milestoneName: 'Project Advance & Engineering Mobilization',
          percentage: 20.0,
          amount: Number((totalValue * 0.20).toFixed(2)),
        },
        {
          milestoneType: PaymentMilestoneType.MATERIAL_READINESS,
          milestoneName: 'Hardware Procurement & Material Dispatch Readiness',
          percentage: 60.0,
          amount: Number((totalValue * 0.60).toFixed(2)),
        },
        {
          milestoneType: PaymentMilestoneType.INSTALLATION_COMPLETE,
          milestoneName: 'Mechanical Erection & Electrical Testing Completion',
          percentage: 15.0,
          amount: Number((totalValue * 0.15).toFixed(2)),
        },
        {
          milestoneType: PaymentMilestoneType.COMMISSIONING_NET_METERING,
          milestoneName: 'DISCOM Net Meter Synchronization & Final Handover',
          percentage: 5.0,
          amount: Number((totalValue * 0.05).toFixed(2)),
        },
      ];

      const milestonesToCreate = dto.milestones && dto.milestones.length > 0
        ? dto.milestones.map((m) => ({
            milestoneType: m.milestoneType,
            milestoneName: m.milestoneName,
            percentage: m.percentage,
            amount: Number(((totalValue * m.percentage) / 100.0).toFixed(2)),
          }))
        : defaultMilestones;

      const termsAndConditions =
        dto.termsAndConditions ??
        `1. SCOPE: Turnkey engineering, procurement, and construction of ${quote.design.targetCapacityKw.toString()} kWp rooftop solar plant.\n` +
        `2. PERFORMANCE: Modules guaranteed for 25 years with max 0.55% annual degradation.\n` +
        `3. NET METERING: The contractor shall coordinate all DISCOM paperwork; meter sanction charges are as per statutory rules.\n` +
        `4. PAYMENT: In accordance with agreed milestone schedule. Delays in milestone release will extend commissioning timeline.`;

      const contract = await tx.contract.create({
        data: {
          organizationId,
          contractNumber,
          customerId: quote.customerId,
          quotationId: quote.id,
          systemCapacityKw: quote.design.targetCapacityKw,
          contractAmount: quote.totalAmount,
          taxAmount: quote.taxAmount,
          totalContractValue: quote.grandTotal,
          paymentScheduleType: dto.paymentScheduleType ?? 'MILESTONE_BASED',
          status: ContractStatus.DRAFT,
          termsAndConditions,
          createdById: userId,
          milestones: {
            create: milestonesToCreate.map((m) => ({
              organizationId,
              milestoneType: m.milestoneType,
              milestoneName: m.milestoneName,
              percentage: m.percentage,
              amount: m.amount,
              status: MilestoneStatus.PENDING,
            })),
          },
        },
        include: {
          milestones: true,
          customer: true,
          quotation: true,
        },
      });

      return contract;
    });
  }

  /**
   * 2. Sign / Execute Contract
   */
  async signContract(
    organizationId: string,
    contractId: string,
    dto: SignContractDto,
    userId?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const contract = await tx.contract.findFirst({
        where: { id: contractId, organizationId },
      });

      if (!contract) {
        throw new NotFoundException(`Contract ${contractId} not found`);
      }

      return await tx.contract.update({
        where: { id: contractId },
        data: {
          status: ContractStatus.ACTIVE,
          signedByCustomerName: dto.signedByCustomerName,
          signedDate: dto.signedDate ? new Date(dto.signedDate) : new Date(),
          contractDocumentUrl: dto.contractDocumentUrl,
        },
        include: {
          milestones: true,
          customer: true,
        },
      });
    });
  }

  /**
   * 3. Get Contract by ID
   */
  async getContract(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const contract = await tx.contract.findFirst({
        where: { id, organizationId },
        include: {
          customer: true,
          quotation: {
            include: {
              design: true,
              bom: { include: { items: true } },
            },
          },
          milestones: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!contract) {
        throw new NotFoundException(`Contract ${id} not found`);
      }

      return contract;
    });
  }

  /**
   * 4. List Contracts for Tenant
   */
  async listContracts(organizationId: string, query?: { customerId?: string; status?: string }) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (query?.customerId) where.customerId = query.customerId;
      if (query?.status) where.status = query.status;

      return await tx.contract.findMany({
        where,
        include: {
          customer: true,
          milestones: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }
}
