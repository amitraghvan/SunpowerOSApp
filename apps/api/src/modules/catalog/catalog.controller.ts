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
import { CatalogService } from './catalog.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantContext } from '@solaros/types';
import { API_CONSTANTS } from '@solaros/config';
import {
  CreateCategoryDto,
  CreateManufacturerDto,
  CreateProductDto,
  CreateVariantDto,
  CreateAttributeDefinitionDto,
  SetAttributeValuesDto,
  UpdatePriceDto,
  CatalogFilterQueryDto,
} from '@solaros/contracts';

@ApiTags('Solar Product Catalog & Pricing')
@ApiBearerAuth()
@ApiHeader({ name: API_CONSTANTS.TENANT_ID_HEADER, required: false })
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // Categories
  @Post('categories')
  @RequirePermissions('catalog:products:create')
  @ApiOperation({ summary: 'Create product hierarchy category' })
  async createCategory(@CurrentTenant() tenant: TenantContext, @Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(tenant, dto);
  }

  @Get('categories')
  @RequirePermissions('catalog:products:read')
  @ApiOperation({ summary: 'List product categories' })
  async getCategories(@CurrentTenant() tenant: TenantContext) {
    return this.catalogService.getCategories(tenant);
  }

  // Manufacturers
  @Post('manufacturers')
  @RequirePermissions('catalog:products:create')
  @ApiOperation({ summary: 'Create equipment manufacturer' })
  async createManufacturer(@CurrentTenant() tenant: TenantContext, @Body() dto: CreateManufacturerDto) {
    return this.catalogService.createManufacturer(tenant, dto);
  }

  @Get('manufacturers')
  @RequirePermissions('catalog:products:read')
  @ApiOperation({ summary: 'List equipment manufacturers' })
  async getManufacturers(@CurrentTenant() tenant: TenantContext) {
    return this.catalogService.getManufacturers(tenant);
  }

  // Products
  @Post('products')
  @RequirePermissions('catalog:products:create')
  @ApiOperation({ summary: 'Create solar hardware product' })
  async createProduct(@CurrentTenant() tenant: TenantContext, @Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(tenant, dto);
  }

  @Get('products')
  @RequirePermissions('catalog:products:read')
  @ApiOperation({ summary: 'List and filter solar equipment' })
  async getProducts(@CurrentTenant() tenant: TenantContext, @Query() filter: CatalogFilterQueryDto) {
    return this.catalogService.getProducts(tenant, filter);
  }

  @Get('products/:id')
  @RequirePermissions('catalog:products:read')
  @ApiOperation({ summary: 'Get product with variants and technical specifications' })
  async getProductById(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.catalogService.getProductById(tenant, id);
  }

  // Variants & Price History
  @Post('products/:id/variants')
  @RequirePermissions('catalog:products:create')
  @ApiOperation({ summary: 'Add variant to product' })
  async createVariant(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: CreateVariantDto
  ) {
    return this.catalogService.createVariant(tenant, id, dto);
  }

  @Post('variants/:variantId/price')
  @RequirePermissions('catalog:pricing:update')
  @ApiOperation({ summary: 'Update variant price with audit history' })
  async updateVariantPrice(
    @CurrentTenant() tenant: TenantContext,
    @Param('variantId') variantId: string,
    @Body() dto: UpdatePriceDto
  ) {
    return this.catalogService.updateVariantPrice(tenant, variantId, dto);
  }

  @Get('variants/:variantId/prices')
  @RequirePermissions('catalog:pricing:read')
  @ApiOperation({ summary: 'Get price history audit trail for variant' })
  async getPriceHistory(@CurrentTenant() tenant: TenantContext, @Param('variantId') variantId: string) {
    return this.catalogService.getPriceHistory(tenant, variantId);
  }

  // Attributes
  @Post('attribute-definitions')
  @RequirePermissions('catalog:products:create')
  @ApiOperation({ summary: 'Create technical attribute definition (e.g., efficiency, VOC)' })
  async createAttributeDefinition(
    @CurrentTenant() tenant: TenantContext,
    @Body() dto: CreateAttributeDefinitionDto
  ) {
    return this.catalogService.createAttributeDefinition(tenant, dto);
  }

  @Post('products/:productId/attributes')
  @RequirePermissions('catalog:products:update')
  @ApiOperation({ summary: 'Set technical attribute values on product' })
  async setProductAttributes(
    @CurrentTenant() tenant: TenantContext,
    @Param('productId') productId: string,
    @Body() dto: SetAttributeValuesDto
  ) {
    return this.catalogService.setProductAttributes(tenant, productId, dto);
  }
}
