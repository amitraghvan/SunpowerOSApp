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
import { SuppliersService } from './suppliers.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateSupplierDto,
  UpdateSupplierDto,
  CreateSupplierContactDto,
  CreateSupplierAddressDto,
  CreateSupplierBankAccountDto,
  CreateSupplierDocumentDto,
  CreateSupplierProductMappingDto,
  UpdateSupplierProductMappingDto,
} from '@solaros/contracts';

@Controller('suppliers')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @RequirePermissions('suppliers:suppliers:manage')
  async createSupplier(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSupplierDto,
  ) {
    return await this.suppliersService.createSupplier(organizationId, dto, userId);
  }

  @Get()
  @RequirePermissions('suppliers:suppliers:read')
  async listSuppliers(
    @CurrentTenant() organizationId: string,
    @Query('category') category?: string,
    @Query('supplierType') supplierType?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return await this.suppliersService.listSuppliers(organizationId, {
      category,
      supplierType,
      status,
      search,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('suppliers:suppliers:read')
  async getSupplier(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.suppliersService.getSupplier(organizationId, id);
  }

  @Put(':id')
  @RequirePermissions('suppliers:suppliers:manage')
  async updateSupplier(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return await this.suppliersService.updateSupplier(organizationId, id, dto);
  }

  @Post(':id/contacts')
  @RequirePermissions('suppliers:suppliers:manage')
  async addContact(
    @CurrentTenant() organizationId: string,
    @Param('id') supplierId: string,
    @Body() dto: CreateSupplierContactDto,
  ) {
    return await this.suppliersService.addContact(organizationId, supplierId, dto);
  }

  @Post(':id/addresses')
  @RequirePermissions('suppliers:suppliers:manage')
  async addAddress(
    @CurrentTenant() organizationId: string,
    @Param('id') supplierId: string,
    @Body() dto: CreateSupplierAddressDto,
  ) {
    return await this.suppliersService.addAddress(organizationId, supplierId, dto);
  }

  @Post(':id/bank-accounts')
  @RequirePermissions('suppliers:suppliers:manage')
  async addBankAccount(
    @CurrentTenant() organizationId: string,
    @Param('id') supplierId: string,
    @Body() dto: CreateSupplierBankAccountDto,
  ) {
    return await this.suppliersService.addBankAccount(organizationId, supplierId, dto);
  }

  @Post(':id/documents')
  @RequirePermissions('suppliers:suppliers:manage')
  async addDocument(
    @CurrentTenant() organizationId: string,
    @Param('id') supplierId: string,
    @Body() dto: CreateSupplierDocumentDto,
  ) {
    return await this.suppliersService.addDocument(organizationId, supplierId, dto);
  }

  @Post(':id/product-mappings')
  @RequirePermissions('suppliers:suppliers:manage')
  async createProductMapping(
    @CurrentTenant() organizationId: string,
    @Param('id') supplierId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSupplierProductMappingDto,
  ) {
    return await this.suppliersService.createProductMapping(organizationId, supplierId, dto, userId);
  }

  @Put(':id/product-mappings/:mappingId')
  @RequirePermissions('suppliers:suppliers:manage')
  async updateProductMapping(
    @CurrentTenant() organizationId: string,
    @Param('id') supplierId: string,
    @Param('mappingId') mappingId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSupplierProductMappingDto,
  ) {
    return await this.suppliersService.updateProductMapping(organizationId, supplierId, mappingId, dto, userId);
  }

  @Get(':id/price-history')
  @RequirePermissions('suppliers:suppliers:read')
  async getPriceHistory(
    @CurrentTenant() organizationId: string,
    @Param('id') supplierId: string,
    @Query('productVariantId') productVariantId?: string,
  ) {
    return await this.suppliersService.getPriceHistory(organizationId, supplierId, productVariantId);
  }
}
