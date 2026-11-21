import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { NumberingService } from '../../common/services/numbering.service';

import { InstallationController } from './installation.controller';
import { TechnicianPortalController } from './technician-portal.controller';

import { ProjectExecutionService } from './project-execution.service';
import { TechnicianCrewService } from './technician-crew.service';
import { InstallationSchedulingService } from './installation-scheduling.service';
import { SiteReadinessService } from './site-readiness.service';
import { WorkOrderService } from './work-order.service';
import { MaterialHandoverService } from './material-handover.service';
import { SafetyQualityService } from './safety-quality.service';
import { CommissioningService } from './commissioning.service';
import { DiscomTrackingService } from './discom-tracking.service';
import { CustomerHandoverService } from './customer-handover.service';
import { ProjectCostService } from './project-cost.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    InstallationController,
    TechnicianPortalController,
  ],
  providers: [
    NumberingService,
    ProjectExecutionService,
    TechnicianCrewService,
    InstallationSchedulingService,
    SiteReadinessService,
    WorkOrderService,
    MaterialHandoverService,
    SafetyQualityService,
    CommissioningService,
    DiscomTrackingService,
    CustomerHandoverService,
    ProjectCostService,
  ],
  exports: [
    ProjectExecutionService,
    TechnicianCrewService,
    InstallationSchedulingService,
    SiteReadinessService,
    WorkOrderService,
    MaterialHandoverService,
    SafetyQualityService,
    CommissioningService,
    DiscomTrackingService,
    CustomerHandoverService,
    ProjectCostService,
  ],
})
export class InstallationModule {}
