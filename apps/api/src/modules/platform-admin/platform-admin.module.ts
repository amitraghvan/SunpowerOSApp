import { Module } from '@nestjs/common';
import { NumberingService } from '../../common/services/numbering.service';
import { PlatformAdminGuard } from './guards/platform-admin.guard';

// Services
import { PlatformAuditService } from './services/platform-audit.service';
import { PlatformAuthService } from './services/platform-auth.service';
import { PlatformOverviewService } from './services/platform-overview.service';
import { PlatformOrganizationsService } from './services/platform-organizations.service';
import { PlatformEnquiriesService } from './services/platform-enquiries.service';
import { PlatformSupportService } from './services/platform-support.service';
import { PlatformAnalyticsService } from './services/platform-analytics.service';
import { PlatformHealthService } from './services/platform-health.service';
import { PlatformAdminManagementService } from './services/platform-admin-management.service';

// Controllers
import { PlatformAuthController } from './controllers/platform-auth.controller';
import { PlatformAdminController } from './controllers/platform-admin.controller';
import { PublicEnquiriesController } from './controllers/public-enquiries.controller';
import { TenantSupportController } from './controllers/tenant-support.controller';

@Module({
  controllers: [
    PlatformAuthController,
    PlatformAdminController,
    PublicEnquiriesController,
    TenantSupportController,
  ],
  providers: [
    NumberingService,
    PlatformAdminGuard,
    PlatformAuditService,
    PlatformAuthService,
    PlatformOverviewService,
    PlatformOrganizationsService,
    PlatformEnquiriesService,
    PlatformSupportService,
    PlatformAnalyticsService,
    PlatformHealthService,
    PlatformAdminManagementService,
  ],
  exports: [
    PlatformAuditService,
    PlatformAuthService,
    PlatformOverviewService,
    PlatformOrganizationsService,
    PlatformEnquiriesService,
    PlatformSupportService,
    PlatformAnalyticsService,
    PlatformHealthService,
    PlatformAdminManagementService,
  ],
})
export class PlatformAdminModule {}
