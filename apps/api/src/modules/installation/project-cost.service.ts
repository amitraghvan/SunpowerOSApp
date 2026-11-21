import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import { CreateProjectCostDto } from '@solaros/contracts';

@Injectable()
export class ProjectCostService {
  private readonly logger = new Logger(ProjectCostService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  /**
   * Records execution cost (labor, logistics, rental, permits, consumables)
   */
  async createProjectCost(organizationId: string, dto: CreateProjectCostDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const project = await tx.projectInitiation.findFirst({
        where: { id: dto.projectInitiationId, organizationId },
      });
      if (!project) {
        throw new NotFoundException(`Project ${dto.projectInitiationId} not found`);
      }

      const costRecordNumber = await this.numberingService.getNextDocumentNumber(
        organizationId,
        'PROJECT_COST',
        'CST',
      );

      const record = await tx.projectCostRecord.create({
        data: {
          organizationId,
          costRecordNumber,
          projectInitiationId: dto.projectInitiationId,
          workOrderId: dto.workOrderId || null,
          costCategory: dto.costCategory || 'LABOR',
          amount: dto.amount,
          currency: dto.currency || 'INR',
          incurredDate: dto.incurredDate ? new Date(dto.incurredDate) : new Date(),
          vendorName: dto.vendorName,
          invoiceNumber: dto.invoiceNumber,
          approvedById: userId || null,
          notes: dto.notes,
        },
      });

      this.logger.log(`Recorded execution cost ${costRecordNumber} (₹${dto.amount}) for project ${project.projectCode}`);
      return record;
    });
  }

  /**
   * Lists project execution costs
   */
  async listProjectCosts(organizationId: string, projectId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      return await tx.projectCostRecord.findMany({
        where: { projectInitiationId: projectId, organizationId },
        orderBy: { incurredDate: 'desc' },
      });
    });
  }

  /**
   * Summarizes project cost by category
   */
  async getProjectCostSummary(organizationId: string, projectId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const costs = await tx.projectCostRecord.findMany({
        where: { projectInitiationId: projectId, organizationId },
      });

      const totalAmount = costs.reduce((sum, c) => sum + Number(c.amount), 0);
      const byCategory: Record<string, number> = {};

      for (const c of costs) {
        byCategory[c.costCategory] = (byCategory[c.costCategory] || 0) + Number(c.amount);
      }

      return {
        totalAmount,
        byCategory,
        costsCount: costs.length,
      };
    });
  }
}
