import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CrmAnalyticsService } from './crm-analytics.service';
import { LeadsController } from './leads.controller';
import { CrmAnalyticsController } from './crm-analytics.controller';

@Module({
  controllers: [LeadsController, CrmAnalyticsController],
  providers: [LeadsService, CrmAnalyticsService],
  exports: [LeadsService, CrmAnalyticsService],
})
export class CrmModule {}
