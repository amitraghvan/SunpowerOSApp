import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateDispatchOrderDto,
  CreateDeliveryChallanDto,
  ConfirmDeliveryDto,
} from '@solaros/contracts';

@Controller('dispatch')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post()
  @RequirePermissions('dispatch:orders:manage')
  async createDispatch(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDispatchOrderDto,
  ) {
    return await this.dispatchService.createDispatchOrder(organizationId, dto, userId);
  }

  @Get()
  @RequirePermissions('dispatch:orders:read')
  async listDispatches(
    @CurrentTenant() organizationId: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return await this.dispatchService.listDispatchOrders(organizationId, {
      warehouseId,
      status,
      search,
    });
  }

  @Get(':id')
  @RequirePermissions('dispatch:orders:read')
  async getDispatch(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.dispatchService.getDispatchOrder(organizationId, id);
  }

  @Post(':id/approve')
  @RequirePermissions('dispatch:orders:manage')
  async approveDispatch(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.dispatchService.approveDispatchOrder(organizationId, id, userId);
  }

  @Post(':id/post')
  @RequirePermissions('dispatch:orders:manage')
  async postDispatch(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.dispatchService.postDispatchOrder(organizationId, id, userId);
  }

  @Post(':id/confirm-delivery')
  @RequirePermissions('dispatch:pod:manage')
  async confirmDelivery(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ConfirmDeliveryDto,
  ) {
    return await this.dispatchService.confirmDelivery(organizationId, id, dto, userId);
  }
}

@Controller('delivery-challans')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class DeliveryChallanController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post()
  @RequirePermissions('dispatch:challan:manage')
  async createChallan(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDeliveryChallanDto,
  ) {
    return await this.dispatchService.generateDeliveryChallan(organizationId, dto, userId);
  }

  @Get()
  @RequirePermissions('dispatch:orders:read')
  async listChallans(
    @CurrentTenant() organizationId: string,
    @Query('search') search?: string,
  ) {
    return await this.dispatchService.listDeliveryChallans(organizationId, { search });
  }

  @Get(':id')
  @RequirePermissions('dispatch:orders:read')
  async getChallan(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.dispatchService.getDeliveryChallan(organizationId, id);
  }
}
