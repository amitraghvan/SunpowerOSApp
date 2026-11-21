import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { CrmAnalyticsService } from './crm-analytics.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantContext } from '@solaros/types';
import { API_CONSTANTS } from '@solaros/config';

@ApiTags('CRM - Analytics')
@ApiBearerAuth()
@ApiHeader({ name: API_CONSTANTS.TENANT_ID_HEADER, required: false })
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
@Controller('crm/analytics')
export class CrmAnalyticsController {
  constructor(private readonly analyticsService: CrmAnalyticsService) {}

  @Get()
  @RequirePermissions('crm:analytics:read')
  @ApiOperation({ summary: 'Get CRM sales pipeline conversion analytics' })
  async getAnalytics(@CurrentTenant() tenant: TenantContext) {
    return this.analyticsService.getAnalytics(tenant);
  }
}
