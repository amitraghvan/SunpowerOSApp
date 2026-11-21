import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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

import {
  CreateTechnicianProfileDto,
  UpdateTechnicianProfileDto,
  AddTechnicianSkillDto,
  AddTechnicianCertificationDto,
  CreateInstallationCrewDto,
  UpdateInstallationCrewDto,
  AddCrewMemberDto,
  AssignProjectTechnicianDto,
  CreateInstallationScheduleDto,
  RescheduleVisitDto,
  CreateSiteReadinessRecordDto,
  RecordReadinessCheckDto,
  AuthorizeReadinessExceptionDto,
  CreateWorkOrderDto,
  UpdateTaskStatusDto,
  AssignTechnicianToWorkOrderDto,
  UpdateMilestoneStatusDto,
  CreateMaterialHandoverDto,
  VerifyMaterialHandoverLineDto,
  AcceptMaterialHandoverDto,
  RecordMaterialConsumptionDto,
  CreateSafetyRecordDto,
  AddSafetyObservationDto,
  IssueStopWorkDto,
  LiftStopWorkDto,
  ReportSafetyIncidentDto,
  CreateQualityInspectionDto,
  RecordReworkResolutionDto,
  CreateCommissioningRecordDto,
  RecordCommissioningTestDto,
  ApproveCommissioningDto,
  RejectCommissioningDto,
  CreateUtilityTrackingDto,
  UpdateUtilityTrackingDto,
  CreateCustomerHandoverDto,
  AddPunchlistItemDto,
  ResolvePunchlistItemDto,
  SignOffCustomerHandoverDto,
  CreateProjectCostDto,
} from '@solaros/contracts';

@Controller('installation')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class InstallationController {
  constructor(
    private readonly projectExecutionService: ProjectExecutionService,
    private readonly technicianCrewService: TechnicianCrewService,
    private readonly schedulingService: InstallationSchedulingService,
    private readonly siteReadinessService: SiteReadinessService,
    private readonly workOrderService: WorkOrderService,
    private readonly materialHandoverService: MaterialHandoverService,
    private readonly safetyQualityService: SafetyQualityService,
    private readonly commissioningService: CommissioningService,
    private readonly discomTrackingService: DiscomTrackingService,
    private readonly customerHandoverService: CustomerHandoverService,
    private readonly projectCostService: ProjectCostService,
  ) {}

  // ---------------------------------------------------------------------------
  // 1. Cockpit & Projects
  // ---------------------------------------------------------------------------
  @Get('cockpit')
  @RequirePermissions('installation:projects:read')
  async getCockpit(@CurrentTenant() organizationId: string) {
    return await this.projectExecutionService.getCockpitKpis(organizationId);
  }

  @Get('projects')
  @RequirePermissions('installation:projects:read')
  async listProjects(
    @CurrentTenant() organizationId: string,
    @Query('status') status?: string,
    @Query('crewId') crewId?: string,
    @Query('projectManagerId') projectManagerId?: string,
    @Query('search') search?: string,
  ) {
    return await this.projectExecutionService.listProjects(organizationId, {
      status,
      crewId,
      projectManagerId,
      search,
    });
  }

  @Get('projects/:id')
  @RequirePermissions('installation:projects:read')
  async getProjectDetails(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.projectExecutionService.getProjectDetails(organizationId, id);
  }

  @Patch('projects/:id/status')
  @RequirePermissions('installation:projects:manage')
  async updateProjectStatus(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('notes') notes?: string,
  ) {
    return await this.projectExecutionService.updateProjectStatus(organizationId, id, status, notes, userId);
  }

  @Patch('projects/:id/planning')
  @RequirePermissions('installation:projects:manage')
  async updateProjectPlanning(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return await this.projectExecutionService.updateProjectPlanning(organizationId, id, dto, userId);
  }

  // ---------------------------------------------------------------------------
  // 2. Technicians & Crews
  // ---------------------------------------------------------------------------
  @Post('technicians')
  @RequirePermissions('installation:technicians:manage')
  async createTechnicianProfile(
    @CurrentTenant() organizationId: string,
    @Body() dto: CreateTechnicianProfileDto,
  ) {
    return await this.technicianCrewService.createTechnicianProfile(organizationId, dto);
  }

  @Get('technicians')
  @RequirePermissions('installation:technicians:read')
  async listTechnicians(
    @CurrentTenant() organizationId: string,
    @Query('type') type?: string,
    @Query('availability') availability?: string,
    @Query('search') search?: string,
  ) {
    return await this.technicianCrewService.listTechnicians(organizationId, { type, availability, search });
  }

  @Get('technicians/:id')
  @RequirePermissions('installation:technicians:read')
  async getTechnician(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.technicianCrewService.getTechnician(organizationId, id);
  }

  @Patch('technicians/:id')
  @RequirePermissions('installation:technicians:manage')
  async updateTechnician(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTechnicianProfileDto,
  ) {
    return await this.technicianCrewService.updateTechnician(organizationId, id, dto);
  }

  @Post('technicians/:id/skills')
  @RequirePermissions('installation:technicians:manage')
  async addSkill(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddTechnicianSkillDto,
  ) {
    return await this.technicianCrewService.addSkill(organizationId, id, dto, userId);
  }

  @Post('technicians/:id/certifications')
  @RequirePermissions('installation:technicians:manage')
  async addCertification(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddTechnicianCertificationDto,
  ) {
    return await this.technicianCrewService.addCertification(organizationId, id, dto, userId);
  }

  @Post('crews')
  @RequirePermissions('installation:crews:manage')
  async createCrew(@CurrentTenant() organizationId: string, @Body() dto: CreateInstallationCrewDto) {
    return await this.technicianCrewService.createCrew(organizationId, dto);
  }

  @Get('crews')
  @RequirePermissions('installation:crews:read')
  async listCrews(
    @CurrentTenant() organizationId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return await this.technicianCrewService.listCrews(organizationId, { status, search });
  }

  @Get('crews/:id')
  @RequirePermissions('installation:crews:read')
  async getCrew(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.technicianCrewService.getCrew(organizationId, id);
  }

  @Patch('crews/:id')
  @RequirePermissions('installation:crews:manage')
  async updateCrew(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInstallationCrewDto,
  ) {
    return await this.technicianCrewService.updateCrew(organizationId, id, dto);
  }

  @Post('crews/:id/members')
  @RequirePermissions('installation:crews:manage')
  async addCrewMember(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: AddCrewMemberDto,
  ) {
    return await this.technicianCrewService.addCrewMember(organizationId, id, dto);
  }

  @Delete('crews/:id/members/:techId')
  @RequirePermissions('installation:crews:manage')
  async removeCrewMember(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Param('techId') techId: string,
  ) {
    return await this.technicianCrewService.removeCrewMember(organizationId, id, techId);
  }

  @Post('projects/:id/assign-crew')
  @RequirePermissions('installation:crews:manage')
  async assignCrewToProject(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('crewId') crewId: string,
  ) {
    return await this.technicianCrewService.assignCrewToProject(organizationId, id, crewId, userId);
  }

  @Post('projects/:id/assign-technician')
  @RequirePermissions('installation:technicians:manage')
  async assignTechnicianToProject(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: AssignProjectTechnicianDto,
  ) {
    return await this.technicianCrewService.assignTechnicianToProject(organizationId, id, dto);
  }

  // ---------------------------------------------------------------------------
  // 3. Scheduling
  // ---------------------------------------------------------------------------
  @Post('schedules')
  @RequirePermissions('installation:schedules:manage')
  async createSchedule(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInstallationScheduleDto,
  ) {
    return await this.schedulingService.createSchedule(organizationId, dto, userId);
  }

  @Get('schedules')
  @RequirePermissions('installation:schedules:read')
  async listSchedules(
    @CurrentTenant() organizationId: string,
    @Query('projectId') projectId?: string,
    @Query('crewId') crewId?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.schedulingService.listSchedules(organizationId, {
      projectId,
      crewId,
      status,
      startDate,
      endDate,
    });
  }

  @Patch('schedules/:id/reschedule')
  @RequirePermissions('installation:schedules:manage')
  async rescheduleVisit(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RescheduleVisitDto,
  ) {
    return await this.schedulingService.rescheduleVisit(organizationId, id, dto, userId);
  }

  // ---------------------------------------------------------------------------
  // 4. Site Readiness
  // ---------------------------------------------------------------------------
  @Post('readiness')
  @RequirePermissions('installation:readiness:manage')
  async createReadinessRecord(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSiteReadinessRecordDto,
  ) {
    return await this.siteReadinessService.createReadinessRecord(organizationId, dto, userId);
  }

  @Get('readiness/:projectId')
  @RequirePermissions('installation:readiness:read')
  async getReadinessRecord(
    @CurrentTenant() organizationId: string,
    @Param('projectId') projectId: string,
  ) {
    return await this.siteReadinessService.getReadinessRecord(organizationId, projectId);
  }

  @Post('readiness/:id/checks')
  @RequirePermissions('installation:readiness:manage')
  async recordCheck(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: RecordReadinessCheckDto,
  ) {
    return await this.siteReadinessService.recordCheck(organizationId, id, dto);
  }

  @Post('readiness/:id/authorize-exception')
  @RequirePermissions('installation:readiness:manage')
  async authorizeException(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AuthorizeReadinessExceptionDto,
  ) {
    return await this.siteReadinessService.authorizeException(organizationId, id, dto, userId);
  }

  @Post('readiness/:id/approve')
  @RequirePermissions('installation:readiness:manage')
  async approveReadiness(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.siteReadinessService.approveReadiness(organizationId, id, userId);
  }

  // ---------------------------------------------------------------------------
  // 5. Work Orders & Tasks
  // ---------------------------------------------------------------------------
  @Post('work-orders')
  @RequirePermissions('installation:work_orders:manage')
  async createWorkOrder(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkOrderDto,
  ) {
    return await this.workOrderService.createWorkOrder(organizationId, dto, userId);
  }

  @Get('work-orders')
  @RequirePermissions('installation:work_orders:read')
  async listWorkOrders(
    @CurrentTenant() organizationId: string,
    @Query('projectId') projectId?: string,
    @Query('crewId') crewId?: string,
    @Query('status') status?: string,
  ) {
    return await this.workOrderService.listWorkOrders(organizationId, { projectId, crewId, status });
  }

  @Get('work-orders/:id')
  @RequirePermissions('installation:work_orders:read')
  async getWorkOrder(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.workOrderService.getWorkOrder(organizationId, id);
  }

  @Patch('tasks/:id/status')
  @RequirePermissions('installation:work_orders:manage')
  async updateTaskStatus(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return await this.workOrderService.updateTaskStatus(organizationId, id, dto, userId);
  }

  @Post('work-orders/:id/assign-technician')
  @RequirePermissions('installation:work_orders:manage')
  async assignTechnicianToWorkOrder(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: AssignTechnicianToWorkOrderDto,
  ) {
    return await this.workOrderService.assignTechnician(organizationId, id, dto);
  }

  @Patch('milestones/:id')
  @RequirePermissions('installation:work_orders:manage')
  async updateMilestone(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMilestoneStatusDto,
  ) {
    return await this.workOrderService.updateMilestone(organizationId, id, dto, userId);
  }

  // ---------------------------------------------------------------------------
  // 6. Material Handover & Custody
  // ---------------------------------------------------------------------------
  @Post('material-handover')
  @RequirePermissions('installation:material_handover:manage')
  async createMaterialHandover(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMaterialHandoverDto,
  ) {
    return await this.materialHandoverService.createMaterialHandover(organizationId, dto, userId);
  }

  @Patch('material-handover/:id/verify-line')
  @RequirePermissions('installation:material_handover:manage')
  async verifyHandoverLine(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: VerifyMaterialHandoverLineDto,
  ) {
    return await this.materialHandoverService.verifyHandoverLine(organizationId, id, dto);
  }

  @Post('material-handover/:id/accept')
  @RequirePermissions('installation:material_handover:manage')
  async acceptHandover(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AcceptMaterialHandoverDto,
  ) {
    return await this.materialHandoverService.acceptHandover(organizationId, id, dto, userId);
  }

  @Post('material-consumption')
  @RequirePermissions('installation:material_handover:manage')
  async recordConsumption(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RecordMaterialConsumptionDto,
  ) {
    return await this.materialHandoverService.recordConsumption(organizationId, dto, userId);
  }

  // ---------------------------------------------------------------------------
  // 7. Safety Management & Quality Inspections
  // ---------------------------------------------------------------------------
  @Post('safety')
  @RequirePermissions('installation:safety:manage')
  async createSafetyRecord(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSafetyRecordDto,
  ) {
    return await this.safetyQualityService.createSafetyRecord(organizationId, dto, userId);
  }

  @Post('safety/:id/observations')
  @RequirePermissions('installation:safety:manage')
  async addSafetyObservation(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddSafetyObservationDto,
  ) {
    return await this.safetyQualityService.addObservation(organizationId, id, dto, userId);
  }

  @Post('safety/:id/stop-work')
  @RequirePermissions('installation:safety:manage')
  async issueStopWork(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: IssueStopWorkDto,
  ) {
    return await this.safetyQualityService.issueStopWork(organizationId, id, dto, userId);
  }

  @Post('safety/:id/lift-stop-work')
  @RequirePermissions('installation:safety:manage')
  async liftStopWork(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: LiftStopWorkDto,
  ) {
    return await this.safetyQualityService.liftStopWork(organizationId, id, dto, userId);
  }

  @Post('safety/incidents')
  @RequirePermissions('installation:safety:manage')
  async reportIncident(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReportSafetyIncidentDto,
  ) {
    return await this.safetyQualityService.reportIncident(organizationId, dto, userId);
  }

  @Post('quality')
  @RequirePermissions('installation:quality:manage')
  async createQualityInspection(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateQualityInspectionDto,
  ) {
    return await this.safetyQualityService.createQualityInspection(organizationId, dto, userId);
  }

  @Post('quality/:id/resolve-rework')
  @RequirePermissions('installation:quality:manage')
  async resolveRework(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RecordReworkResolutionDto,
  ) {
    return await this.safetyQualityService.resolveRework(organizationId, id, dto, userId);
  }

  // ---------------------------------------------------------------------------
  // 8. Commissioning & Testing
  // ---------------------------------------------------------------------------
  @Post('commissioning')
  @RequirePermissions('installation:commissioning:manage')
  async createCommissioningRecord(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommissioningRecordDto,
  ) {
    return await this.commissioningService.createCommissioningRecord(organizationId, dto, userId);
  }

  @Post('commissioning/:id/tests')
  @RequirePermissions('installation:commissioning:manage')
  async recordTest(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: RecordCommissioningTestDto,
  ) {
    return await this.commissioningService.recordTest(organizationId, id, dto);
  }

  @Post('commissioning/:id/approve')
  @RequirePermissions('installation:commissioning:manage')
  async approveCommissioning(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ApproveCommissioningDto,
  ) {
    return await this.commissioningService.approveCommissioning(organizationId, id, dto, userId);
  }

  @Post('commissioning/:id/reject')
  @RequirePermissions('installation:commissioning:manage')
  async rejectCommissioning(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RejectCommissioningDto,
  ) {
    return await this.commissioningService.rejectCommissioning(organizationId, id, dto, userId);
  }

  // ---------------------------------------------------------------------------
  // 9. DISCOM / Utility Tracking
  // ---------------------------------------------------------------------------
  @Post('utility-tracking')
  @RequirePermissions('installation:discom:manage')
  async createUtilityTracking(@CurrentTenant() organizationId: string, @Body() dto: CreateUtilityTrackingDto) {
    return await this.discomTrackingService.createUtilityTracking(organizationId, dto);
  }

  @Get('utility-tracking/:projectId')
  @RequirePermissions('installation:discom:read')
  async getUtilityTracking(@CurrentTenant() organizationId: string, @Param('projectId') projectId: string) {
    return await this.discomTrackingService.getUtilityTracking(organizationId, projectId);
  }

  @Patch('utility-tracking/:id')
  @RequirePermissions('installation:discom:manage')
  async updateUtilityTracking(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUtilityTrackingDto,
  ) {
    return await this.discomTrackingService.updateUtilityTracking(organizationId, id, dto);
  }

  // ---------------------------------------------------------------------------
  // 10. Customer Handover & Punchlist
  // ---------------------------------------------------------------------------
  @Post('customer-handover')
  @RequirePermissions('installation:handover:manage')
  async createCustomerHandover(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCustomerHandoverDto,
  ) {
    return await this.customerHandoverService.createCustomerHandover(organizationId, dto, userId);
  }

  @Get('customer-handover/:projectId')
  @RequirePermissions('installation:handover:read')
  async getCustomerHandover(@CurrentTenant() organizationId: string, @Param('projectId') projectId: string) {
    return await this.customerHandoverService.getCustomerHandover(organizationId, projectId);
  }

  @Post('customer-handover/:id/punchlist')
  @RequirePermissions('installation:handover:manage')
  async addPunchlistItem(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: AddPunchlistItemDto,
  ) {
    return await this.customerHandoverService.addPunchlistItem(organizationId, id, dto);
  }

  @Patch('punchlist/:id/resolve')
  @RequirePermissions('installation:handover:manage')
  async resolvePunchlistItem(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ResolvePunchlistItemDto,
  ) {
    return await this.customerHandoverService.resolvePunchlistItem(organizationId, id, dto, userId);
  }

  @Post('customer-handover/:id/sign-off')
  @RequirePermissions('installation:handover:manage')
  async signOffHandover(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: SignOffCustomerHandoverDto,
  ) {
    return await this.customerHandoverService.signOffHandover(organizationId, id, dto);
  }

  // ---------------------------------------------------------------------------
  // 11. Project Costing
  // ---------------------------------------------------------------------------
  @Post('costs')
  @RequirePermissions('installation:costs:manage')
  async createProjectCost(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProjectCostDto,
  ) {
    return await this.projectCostService.createProjectCost(organizationId, dto, userId);
  }

  @Get('costs/:projectId')
  @RequirePermissions('installation:costs:read')
  async listProjectCosts(@CurrentTenant() organizationId: string, @Param('projectId') projectId: string) {
    return await this.projectCostService.listProjectCosts(organizationId, projectId);
  }

  @Get('costs/:projectId/summary')
  @RequirePermissions('installation:costs:read')
  async getProjectCostSummary(@CurrentTenant() organizationId: string, @Param('projectId') projectId: string) {
    return await this.projectCostService.getProjectCostSummary(organizationId, projectId);
  }
}
