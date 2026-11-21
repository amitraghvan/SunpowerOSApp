import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  GenerateMRPFromProjectDto,
  CreatePurchaseRequisitionDto,
  ApproveRequisitionDto,
  RejectRequisitionDto,
  CreateRFQDto,
  SubmitSupplierQuotationDto,
  AwardRFQDto,
  CreatePurchaseOrderDto,
  CreatePORevisionDto,
  ApprovePurchaseOrderDto,
  CreateDeliveryScheduleDto,
} from '@solaros/contracts';

@Controller('procurement')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  // ---------------- Dashboard Analytics ----------------
  @Get('dashboard')
  @RequirePermissions('procurement:po:read')
  async getDashboard(@CurrentTenant() organizationId: string) {
    return await this.procurementService.getProcurementDashboardMetrics(organizationId);
  }

  // ---------------- Material Requirements (MRP) ----------------
  @Post('mrp/generate')
  @RequirePermissions('procurement:mrp:manage')
  async generateMRP(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateMRPFromProjectDto,
  ) {
    return await this.procurementService.generateMRPFromProject(organizationId, dto, userId);
  }

  @Get('mrp')
  @RequirePermissions('procurement:mrp:manage')
  async listMRPs(
    @CurrentTenant() organizationId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return await this.procurementService.listMaterialRequirements(organizationId, { status, search });
  }

  @Get('mrp/:id')
  @RequirePermissions('procurement:mrp:manage')
  async getMRP(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.procurementService.getMaterialRequirement(organizationId, id);
  }

  @Post('mrp/:id/convert-to-pr')
  @RequirePermissions('procurement:mrp:manage')
  async convertMRPToPR(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.procurementService.convertMRPToRequisition(organizationId, id, userId);
  }

  // ---------------- Purchase Requisitions (PR) ----------------
  @Post('requisitions')
  @RequirePermissions('procurement:requisitions:manage')
  async createRequisition(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePurchaseRequisitionDto,
  ) {
    return await this.procurementService.createRequisition(organizationId, dto, userId);
  }

  @Get('requisitions')
  @RequirePermissions('procurement:requisitions:read')
  async listRequisitions(
    @CurrentTenant() organizationId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('search') search?: string,
  ) {
    return await this.procurementService.listRequisitions(organizationId, { status, priority, search });
  }

  @Get('requisitions/:id')
  @RequirePermissions('procurement:requisitions:read')
  async getRequisition(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.procurementService.getRequisition(organizationId, id);
  }

  @Post('requisitions/:id/submit')
  @RequirePermissions('procurement:requisitions:manage')
  async submitRequisition(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.procurementService.submitRequisition(organizationId, id);
  }

  @Post('requisitions/:id/approve')
  @RequirePermissions('procurement:requisitions:approve')
  async approveRequisition(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ApproveRequisitionDto,
  ) {
    return await this.procurementService.approveRequisition(organizationId, id, dto, userId);
  }

  @Post('requisitions/:id/reject')
  @RequirePermissions('procurement:requisitions:approve')
  async rejectRequisition(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RejectRequisitionDto,
  ) {
    return await this.procurementService.rejectRequisition(organizationId, id, dto, userId);
  }

  // ---------------- RFQ & Vendor Quotations ----------------
  @Post('rfqs')
  @RequirePermissions('procurement:rfq:manage')
  async createRFQ(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRFQDto,
  ) {
    return await this.procurementService.createRFQ(organizationId, dto, userId);
  }

  @Get('rfqs')
  @RequirePermissions('procurement:rfq:manage')
  async listRFQs(
    @CurrentTenant() organizationId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return await this.procurementService.listRFQs(organizationId, { status, search });
  }

  @Get('rfqs/:id')
  @RequirePermissions('procurement:rfq:manage')
  async getRFQ(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.procurementService.getRFQ(organizationId, id);
  }

  @Post('rfqs/quotations')
  @RequirePermissions('procurement:rfq:manage')
  async submitSupplierQuotation(
    @CurrentTenant() organizationId: string,
    @Body() dto: SubmitSupplierQuotationDto,
  ) {
    return await this.procurementService.submitSupplierQuotation(organizationId, dto);
  }

  @Get('rfqs/:id/compare')
  @RequirePermissions('procurement:rfq:manage')
  async compareRFQQuotes(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.procurementService.compareQuotesForRFQ(organizationId, id);
  }

  @Post('rfqs/:id/award')
  @RequirePermissions('procurement:rfq:manage')
  async awardRFQ(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AwardRFQDto,
  ) {
    return await this.procurementService.awardRFQ(organizationId, id, dto, userId);
  }

  // ---------------- Purchase Orders (PO) ----------------
  @Post('purchase-orders')
  @RequirePermissions('procurement:po:manage')
  async createPO(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    return await this.procurementService.createPurchaseOrder(organizationId, dto, userId);
  }

  @Get('purchase-orders')
  @RequirePermissions('procurement:po:read')
  async listPOs(
    @CurrentTenant() organizationId: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
    @Query('projectInitiationId') projectInitiationId?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return await this.procurementService.listPurchaseOrders(organizationId, {
      status,
      supplierId,
      projectInitiationId,
      search,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('purchase-orders/:id')
  @RequirePermissions('procurement:po:read')
  async getPO(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.procurementService.getPurchaseOrder(organizationId, id);
  }

  @Post('purchase-orders/:id/approve')
  @RequirePermissions('procurement:po:approve')
  async approvePO(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ApprovePurchaseOrderDto,
  ) {
    return await this.procurementService.approvePurchaseOrder(organizationId, id, dto, userId);
  }

  @Post('purchase-orders/:id/revise')
  @RequirePermissions('procurement:po:manage')
  async createPORevision(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreatePORevisionDto,
  ) {
    return await this.procurementService.createPORevision(organizationId, id, dto, userId);
  }

  @Post('purchase-orders/:id/delivery-schedules')
  @RequirePermissions('procurement:po:manage')
  async createDeliverySchedule(
    @CurrentTenant() organizationId: string,
    @Param('id') poId: string,
    @Body() dto: CreateDeliveryScheduleDto,
  ) {
    return await this.procurementService.createDeliverySchedule(organizationId, poId, dto);
  }

  @Post('purchase-orders/:id/acknowledge')
  @RequirePermissions('procurement:po:manage')
  async acknowledgePO(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.procurementService.acknowledgePO(organizationId, id);
  }
}
