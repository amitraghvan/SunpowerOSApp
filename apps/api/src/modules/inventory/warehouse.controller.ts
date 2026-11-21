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
import { WarehouseService } from './warehouse.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  CreateWarehouseLocationDto,
} from '@solaros/contracts';

@Controller('warehouses')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  @RequirePermissions('warehouse:manage')
  async createWarehouse(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWarehouseDto,
  ) {
    return await this.warehouseService.createWarehouse(organizationId, dto, userId);
  }

  @Get()
  @RequirePermissions('warehouse:read')
  async listWarehouses(
    @CurrentTenant() organizationId: string,
    @Query('branchId') branchId?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ) {
    return await this.warehouseService.listWarehouses(organizationId, {
      branchId,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      search,
    });
  }

  @Get(':id')
  @RequirePermissions('warehouse:read')
  async getWarehouse(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.warehouseService.getWarehouse(organizationId, id);
  }

  @Patch(':id')
  @RequirePermissions('warehouse:manage')
  async updateWarehouse(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return await this.warehouseService.updateWarehouse(organizationId, id, dto);
  }

  @Post(':id/locations')
  @RequirePermissions('warehouse:manage')
  async createLocation(
    @CurrentTenant() organizationId: string,
    @Param('id') warehouseId: string,
    @Body() dto: CreateWarehouseLocationDto,
  ) {
    return await this.warehouseService.createLocation(organizationId, warehouseId, dto);
  }

  @Get(':id/locations')
  @RequirePermissions('warehouse:read')
  async listLocations(
    @CurrentTenant() organizationId: string,
    @Param('id') warehouseId: string,
  ) {
    return await this.warehouseService.listWarehouseLocations(organizationId, warehouseId);
  }
}
