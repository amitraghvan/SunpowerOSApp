import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenantContext, ICrmAnalytics, LeadStatus } from '@solaros/types';

@Injectable()
export class CrmAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAnalytics(tenant: TenantContext): Promise<ICrmAnalytics> {
    const orgId = tenant.organizationId;

    return this.prisma.forTenant(orgId, async (tx) => {
      const leads = await tx.lead.findMany({
        where: {
          organizationId: orgId,
          deletedAt: null,
        },
        select: {
          status: true,
          source: true,
          estimatedCapacityKw: true,
        },
      });

      const totalLeads = leads.length;
      let newLeads = 0;
      let qualifiedLeads = 0;
      let wonLeads = 0;
      let lostLeads = 0;
      let totalCapacity = 0;
      let capacityCount = 0;

      const leadsByStatus: Record<string, number> = {};
      const leadsBySource: Record<string, number> = {};

      for (const lead of leads) {
        // By status
        leadsByStatus[lead.status] = (leadsByStatus[lead.status] || 0) + 1;
        if (lead.status === LeadStatus.NEW) newLeads++;
        if (lead.status === LeadStatus.QUALIFIED) qualifiedLeads++;
        if (lead.status === LeadStatus.WON) wonLeads++;
        if (lead.status === LeadStatus.LOST) lostLeads++;

        // By source
        leadsBySource[lead.source] = (leadsBySource[lead.source] || 0) + 1;

        // Capacity
        if (lead.estimatedCapacityKw) {
          totalCapacity += Number(lead.estimatedCapacityKw);
          capacityCount++;
        }
      }

      const conversionRatePercent = totalLeads > 0 ? Number(((wonLeads / totalLeads) * 100).toFixed(1)) : 0;
      const averageDealSizeKw = capacityCount > 0 ? Number((totalCapacity / capacityCount).toFixed(2)) : 0;

      return {
        totalLeads,
        newLeads,
        qualifiedLeads,
        wonLeads,
        lostLeads,
        conversionRatePercent,
        averageDealSizeKw,
        leadsByStatus,
        leadsBySource,
      };
    });
  }
}
