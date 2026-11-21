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
import { InventoryService } from './inventory.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateInventoryLocationDto,
  CreateGoodsReceiptNoteDto,
  PerformInspectionDto,
  RegisterSerialNumbersDto,
  UpdateSerialStatusDto,
  CreateSupplierReturnDto,
} from '@solaros/contracts';

@Controller('inbound')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ---------------- Locations ----------------
  @Post('locations')
  @RequirePermissions('inbound:grn:manage')
  async createLocation(
    @CurrentTenant() organizationId: string,
    @Body() dto: CreateInventoryLocationDto,
  ) {
    return await this.inventoryService.createLocation(organizationId, dto);
  }

  @Get('locations')
  @RequirePermissions('inbound:grn:read')
  async listLocations(@CurrentTenant() organizationId: string) {
    return await this.inventoryService.listLocations(organizationId);
  }

  // ---------------- Goods Receipt Notes (GRN) ----------------
  @Post('grns')
  @RequirePermissions('inbound:grn:manage')
  async createGRN(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateGoodsReceiptNoteDto,
  ) {
    return await this.inventoryService.createGoodsReceiptNote(organizationId, dto, userId);
  }

  @Get('grns')
  @RequirePermissions('inbound:grn:read')
  async listGRNs(
    @CurrentTenant() organizationId: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return await this.inventoryService.listGoodsReceiptNotes(organizationId, {
      status,
      supplierId,
      search,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('grns/:id')
  @RequirePermissions('inbound:grn:read')
  async getGRN(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.inventoryService.getGoodsReceiptNote(organizationId, id);
  }

  // ---------------- Quality Inspections (QIR) ----------------
  @Post('inspections')
  @RequirePermissions('inbound:inspection:manage')
  async performInspection(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PerformInspectionDto,
  ) {
    return await this.inventoryService.performQualityInspection(organizationId, dto, userId);
  }

  // ---------------- Serial & Batch Registration ----------------
  @Post('serials/register')
  @RequirePermissions('inbound:serials:manage')
  async registerSerials(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterSerialNumbersDto,
  ) {
    return await this.inventoryService.registerSerialNumbers(organizationId, dto, userId);
  }

  @Get('serials')
  @RequirePermissions('inbound:serials:manage')
  async listSerials(
    @CurrentTenant() organizationId: string,
    @Query('productVariantId') productVariantId?: string,
    @Query('status') status?: string,
    @Query('batchNumber') batchNumber?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return await this.inventoryService.listSerials(organizationId, {
      productVariantId,
      status,
      batchNumber,
      search,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('serials/:id')
  @RequirePermissions('inbound:serials:manage')
  async getSerial(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.inventoryService.getSerialDetails(organizationId, id);
  }

  @Put('serials/:id/status')
  @RequirePermissions('inbound:serials:manage')
  async updateSerialStatus(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSerialStatusDto,
  ) {
    return await this.inventoryService.updateSerialStatus(organizationId, id, dto);
  }

  // ---------------- Supplier Returns ----------------
  @Post('returns')
  @RequirePermissions('inbound:returns:manage')
  async createSupplierReturn(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSupplierReturnDto,
  ) {
    return await this.inventoryService.createSupplierReturn(organizationId, dto, userId);
  }

  @Get('returns')
  @RequirePermissions('inbound:returns:manage')
  async listSupplierReturns(
    @CurrentTenant() organizationId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return await this.inventoryService.listSupplierReturns(organizationId, { status, search });
  }

  @Get('returns/:id')
  @RequirePermissions('inbound:returns:manage')
  async getSupplierReturn(@CurrentTenant() organizationId: string, @Param('id') id: string) {
    return await this.inventoryService.getSupplierReturn(organizationId, id);
  }

  // ---------------- Inbound Ledger Movements ----------------
  @Get('movements')
  @RequirePermissions('inbound:grn:read')
  async listMovements(
    @CurrentTenant() organizationId: string,
    @Query('productVariantId') productVariantId?: string,
    @Query('movementType') movementType?: string,
    @Query('search') search?: string,
  ) {
    return await this.inventoryService.listMovements(organizationId, {
      productVariantId,
      movementType,
      search,
    });
  }
}
