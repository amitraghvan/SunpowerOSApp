import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantContext } from '@solaros/types';
import { API_CONSTANTS } from '@solaros/config';
import {
  CreateLeadDto,
  UpdateLeadDto,
  ChangeLeadStatusDto,
  CreateLeadActivityDto,
  ConvertLeadDto,
  LeadFilterQueryDto,
} from '@solaros/contracts';

@ApiTags('CRM - Leads')
@ApiBearerAuth()
@ApiHeader({ name: API_CONSTANTS.TENANT_ID_HEADER, required: false })
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
@Controller('crm/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @RequirePermissions('crm:leads:create')
  @ApiOperation({ summary: 'Create new solar prospect lead' })
  async createLead(@CurrentTenant() tenant: TenantContext, @Body() dto: CreateLeadDto) {
    return this.leadsService.createLead(tenant, dto);
  }

  @Get()
  @RequirePermissions('crm:leads:read')
  @ApiOperation({ summary: 'List and filter solar leads' })
  async getLeads(@CurrentTenant() tenant: TenantContext, @Query() filter: LeadFilterQueryDto) {
    return this.leadsService.getLeads(tenant, filter);
  }

  @Get('duplicates')
  @RequirePermissions('crm:leads:read')
  @ApiOperation({ summary: 'Check duplicate lead by phone or email' })
  async checkDuplicate(
    @CurrentTenant() tenant: TenantContext,
    @Query('phone') phone: string,
    @Query('email') email?: string
  ) {
    return this.leadsService.checkDuplicate(tenant, phone, email);
  }

  @Get(':id')
  @RequirePermissions('crm:leads:read')
  @ApiOperation({ summary: 'Get lead details by ID' })
  async getLeadById(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.leadsService.getLeadById(tenant, id);
  }

  @Patch(':id')
  @RequirePermissions('crm:leads:update')
  @ApiOperation({ summary: 'Update lead details' })
  async updateLead(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto
  ) {
    return this.leadsService.updateLead(tenant, id, dto);
  }

  @Post(':id/status')
  @RequirePermissions('crm:leads:update')
  @ApiOperation({ summary: 'Change lead status with transition validation' })
  async changeLeadStatus(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: ChangeLeadStatusDto
  ) {
    return this.leadsService.changeLeadStatus(tenant, id, dto);
  }

  @Post(':id/activities')
  @RequirePermissions('crm:leads:update')
  @ApiOperation({ summary: 'Log activity on lead' })
  async addActivity(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: CreateLeadActivityDto
  ) {
    return this.leadsService.addActivity(tenant, id, dto);
  }

  @Post(':id/convert')
  @RequirePermissions('crm:leads:update', 'customer:customers:create')
  @ApiOperation({ summary: 'Convert lead to customer account' })
  async convertLead(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: ConvertLeadDto
  ) {
    return this.leadsService.convertLead(tenant, id, dto);
  }
}
