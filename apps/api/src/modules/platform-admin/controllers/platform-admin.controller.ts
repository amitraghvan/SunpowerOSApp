import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlatformAdminGuard } from '../guards/platform-admin.guard';
import { CurrentPlatformAdmin, RequirePlatformRoles } from '../decorators/platform-admin.decorator';
import { PlatformOverviewService } from '../services/platform-overview.service';
import { PlatformOrganizationsService } from '../services/platform-organizations.service';
import { PlatformEnquiriesService } from '../services/platform-enquiries.service';
import { PlatformSupportService } from '../services/platform-support.service';
import { PlatformAnalyticsService } from '../services/platform-analytics.service';
import { PlatformHealthService } from '../services/platform-health.service';
import { PlatformAuditService } from '../services/platform-audit.service';
import { PlatformAdminManagementService } from '../services/platform-admin-management.service';
import {
  ListPlatformOrganizationsQuery,
  SuspendOrganizationRequest,
  ReactivateOrganizationRequest,
  UpdateOrganizationSubscriptionRequest,
  ListPlatformEnquiriesQuery,
  UpdatePlatformEnquiryStatusRequest,
  AssignPlatformEnquiryRequest,
  AddPlatformEnquiryNoteRequest,
  ListSupportTicketsQuery,
  ReplySupportTicketRequest,
  UpdateSupportTicketStatusRequest,
  AssignSupportTicketRequest,
  ResolveAlertRequest,
  CreatePlatformAdminRequest,
  UpdatePlatformAdminRequest,
  CreateSaaSPlanRequest,
} from '@solaros/contracts';
import { PlatformRole } from '@solaros/types';

@Controller('platform-admin')
@UseGuards(PlatformAdminGuard)
export class PlatformAdminController {
  constructor(
    private readonly overviewService: PlatformOverviewService,
    private readonly organizationsService: PlatformOrganizationsService,
    private readonly enquiriesService: PlatformEnquiriesService,
    private readonly supportService: PlatformSupportService,
    private readonly analyticsService: PlatformAnalyticsService,
    private readonly healthService: PlatformHealthService,
    private readonly auditService: PlatformAuditService,
    private readonly managementService: PlatformAdminManagementService,
  ) {}

  // ==========================================
  // 1. OVERVIEW & METRICS
  // ==========================================
  @Get('overview')
  async getOverview() {
    return await this.overviewService.getMetrics();
  }

  // ==========================================
  // 2. ORGANIZATIONS MANAGEMENT
  // ==========================================
  @Get('organizations')
  async listOrganizations(@Query() query: ListPlatformOrganizationsQuery) {
    return await this.organizationsService.listOrganizations(query);
  }

  @Get('organizations/:id')
  async getOrganizationDetail(@Param('id') orgId: string) {
    return await this.organizationsService.getOrganizationDetail(orgId);
  }

  @Post('organizations/:id/suspend')
  @RequirePlatformRoles(PlatformRole.PLATFORM_OWNER, PlatformRole.PLATFORM_ADMIN)
  async suspendOrganization(
    @Param('id') orgId: string,
    @Body() dto: SuspendOrganizationRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.organizationsService.suspendOrganization(
      orgId,
      dto,
      admin.id,
      admin.user.email,
    );
  }

  @Post('organizations/:id/reactivate')
  @RequirePlatformRoles(PlatformRole.PLATFORM_OWNER, PlatformRole.PLATFORM_ADMIN)
  async reactivateOrganization(
    @Param('id') orgId: string,
    @Body() dto: ReactivateOrganizationRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.organizationsService.reactivateOrganization(
      orgId,
      admin.id,
      admin.user.email,
      dto.notes,
    );
  }

  @Put('organizations/:id/subscription')
  @RequirePlatformRoles(PlatformRole.PLATFORM_OWNER, PlatformRole.PLATFORM_ADMIN)
  async updateOrganizationSubscription(
    @Param('id') orgId: string,
    @Body() dto: UpdateOrganizationSubscriptionRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.organizationsService.updateOrganizationSubscription(
      orgId,
      dto,
      admin.id,
      admin.user.email,
    );
  }

  // ==========================================
  // 3. ENQUIRIES INBOX
  // ==========================================
  @Get('enquiries')
  async listEnquiries(@Query() query: ListPlatformEnquiriesQuery) {
    return await this.enquiriesService.listEnquiries(query);
  }

  @Get('enquiries/:id')
  async getEnquiryDetail(@Param('id') id: string) {
    return await this.enquiriesService.getEnquiryDetail(id);
  }

  @Patch('enquiries/:id/status')
  async updateEnquiryStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePlatformEnquiryStatusRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.enquiriesService.updateStatus(
      id,
      dto,
      admin.id,
      admin.user.email,
    );
  }

  @Patch('enquiries/:id/assign')
  async assignEnquiry(
    @Param('id') id: string,
    @Body() dto: AssignPlatformEnquiryRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.enquiriesService.assignEnquiry(
      id,
      dto,
      admin.id,
      admin.user.email,
    );
  }

  @Post('enquiries/:id/notes')
  async addEnquiryNote(
    @Param('id') id: string,
    @Body() dto: AddPlatformEnquiryNoteRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.enquiriesService.addNote(
      id,
      dto,
      admin.id,
      admin.user.email,
    );
  }

  // ==========================================
  // 4. SUPPORT CENTER
  // ==========================================
  @Get('support/tickets')
  async listSupportTickets(@Query() query: ListSupportTicketsQuery) {
    return await this.supportService.listTickets(query, true);
  }

  @Get('support/tickets/:id')
  async getSupportTicketDetail(@Param('id') ticketId: string) {
    return await this.supportService.getTicketDetail(ticketId, true);
  }

  @Post('support/tickets/:id/reply')
  @HttpCode(HttpStatus.CREATED)
  async replySupportTicket(
    @Param('id') ticketId: string,
    @Body() dto: ReplySupportTicketRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.supportService.replyTicket(
      ticketId,
      admin.userId,
      'PLATFORM_ADMIN',
      dto,
    );
  }

  @Patch('support/tickets/:id/status')
  async updateSupportTicketStatus(
    @Param('id') ticketId: string,
    @Body() dto: UpdateSupportTicketStatusRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.supportService.updateTicketStatus(
      ticketId,
      dto,
      admin.id,
      admin.user.email,
    );
  }

  @Patch('support/tickets/:id/assign')
  async assignSupportTicket(
    @Param('id') ticketId: string,
    @Body() dto: AssignSupportTicketRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.supportService.assignTicket(
      ticketId,
      dto,
      admin.id,
      admin.user.email,
    );
  }

  // ==========================================
  // 5. PLATFORM ANALYTICS
  // ==========================================
  @Get('analytics')
  async getAnalytics() {
    return await this.analyticsService.getAnalytics();
  }

  // ==========================================
  // 6. HEALTH & INFRASTRUCTURE MONITORING
  // ==========================================
  @Get('health')
  async getSystemHealth() {
    return await this.healthService.getSystemHealth();
  }

  @Get('alerts')
  async listAlerts(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
  ) {
    return await this.healthService.listAlerts(status, severity);
  }

  @Post('alerts/:id/acknowledge')
  async acknowledgeAlert(
    @Param('id') alertId: string,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.healthService.acknowledgeAlert(alertId, admin.id);
  }

  @Post('alerts/:id/resolve')
  async resolveAlert(
    @Param('id') alertId: string,
    @Body() dto: ResolveAlertRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.healthService.resolveAlert(
      alertId,
      dto,
      admin.id,
      admin.user.email,
    );
  }

  // ==========================================
  // 7. PLATFORM AUDIT LOGS
  // ==========================================
  @Get('audit-logs')
  async listAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('action') action?: string,
    @Query('targetType') targetType?: string,
  ) {
    return await this.auditService.listEvents({ page, limit, action, targetType });
  }

  // ==========================================
  // 8. ADMINISTRATORS MANAGEMENT
  // ==========================================
  @Get('administrators')
  @RequirePlatformRoles(PlatformRole.PLATFORM_OWNER, PlatformRole.PLATFORM_ADMIN)
  async listAdministrators() {
    return await this.managementService.listAdministrators();
  }

  @Post('administrators')
  @RequirePlatformRoles(PlatformRole.PLATFORM_OWNER)
  async createAdministrator(
    @Body() dto: CreatePlatformAdminRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.managementService.createAdministrator(
      dto,
      admin.id,
      admin.user.email,
    );
  }

  @Patch('administrators/:id')
  @RequirePlatformRoles(PlatformRole.PLATFORM_OWNER)
  async updateAdministrator(
    @Param('id') adminId: string,
    @Body() dto: UpdatePlatformAdminRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.managementService.updateAdministrator(
      adminId,
      dto,
      admin.id,
      admin.user.email,
    );
  }

  // ==========================================
  // 9. SAAS PLANS MANAGEMENT
  // ==========================================
  @Get('plans')
  async listSaaSPlans() {
    return await this.managementService.listSaaSPlans();
  }

  @Post('plans')
  @RequirePlatformRoles(PlatformRole.PLATFORM_OWNER, PlatformRole.PLATFORM_ADMIN)
  async createSaaSPlan(
    @Body() dto: CreateSaaSPlanRequest,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.managementService.createSaaSPlan(
      dto,
      admin.id,
      admin.user.email,
    );
  }

  @Patch('plans/:id')
  @RequirePlatformRoles(PlatformRole.PLATFORM_OWNER, PlatformRole.PLATFORM_ADMIN)
  async updateSaaSPlan(
    @Param('id') planId: string,
    @Body() dto: Partial<CreateSaaSPlanRequest>,
    @CurrentPlatformAdmin() admin: any,
  ) {
    return await this.managementService.updateSaaSPlan(
      planId,
      dto,
      admin.id,
      admin.user.email,
    );
  }
}
