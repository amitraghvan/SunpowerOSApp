import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TenantContext } from '@solaros/types';
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

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------
  async createCategory(tenant: TenantContext, dto: CreateCategoryDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      return tx.productCategory.create({
        data: {
          organizationId: tenant.organizationId,
          code: dto.code.toUpperCase(),
          name: dto.name,
          description: dto.description || null,
          icon: dto.icon || null,
        },
      });
    });
  }

  async getCategories(tenant: TenantContext) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      return tx.productCategory.findMany({
        where: {
          organizationId: tenant.organizationId,
          isActive: true,
        },
        include: {
          _count: { select: { products: true, attributes: true } },
        },
        orderBy: { name: 'asc' },
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Manufacturers
  // ---------------------------------------------------------------------------
  async createManufacturer(tenant: TenantContext, dto: CreateManufacturerDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      return tx.manufacturer.create({
        data: {
          organizationId: tenant.organizationId,
          code: dto.code.toUpperCase(),
          name: dto.name,
          country: dto.country || null,
          website: dto.website || null,
          supportEmail: dto.supportEmail || null,
          supportPhone: dto.supportPhone || null,
        },
      });
    });
  }

  async getManufacturers(tenant: TenantContext) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      return tx.manufacturer.findMany({
        where: {
          organizationId: tenant.organizationId,
          isActive: true,
        },
        include: {
          _count: { select: { products: true } },
        },
        orderBy: { name: 'asc' },
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------
  async createProduct(tenant: TenantContext, dto: CreateProductDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      return tx.product.create({
        data: {
          organizationId: tenant.organizationId,
          categoryId: dto.categoryId,
          manufacturerId: dto.manufacturerId,
          code: dto.code.toUpperCase(),
          name: dto.name,
          modelNumber: dto.modelNumber,
          description: dto.description || null,
          type: dto.type,
          warrantyYears: dto.warrantyYears || 5,
          datasheetUrl: dto.datasheetUrl || null,
        },
      });
    });
  }

  async getProducts(tenant: TenantContext, filter: CatalogFilterQueryDto) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: tenant.organizationId,
    };

    if (filter.categoryId) where.categoryId = filter.categoryId;
    if (filter.manufacturerId) where.manufacturerId = filter.manufacturerId;
    if (filter.type) where.type = filter.type;
    if (filter.isActive !== undefined) where.isActive = filter.isActive;

    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { modelNumber: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const [data, total] = await Promise.all([
        tx.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            category: { select: { id: true, name: true, code: true } },
            manufacturer: { select: { id: true, name: true, code: true } },
            variants: true,
            attributeValues: {
              include: { attributeDefinition: true },
            },
          },
        }),
        tx.product.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  async getProductById(tenant: TenantContext, id: string) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id,
          organizationId: tenant.organizationId,
        },
        include: {
          category: true,
          manufacturer: true,
          variants: {
            include: {
              priceHistory: { orderBy: { effectiveFrom: 'desc' }, take: 5 },
            },
          },
          attributeValues: {
            include: { attributeDefinition: true },
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with id '${id}' not found`);
      }

      return product;
    });
  }

  // ---------------------------------------------------------------------------
  // Variants & Price History
  // ---------------------------------------------------------------------------
  async createVariant(tenant: TenantContext, productId: string, dto: CreateVariantDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, organizationId: tenant.organizationId },
      });

      if (!product) {
        throw new NotFoundException(`Product with id '${productId}' not found`);
      }

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenant.organizationId,
          productId: product.id,
          sku: dto.sku.toUpperCase(),
          name: dto.name,
          ratedCapacityWatts: dto.ratedCapacityWatts !== undefined ? dto.ratedCapacityWatts : null,
          systemVoltage: dto.systemVoltage !== undefined ? dto.systemVoltage : null,
          costPrice: dto.costPrice,
          sellingPrice: dto.sellingPrice,
          currency: dto.currency || 'INR',
          isDefault: dto.isDefault ?? false,
        },
      });

      // Record initial price history
      await tx.productPriceHistory.create({
        data: {
          organizationId: tenant.organizationId,
          variantId: variant.id,
          costPrice: dto.costPrice,
          sellingPrice: dto.sellingPrice,
          effectiveFrom: new Date(),
          changedById: tenant.userId !== 'anonymous' ? tenant.userId : null,
          reason: 'Initial variant creation price',
        },
      });

      return variant;
    });
  }

  async updateVariantPrice(tenant: TenantContext, variantId: string, dto: UpdatePriceDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: {
          id: variantId,
          organizationId: tenant.organizationId,
        },
      });

      if (!variant) {
        throw new NotFoundException(`Product variant with id '${variantId}' not found`);
      }

      // Close active price history record
      await tx.productPriceHistory.updateMany({
        where: {
          variantId: variant.id,
          organizationId: tenant.organizationId,
          effectiveTo: null,
        },
        data: {
          effectiveTo: new Date(),
        },
      });

      // Insert new price history record
      await tx.productPriceHistory.create({
        data: {
          organizationId: tenant.organizationId,
          variantId: variant.id,
          costPrice: dto.costPrice,
          sellingPrice: dto.sellingPrice,
          effectiveFrom: new Date(),
          changedById: tenant.userId !== 'anonymous' ? tenant.userId : null,
          reason: dto.reason || 'Price adjustment',
        },
      });

      // Update current variant prices
      return tx.productVariant.update({
        where: { id: variant.id },
        data: {
          costPrice: dto.costPrice,
          sellingPrice: dto.sellingPrice,
        },
      });
    });
  }

  async getPriceHistory(tenant: TenantContext, variantId: string) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      return tx.productPriceHistory.findMany({
        where: {
          variantId,
          organizationId: tenant.organizationId,
        },
        include: {
          changedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { effectiveFrom: 'desc' },
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Attributes
  // ---------------------------------------------------------------------------
  async createAttributeDefinition(tenant: TenantContext, dto: CreateAttributeDefinitionDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      return tx.productAttributeDefinition.create({
        data: {
          organizationId: tenant.organizationId,
          categoryId: dto.categoryId,
          name: dto.name,
          code: dto.code.toUpperCase(),
          dataType: dto.dataType,
          unit: dto.unit || null,
          isRequired: dto.isRequired ?? false,
          options: dto.options || null,
        },
      });
    });
  }

  async getAttributeDefinitions(tenant: TenantContext, categoryId: string) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      return tx.productAttributeDefinition.findMany({
        where: {
          categoryId,
          organizationId: tenant.organizationId,
        },
        orderBy: { name: 'asc' },
      });
    });
  }

  async setProductAttributes(tenant: TenantContext, productId: string, dto: SetAttributeValuesDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, organizationId: tenant.organizationId },
      });

      if (!product) {
        throw new NotFoundException(`Product with id '${productId}' not found`);
      }

      const operations = dto.attributes.map((attr) =>
        tx.productAttributeValue.upsert({
          where: {
            productId_attributeDefinitionId: {
              productId: product.id,
              attributeDefinitionId: attr.attributeDefinitionId,
            },
          },
          create: {
            organizationId: tenant.organizationId,
            productId: product.id,
            attributeDefinitionId: attr.attributeDefinitionId,
            valueString: attr.valueString || null,
            valueNumber: attr.valueNumber !== undefined ? attr.valueNumber : null,
            valueBoolean: attr.valueBoolean !== undefined ? attr.valueBoolean : null,
          },
          update: {
            valueString: attr.valueString || null,
            valueNumber: attr.valueNumber !== undefined ? attr.valueNumber : null,
            valueBoolean: attr.valueBoolean !== undefined ? attr.valueBoolean : null,
          },
        })
      );

      return Promise.all(operations);
    });
  }
}
