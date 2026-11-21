import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateSalesOrderDto,
  RecordAdvancePaymentDto,
  ConfirmSalesOrderDto,
} from '@solaros/contracts';

@Controller('sales-orders')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  @RequirePermissions('sales_order:orders:manage')
  async createSalesOrder(
    @CurrentTenant('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSalesOrderDto,
  ) {
    return await this.salesOrdersService.createSalesOrder(organizationId, dto, userId);
  }

  @Get()
  @RequirePermissions('sales_order:orders:read')
  async listOrders(
    @CurrentTenant('organizationId') organizationId: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    return await this.salesOrdersService.listOrders(organizationId, { customerId, status });
  }

  @Get(':id')
  @RequirePermissions('sales_order:orders:read')
  async getOrder(
    @CurrentTenant('organizationId') organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.salesOrdersService.getOrder(organizationId, id);
  }

  @Post(':id/advance-payment')
  @RequirePermissions('sales_order:orders:manage')
  async recordAdvancePayment(
    @CurrentTenant('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RecordAdvancePaymentDto,
  ) {
    return await this.salesOrdersService.recordAdvancePayment(
      organizationId,
      id,
      dto,
      userId,
    );
  }

  @Post(':id/confirm')
  @RequirePermissions('sales_order:orders:confirm')
  async confirmOrder(
    @CurrentTenant('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ConfirmSalesOrderDto,
  ) {
    return await this.salesOrdersService.confirmSalesOrder(
      organizationId,
      id,
      dto,
      userId,
    );
  }
}
