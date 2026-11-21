import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateCustomerHandoverDto,
  AddPunchlistItemDto,
  ResolvePunchlistItemDto,
  SignOffCustomerHandoverDto,
} from '@solaros/contracts';

@Injectable()
export class CustomerHandoverService {
  private readonly logger = new Logger(CustomerHandoverService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * Initializes a customer handover process
   */
  async createCustomerHandover(organizationId: string, dto: CreateCustomerHandoverDto, conductedById: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      const handoverNumber = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'CUSTOMER_HANDOVER',
        'CHO',
      );

      const handover = await tx.customerHandover.create({
        data: {
          organizationId,
          handoverNumber,
          projectInitiationId: dto.projectInitiationId,
          conductedById,
          customerRepName: dto.customerRepName,
          customerRepPhone: dto.customerRepPhone,
          customerRepDesignation: dto.customerRepDesignation,
          status: 'DRAFT',
          punchlistItemsCount: 0,
          resolvedPunchlistCount: 0,
          customerFeedbackNotes: dto.customerFeedbackNotes,
          finalInstalledCapacityKw: dto.finalInstalledCapacityKw || project.systemCapacityKw,
        },
      });

      // Update project installation status to CUSTOMER_HANDOVER_PENDING
      await tx.projectInitiation.update({
        where: { id: dto.projectInitiationId },
        data: {
          installationStatus: 'CUSTOMER_HANDOVER_PENDING',
        },
      });

      this.logger.log(`Created Customer Handover ${handoverNumber} for project ${project.projectCode}`);
      return handover;
    });
  }

  /**
   * Retrieves customer handover with punchlist and documents
   */
  async getCustomerHandover(organizationId: string, projectId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      return await tx.customerHandover.findFirst({
        where: { projectInitiationId: projectId, organizationId },
        include: {
          conductedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          punchlistItems: { orderBy: { itemNumber: 'asc' } },
          documents: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  }

  /**
   * Adds an open punchlist item
   */
  async addPunchlistItem(organizationId: string, handoverId: string, dto: AddPunchlistItemDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const handover = await tx.customerHandover.findFirst({
        where: { id: handoverId, organizationId },
      });
      if (!handover) {
        throw new NotFoundException(`Customer handover ${handoverId} not found`);
      }

      const count = await tx.handoverPunchlistItem.count({
        where: { handoverId, organizationId },
      });

      const item = await tx.handoverPunchlistItem.create({
        data: {
          organizationId,
          handoverId,
          itemNumber: dto.itemNumber || count + 1,
          category: dto.category || 'CIVIL',
          description: dto.description,
          severity: dto.severity || 'MINOR',
          targetResolutionDate: dto.targetResolutionDate ? new Date(dto.targetResolutionDate) : null,
          isResolved: false,
        },
      });

      await tx.customerHandover.update({
        where: { id: handoverId },
        data: {
          punchlistItemsCount: count + 1,
          status: 'PUNCHLIST_PENDING',
        },
      });

      return item;
    });
  }

  /**
   * Resolves a punchlist item
   */
  async resolvePunchlistItem(
    organizationId: string,
    punchlistId: string,
    dto: ResolvePunchlistItemDto,
    resolvedById?: string,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const item = await tx.handoverPunchlistItem.findFirst({
        where: { id: punchlistId, organizationId },
      });
      if (!item) {
        throw new NotFoundException(`Punchlist item ${punchlistId} not found`);
      }

      const updated = await tx.handoverPunchlistItem.update({
        where: { id: punchlistId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
          resolvedById: resolvedById || null,
          resolutionNotes: dto.resolutionNotes,
        },
      });

      // Recalculate resolved count
      const allItems = await tx.handoverPunchlistItem.findMany({
        where: { handoverId: item.handoverId, organizationId },
      });
      const resolvedCount = allItems.filter((i) => i.isResolved).length;

      await tx.customerHandover.update({
        where: { id: item.handoverId },
        data: {
          resolvedPunchlistCount: resolvedCount,
        },
      });

      return updated;
    });
  }

  /**
   * Final customer sign-off & dossier generation
   */
  async signOffHandover(
    organizationId: string,
    handoverId: string,
    dto: SignOffCustomerHandoverDto,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const handover = await tx.customerHandover.findFirst({
        where: { id: handoverId, organizationId },
        include: { punchlistItems: true },
      });
      if (!handover) {
        throw new NotFoundException(`Customer handover ${handoverId} not found`);
      }

      // Check that any MAJOR punchlist items are resolved
      const unresolvedMajor = handover.punchlistItems.filter((i) => !i.isResolved && i.severity === 'MAJOR');
      if (unresolvedMajor.length > 0) {
        throw new BadRequestException(
          `Cannot sign off handover: ${unresolvedMajor.length} MAJOR punchlist item(s) are still unresolved.`,
        );
      }

      const warrantyMonths = dto.warrantyPeriodMonths || 60; // 5 years standard solar warranty
      const warrantyStartDate = new Date();
      const warrantyEndDate = new Date();
      warrantyEndDate.setMonth(warrantyEndDate.getMonth() + warrantyMonths);

      const updated = await tx.customerHandover.update({
        where: { id: handoverId },
        data: {
          status: 'COMPLETED',
          customerSatisfactionScore: dto.customerSatisfactionScore ?? 5,
          customerSignatureUrl: dto.customerSignatureUrl,
          companyRepresentativeSignatureUrl: dto.companyRepresentativeSignatureUrl,
          handoverPackGenerated: true,
          warrantyCertificateGenerated: true,
          warrantyStartDate,
          warrantyEndDate,
        },
        include: { punchlistItems: true, documents: true },
      });

      // Mark project execution COMPLETED
      await tx.projectInitiation.update({
        where: { id: handover.projectInitiationId },
        data: {
          installationStatus: 'COMPLETED',
          actualCompletionDate: new Date(),
        },
      });

      this.logger.log(`Customer handover ${handover.handoverNumber} signed off. Project marked COMPLETED.`);
      return updated;
    });
  }
}
