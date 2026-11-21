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
import { CustomersService } from './customers.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantContext } from '@solaros/types';
import { API_CONSTANTS } from '@solaros/config';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CreateCustomerContactDto,
  CreateCustomerAddressDto,
  CreateCustomerSiteDto,
  CustomerFilterQueryDto,
} from '@solaros/contracts';

@ApiTags('Customers & 360')
@ApiBearerAuth()
@ApiHeader({ name: API_CONSTANTS.TENANT_ID_HEADER, required: false })
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @RequirePermissions('customer:customers:create')
  @ApiOperation({ summary: 'Create new customer record' })
  async createCustomer(@CurrentTenant() tenant: TenantContext, @Body() dto: CreateCustomerDto) {
    return this.customersService.createCustomer(tenant, dto);
  }

  @Get()
  @RequirePermissions('customer:customers:read')
  @ApiOperation({ summary: 'List and filter customers' })
  async getCustomers(@CurrentTenant() tenant: TenantContext, @Query() filter: CustomerFilterQueryDto) {
    return this.customersService.getCustomers(tenant, filter);
  }

  @Get(':id')
  @RequirePermissions('customer:customers:read')
  @ApiOperation({ summary: 'Get customer basic details' })
  async getCustomerById(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.customersService.getCustomerById(tenant, id);
  }

  @Get(':id/360')
  @RequirePermissions('customer:360:read')
  @ApiOperation({ summary: 'Get comprehensive Customer 360 profile' })
  async getCustomer360(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.customersService.getCustomer360(tenant, id);
  }

  @Patch(':id')
  @RequirePermissions('customer:customers:update')
  @ApiOperation({ summary: 'Update customer details' })
  async updateCustomer(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto
  ) {
    return this.customersService.updateCustomer(tenant, id, dto);
  }

  @Post(':id/contacts')
  @RequirePermissions('customer:customers:update')
  @ApiOperation({ summary: 'Add contact person to customer' })
  async addContact(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: CreateCustomerContactDto
  ) {
    return this.customersService.addContact(tenant, id, dto);
  }

  @Post(':id/addresses')
  @RequirePermissions('customer:customers:update')
  @ApiOperation({ summary: 'Add billing/shipping address to customer' })
  async addAddress(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: CreateCustomerAddressDto
  ) {
    return this.customersService.addAddress(tenant, id, dto);
  }

  @Post(':id/sites')
  @RequirePermissions('customer:customers:update')
  @ApiOperation({ summary: 'Add installation site to customer' })
  async addSite(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: CreateCustomerSiteDto
  ) {
    return this.customersService.addSite(tenant, id, dto);
  }
}
