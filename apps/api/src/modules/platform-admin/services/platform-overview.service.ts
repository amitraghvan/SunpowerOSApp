import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class PlatformOverviewService {
  private readonly logger = new Logger(PlatformOverviewService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const [
      totalOrganizations,
      activeOrganizations,
      trialOrganizations,
      suspendedOrganizations,
      totalUsers,
      totalProjects,
      newEnquiriesCount,
      openTicketsCount,
      activeAlertsCount,
      supplierDocs,
      handoverDocs,
      recentRegistrations,
      recentAuditEvents,
    ] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.organization.count({ where: { status: 'ACTIVE', isActive: true } }),
      this.prisma.organization.count({ where: { status: 'TRIAL' } }),
      this.prisma.organization.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.user.count(),
      this.prisma.projectInitiation.count(),
      this.prisma.platformEnquiry.count({ where: { status: 'NEW' } }),
      this.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.prisma.platformAlert.count({ where: { status: 'OPEN' } }),
      this.prisma.supplierDocument.aggregate({ _sum: { fileSizeBytes: true } }),
      this.prisma.handoverDocument.aggregate({ _sum: { fileSize: true } }),
      this.prisma.organization.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true,
          _count: {
            select: { memberships: true, branches: true },
          },
        },
      }),
      this.prisma.platformAuditEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    const totalStorageBytes =
      Number(supplierDocs._sum?.fileSizeBytes || 0) + Number(handoverDocs._sum?.fileSize || 0);

    // Calculate monthly registration trajectory for past 6 months
    const now = new Date();
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthLabel = startOfMonth.toLocaleString('en-US', { month: 'short' });

      // We can query registrations in that month
      const count = await this.prisma.organization.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      });

      monthlyGrowth.push({
        month: monthLabel,
        count,
      });
    }

    return {
      totalOrganizations,
      activeOrganizations,
      trialOrganizations,
      suspendedOrganizations,
      totalUsers,
      totalProjects,
      totalStorageBytes,
      totalStorageMb: Math.round(totalStorageBytes / (1024 * 1024)),
      newEnquiriesCount,
      openTicketsCount,
      activeAlertsCount,
      monthlyGrowth,
      recentRegistrations,
      recentAuditEvents,
    };
  }
}
