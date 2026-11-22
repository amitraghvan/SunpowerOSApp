import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class PlatformAnalyticsService {
  private readonly logger = new Logger(PlatformAnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics() {
    return this.prisma.asSuperAdmin(async (tx) => {
      const [
        totalOrgs,
        activeOrgs,
        trialOrgs,
        suspendedOrgs,
        planDistribution,
        topOrganizationsByProjects,
        topOrganizationsByUsers,
        enquiriesByCategory,
        ticketsByCategory,
      ] = await Promise.all([
        tx.organization.count(),
        tx.organization.count({ where: { status: 'ACTIVE', isActive: true } }),
        tx.organization.count({ where: { status: 'TRIAL' } }),
        tx.organization.count({ where: { status: 'SUSPENDED' } }),
        tx.organizationSubscription.groupBy({
          by: ['planId'],
          _count: { organizationId: true },
        }),
        tx.organization.findMany({
          take: 5,
          orderBy: {
            projectCosts: { _count: 'desc' },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            _count: {
              select: {
                salesOrders: true,
                customers: true,
                memberships: true,
              },
            },
          },
        }),
        tx.organization.findMany({
          take: 5,
          orderBy: {
            memberships: { _count: 'desc' },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: { select: { memberships: true } },
          },
        }),
        tx.platformEnquiry.groupBy({
          by: ['category'],
          _count: { id: true },
        }),
        tx.supportTicket.groupBy({
          by: ['category'],
          _count: { id: true },
        }),
      ]);

      // Fetch plan names for planDistribution
      const planIds = planDistribution.map((p) => p.planId);
      const plans = await tx.saaSPlan.findMany({
        where: { id: { in: planIds } },
      });
      const planMap = new Map(plans.map((p) => [p.id, p.name]));

      const formattedPlans = planDistribution.map((p) => ({
        planId: p.planId,
        planName: planMap.get(p.planId) || 'Standard Plan',
        count: p._count.organizationId,
      }));

      return {
        overview: {
          totalOrgs,
          activeOrgs,
          trialOrgs,
          suspendedOrgs,
        },
        planDistribution: formattedPlans,
        topOrganizationsByProjects,
        topOrganizationsByUsers,
        enquiriesByCategory: enquiriesByCategory.map((e) => ({
          category: e.category,
          count: e._count.id,
        })),
        ticketsByCategory: ticketsByCategory.map((t) => ({
          category: t.category,
          count: t._count.id,
        })),
      };
    });
  }
}
