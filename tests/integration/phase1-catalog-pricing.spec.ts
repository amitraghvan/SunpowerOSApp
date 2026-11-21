import { CatalogService } from '../../apps/api/src/modules/catalog/catalog.service';
import { PrismaService } from '../../apps/api/src/database/prisma.service';

describe('Phase 1 — Solar Product Catalog & Price History Integration Suite', () => {
  let prisma: PrismaService;
  let catalogService: CatalogService;

  const tenantOrg = {
    organizationId: '66666666-6666-4666-8666-666666666666',
    organizationSlug: 'catalog-test-org',
    organizationName: 'Catalog Test Organization',
    userId: '33333333-cccc-4ccc-cccc-333333333333',
    userEmail: 'procurement@cattest.com',
    roles: ['PROCUREMENT_OFFICER'],
    permissions: [],
  };

  let categoryId: string;
  let manufacturerId: string;
  let productId: string;
  let variantId: string;

  beforeAll(async () => {
    prisma = new PrismaService({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public',
        },
      },
    });
    await prisma.$connect();
    catalogService = new CatalogService(prisma);

    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);

      await tx.user.create({
        data: {
          id: tenantOrg.userId,
          email: tenantOrg.userEmail,
          firstName: 'Catalog',
          lastName: 'Manager',
        },
      });

      await tx.organization.create({
        data: {
          id: tenantOrg.organizationId,
          slug: tenantOrg.organizationSlug,
          name: tenantOrg.organizationName,
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);
    });
    await prisma.$disconnect();
  });

  it('1. should create category, manufacturer, and solar product with technical specs', async () => {
    // 1. Create Category
    const category = await catalogService.createCategory(tenantOrg, {
      code: 'SOLAR_PANELS',
      name: 'Photovoltaic Solar Modules',
      description: 'Tier-1 Mono/Poly crystalline modules',
    });
    categoryId = category.id;
    expect(category.code).toBe('SOLAR_PANELS');

    // 2. Create Manufacturer
    const manufacturer = await catalogService.createManufacturer(tenantOrg, {
      code: 'LONGI',
      name: 'LONGi Solar Technology',
      country: 'China',
      website: 'https://www.longi.com',
    });
    manufacturerId = manufacturer.id;
    expect(manufacturer.code).toBe('LONGI');

    // 3. Create Product
    const product = await catalogService.createProduct(tenantOrg, {
      categoryId,
      manufacturerId,
      code: 'MOD-LONGI-545',
      name: 'Hi-MO 5m 545W Mono PERC Module',
      modelNumber: 'LR5-72HPH-545M',
      type: 'PANEL',
      warrantyYears: 25,
      description: 'High efficiency half-cut cell solar PV module',
    });
    productId = product.id;
    expect(product.code).toBe('MOD-LONGI-545');
    expect(product.warrantyYears).toBe(25);
  });

  it('2. should create product variant and record initial price history', async () => {
    const variant = await catalogService.createVariant(tenantOrg, productId, {
      sku: 'SKU-LR5-545-SILVER',
      name: '545W Silver Anodized Frame',
      ratedCapacityWatts: 545,
      systemVoltage: 1500,
      costPrice: 9800,
      sellingPrice: 12500,
      currency: 'INR',
      isDefault: true,
    });
    variantId = variant.id;

    expect(variant.sku).toBe('SKU-LR5-545-SILVER');
    expect(Number(variant.sellingPrice)).toBe(12500);

    // Verify initial price history record
    const history = await catalogService.getPriceHistory(tenantOrg, variant.id);
    expect(history.length).toBe(1);
    expect(Number(history[0].sellingPrice)).toBe(12500);
    expect(history[0].effectiveTo).toBeNull();
  });

  it('3. should update variant price, close previous price interval, and record audit reason', async () => {
    // Update price due to market adjustment
    const updated = await catalogService.updateVariantPrice(tenantOrg, variantId, {
      costPrice: 9400,
      sellingPrice: 11900,
      reason: 'Quarterly price reduction - bulk procurement discount',
    });

    expect(Number(updated.sellingPrice)).toBe(11900);
    expect(Number(updated.costPrice)).toBe(9400);

    // Verify price history now has 2 entries (previous closed, current active)
    const history = await catalogService.getPriceHistory(tenantOrg, variantId);
    expect(history.length).toBe(2);

    // Entry 0 (current active)
    expect(Number(history[0].sellingPrice)).toBe(11900);
    expect(history[0].effectiveTo).toBeNull();
    expect(history[0].reason).toContain('bulk procurement discount');

    // Entry 1 (previous closed)
    expect(Number(history[1].sellingPrice)).toBe(12500);
    expect(history[1].effectiveTo).not.toBeNull();
  });

  it('4. should define technical attributes and assign values to product', async () => {
    // 1. Create attribute definition (e.g. Max Power Voltage Vmp)
    const vmpDef = await catalogService.createAttributeDefinition(tenantOrg, {
      categoryId,
      name: 'Voltage at Maximum Power (Vmp)',
      code: 'VMP',
      dataType: 'NUMBER',
      unit: 'Volts',
      isRequired: true,
    });
    expect(vmpDef.code).toBe('VMP');

    // 2. Set attribute values on product
    await catalogService.setProductAttributes(tenantOrg, productId, {
      attributes: [
        {
          attributeDefinitionId: vmpDef.id,
          valueNumber: 41.8,
        },
      ],
    });

    // 3. Verify product contains technical attribute
    const product = await catalogService.getProductById(tenantOrg, productId);
    expect(product.attributeValues.length).toBe(1);
    expect(Number(product.attributeValues[0].valueNumber)).toBe(41.8);
    expect(product.attributeValues[0].attributeDefinition.code).toBe('VMP');
  });
});
