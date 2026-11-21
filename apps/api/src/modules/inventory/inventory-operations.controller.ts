import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { ReservationService } from './reservation.service';
import { TransferService } from './transfer.service';
import { AdjustmentService } from './adjustment.service';
import { PickingPackingService } from './picking-packing.service';
import { ReturnsService } from './returns.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateStockReservationDto,
  ReleaseStockReservationDto,
  CreateStockTransferDto,
  ShipStockTransferDto,
  ReceiveStockTransferDto,
  CreateStockCountDto,
  SubmitStockCountDto,
  CreateStockAdjustmentDto,
  ApproveStockAdjustmentDto,
  CreatePickingOrderDto,
  ConfirmPickingOrderDto,
  CreatePackingOrderDto,
  ConfirmPackingOrderDto,
  CreateCustomerReturnDto,
  InspectCustomerReturnDto,
} from '@solaros/contracts';

@Controller('inventory')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class InventoryOperationsController {
  constructor(
    private readonly stockService: StockService,
    private readonly reservationService: ReservationService,
    private readonly transferService: TransferService,
    private readonly adjustmentService: AdjustmentService,
    private readonly pickingPackingService: PickingPackingService,
    private readonly returnsService: ReturnsService,
  ) {}

  // ===========================================================================
  // 1. STOCK OVERVIEW & VISIBILITY
  // ===========================================================================

  @Get('stock')
  @RequirePermissions('inventory:stock:read')
  async getStock(
    @CurrentTenant() organizationId: string,
    @Query('productVariantId') productVariantId?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('search') search?: string,
  ) {
    return await this.stockService.getStockOverview(organizationId, {
      productVariantId,
      warehouseId,
      search,
    });
  }

  @Get('stock/:productVariantId')
  @RequirePermissions('inventory:stock:read')
  async getProductStockDetails(
    @CurrentTenant() organizationId: string,
    @Param('productVariantId') productVariantId: string,
  ) {
    return await this.stockService.getProductStockDetails(organizationId, productVariantId);
  }

  // ===========================================================================
  // 2. STOCK RESERVATIONS
  // ===========================================================================

  @Post('reservations')
  @RequirePermissions('inventory:reservations:manage')
  async createReservation(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStockReservationDto,
  ) {
    return await this.reservationService.createReservation(organizationId, dto, userId);
  }

  @Get('reservations')
  @RequirePermissions('inventory:reservations:read')
  async listReservations(
    @CurrentTenant() organizationId: string,
    @Query('salesOrderId') salesOrderId?: string,
    @Query('projectInitiationId') projectInitiationId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return await this.reservationService.listReservations(organizationId, {
      salesOrderId,
      projectInitiationId,
      status,
      search,
    });
  }

  @Get('reservations/:id')
  @RequirePermissions('inventory:reservations:read')
  async getReservation(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.reservationService.getReservation(organizationId, id);
  }

  @Post('reservations/:id/release')
  @RequirePermissions('inventory:reservations:manage')
  async releaseReservation(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ReleaseStockReservationDto,
  ) {
    return await this.reservationService.releaseReservation(organizationId, id, dto, userId);
  }

  // ===========================================================================
  // 3. WAREHOUSE TRANSFERS
  // ===========================================================================

  @Post('transfers')
  @RequirePermissions('inventory:transfers:manage')
  async createTransfer(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStockTransferDto,
  ) {
    return await this.transferService.createTransfer(organizationId, dto, userId);
  }

  @Get('transfers')
  @RequirePermissions('inventory:transfers:read')
  async listTransfers(
    @CurrentTenant() organizationId: string,
    @Query('sourceWarehouseId') sourceWarehouseId?: string,
    @Query('destinationWarehouseId') destinationWarehouseId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return await this.transferService.listTransfers(organizationId, {
      sourceWarehouseId,
      destinationWarehouseId,
      status,
      search,
    });
  }

  @Get('transfers/:id')
  @RequirePermissions('inventory:transfers:read')
  async getTransfer(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.transferService.getTransfer(organizationId, id);
  }

  @Post('transfers/:id/approve')
  @RequirePermissions('inventory:transfers:manage')
  async approveTransfer(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.transferService.approveTransfer(organizationId, id, userId);
  }

  @Post('transfers/:id/ship')
  @RequirePermissions('inventory:transfers:manage')
  async shipTransfer(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ShipStockTransferDto,
  ) {
    return await this.transferService.shipTransfer(organizationId, id, dto, userId);
  }

  @Post('transfers/:id/receive')
  @RequirePermissions('inventory:transfers:manage')
  async receiveTransfer(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ReceiveStockTransferDto,
  ) {
    return await this.transferService.receiveTransfer(organizationId, id, dto, userId);
  }

  // ===========================================================================
  // 4. COUNTS & ADJUSTMENTS
  // ===========================================================================

  @Post('counts')
  @RequirePermissions('inventory:counts:manage')
  async createCount(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStockCountDto,
  ) {
    return await this.adjustmentService.createStockCount(organizationId, dto, userId);
  }

  @Get('counts')
  @RequirePermissions('inventory:counts:read')
  async listCounts(
    @CurrentTenant() organizationId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
  ) {
    return await this.adjustmentService.listStockCounts(organizationId, { warehouseId, status });
  }

  @Post('counts/:id/submit')
  @RequirePermissions('inventory:counts:manage')
  async submitCount(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SubmitStockCountDto,
  ) {
    return await this.adjustmentService.submitStockCount(organizationId, id, dto, userId);
  }

  @Post('adjustments')
  @RequirePermissions('inventory:adjust:manage')
  async createAdjustment(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStockAdjustmentDto,
  ) {
    return await this.adjustmentService.createStockAdjustment(organizationId, dto, userId);
  }

  @Get('adjustments')
  @RequirePermissions('inventory:stock:read')
  async listAdjustments(
    @CurrentTenant() organizationId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
  ) {
    return await this.adjustmentService.listStockAdjustments(organizationId, { warehouseId, status });
  }

  @Post('adjustments/:id/approve')
  @RequirePermissions('inventory:adjust:manage')
  async approveAdjustment(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ApproveStockAdjustmentDto,
  ) {
    return await this.adjustmentService.approveStockAdjustment(organizationId, id, dto, userId);
  }

  // ===========================================================================
  // 5. PICKING & PACKING
  // ===========================================================================

  @Post('picking')
  @RequirePermissions('inventory:picking:manage')
  async createPicking(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePickingOrderDto,
  ) {
    return await this.pickingPackingService.createPickingOrder(organizationId, dto, userId);
  }

  @Get('picking')
  @RequirePermissions('inventory:picking:read')
  async listPicking(
    @CurrentTenant() organizationId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
  ) {
    return await this.pickingPackingService.listPickingOrders(organizationId, { warehouseId, status });
  }

  @Get('picking/:id')
  @RequirePermissions('inventory:picking:read')
  async getPicking(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.pickingPackingService.getPickingOrder(organizationId, id);
  }

  @Post('picking/:id/confirm')
  @RequirePermissions('inventory:picking:manage')
  async confirmPicking(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ConfirmPickingOrderDto,
  ) {
    return await this.pickingPackingService.confirmPicking(organizationId, id, dto, userId);
  }

  @Post('packing')
  @RequirePermissions('inventory:packing:manage')
  async createPacking(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePackingOrderDto,
  ) {
    return await this.pickingPackingService.createPackingOrder(organizationId, dto, userId);
  }

  @Get('packing')
  @RequirePermissions('inventory:packing:read')
  async listPacking(
    @CurrentTenant() organizationId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
  ) {
    return await this.pickingPackingService.listPackingOrders(organizationId, { warehouseId, status });
  }

  @Get('packing/:id')
  @RequirePermissions('inventory:packing:read')
  async getPacking(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.pickingPackingService.getPackingOrder(organizationId, id);
  }

  @Post('packing/:id/confirm')
  @RequirePermissions('inventory:packing:manage')
  async confirmPacking(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ConfirmPackingOrderDto,
  ) {
    return await this.pickingPackingService.confirmPacking(organizationId, id, dto, userId);
  }

  // ===========================================================================
  // 6. CUSTOMER RETURNS
  // ===========================================================================

  @Post('returns')
  @RequirePermissions('inventory:returns:manage')
  async createReturn(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCustomerReturnDto,
  ) {
    return await this.returnsService.createCustomerReturn(organizationId, dto, userId);
  }

  @Get('returns')
  @RequirePermissions('inventory:returns:read')
  async listReturns(
    @CurrentTenant() organizationId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
  ) {
    return await this.returnsService.listCustomerReturns(organizationId, { warehouseId, status });
  }

  @Get('returns/:id')
  @RequirePermissions('inventory:returns:read')
  async getReturn(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.returnsService.getCustomerReturn(organizationId, id);
  }

  @Post('returns/:id/receive')
  @RequirePermissions('inventory:returns:manage')
  async receiveReturn(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.returnsService.receiveCustomerReturn(organizationId, id, userId);
  }

  @Post('returns/:id/inspect')
  @RequirePermissions('inventory:returns:manage')
  async inspectReturn(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: InspectCustomerReturnDto,
  ) {
    return await this.returnsService.inspectCustomerReturn(organizationId, id, dto, userId);
  }
}
