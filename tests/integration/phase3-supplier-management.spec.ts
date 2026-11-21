import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { SuppliersService } from '../../apps/api/src/modules/suppliers/suppliers.service';
import { SupplierCategory, SupplierType, SupplierStatus } from '@solaros/types';

describe('Phase 3 — Supplier Management, Onboarding, Product Mapping & Price History', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let suppliersService: SuppliersService;

  const tenantOrg = {
    organizationId: '60606060-6060-4060-8060-606060606060',
    organizationSlug: 'phase3-supplier-test-org',
    organizationName: 'Phase 3 Supplier Test Org',
    userId: '90606060-6060-4060-8060-606060606060',
  };

  let testSupplierId: string;
  let testVariantId: string;
  let testMappingId: string;

  beforeAll(async () => {
    prisma = new PrismaService({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ||
            'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public',
        },
      },
    });
    await prisma.$connect();

    numberingService = new NumberingService(prisma);
    suppliersService = new SuppliersService(prisma, numberingService);

    // Clean up previous test artifacts
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_price_history" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_product_mappings" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_documents" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_bank_accounts" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_addresses" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_contacts" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "suppliers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_variants" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);

      // Create Tenant & User
      await tx.organization.create({
        data: {
          id: tenantOrg.organizationId,
          slug: tenantOrg.organizationSlug,
          name: tenantOrg.organizationName,
        },
      });

      await tx.user.create({
        data: {
          id: tenantOrg.userId,
          email: 'procurement-tester@solaros.io',
          firstName: 'Procurement',
          lastName: 'Lead',
        },
      });

      // Create Catalog Category, Manufacturer & Product Variant for testing
      const category = await tx.productCategory.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'CAT-PANELS-P3',
          name: 'Solar Panels Phase 3',
        },
      });

      const manufacturer = await tx.manufacturer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          code: 'MFG-WARREE-P3',
          name: 'Waaree Energies Ltd',
        },
      });

      const product = await tx.product.create({
        data: {
          organizationId: tenantOrg.organizationId,
          categoryId: category.id,
          manufacturerId: manufacturer.id,
          code: 'PROD-WAAREE-540',
          name: 'Waaree Bi-Facial 540W Mono PERC',
          modelNumber: 'WSMD-540',
          type: 'PANEL',
        },
      });

      const variant = await tx.productVariant.create({
        data: {
          organizationId: tenantOrg.organizationId,
          productId: product.id,
          sku: 'VAR-WAAREE-540W',
          name: 'Waaree 540W Mono PERC',
          ratedCapacityWatts: 540,
          costPrice: 10800,
          sellingPrice: 13500,
        },
      });
      testVariantId = variant.id;
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_price_history" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_product_mappings" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_documents" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_bank_accounts" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_addresses" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "supplier_contacts" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "suppliers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_variants" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);
    });
    await prisma.$disconnect();
  });

  it('should onboard a new supplier with GSTIN and PAN validation', async () => {
    const supplier = await suppliersService.createSupplier(
      tenantOrg.organizationId,
      {
        legalName: 'Adani Solar Distribution Pvt Ltd',
        tradeName: 'Adani Solar Dist',
        category: SupplierCategory.MANUFACTURER,
        supplierType: SupplierType.SOLAR_PANELS,
        gstin: '24AAACA1234A1Z5',
        pan: 'AAACA1234A',
        msmeNumber: 'UDYAM-GJ-01-0012345',
        paymentTerms: 'NET_30' as any,
        creditPeriodDays: 45,
        creditLimit: 5000000,
        notes: 'Tier 1 PV Module Manufacturer',
      },
      tenantOrg.userId,
    );

    expect(supplier).toBeDefined();
    expect(supplier.id).toBeDefined();
    expect(supplier.supplierCode).toMatch(/^SUP-\d{4}-\d{6}$/);
    expect(supplier.legalName).toBe('Adani Solar Distribution Pvt Ltd');
    expect(supplier.status).toBe(SupplierStatus.ACTIVE);
    testSupplierId = supplier.id;
  });

  it('should reject supplier creation with invalid GSTIN format', async () => {
    await expect(
      suppliersService.createSupplier(
        tenantOrg.organizationId,
        {
          legalName: 'Invalid GSTIN Supplier',
          category: SupplierCategory.DISTRIBUTOR,
          supplierType: SupplierType.INVERTERS,
          gstin: 'INVALID_GSTIN_123',
        },
        tenantOrg.userId,
      ),
    ).rejects.toThrow('Invalid Indian GSTIN format');
  });

  it('should add contacts, address, bank account and documents to supplier', async () => {
    const contact = await suppliersService.addContact(tenantOrg.organizationId, testSupplierId, {
      name: 'Rajesh Sharma',
      designation: 'National Sales Head',
      email: 'rajesh.sharma@adanisolar.com',
      phone: '+919876543210',
      isPrimary: true,
    });
    expect(contact.name).toBe('Rajesh Sharma');
    expect(contact.isPrimary).toBe(true);

    const address = await suppliersService.addAddress(tenantOrg.organizationId, testSupplierId, {
      type: 'REGISTERED',
      addressLine1: 'Mundra SEZ, Village Siracha',
      city: 'Mundra',
      state: 'Gujarat',
      postalCode: '370421',
      country: 'IN',
      isDefault: true,
    });
    expect(address.city).toBe('Mundra');
    expect(address.isDefault).toBe(true);

    const bank = await suppliersService.addBankAccount(tenantOrg.organizationId, testSupplierId, {
      bankName: 'State Bank of India',
      accountNumber: '300123456789',
      ifscCode: 'SBIN0001234',
      branchName: 'Mundra Port Branch',
      accountType: 'CURRENT',
      isPrimary: true,
    });
    expect(bank.ifscCode).toBe('SBIN0001234');
    expect(bank.isPrimary).toBe(true);
  });

  it('should map a product variant to supplier with unit price and MOQ', async () => {
    const mapping = await suppliersService.createProductMapping(
      tenantOrg.organizationId,
      testSupplierId,
      {
        productVariantId: testVariantId,
        supplierPartCode: 'ADANI-540-BIFACIAL',
        leadTimeDays: 14,
        minimumOrderQuantity: 50,
        unitPrice: 10500,
        taxRatePercent: 12,
        isPreferred: true,
      },
      tenantOrg.userId,
    );

    expect(mapping).toBeDefined();
    expect(Number(mapping.unitPrice)).toBe(10500);
    expect(mapping.isPreferred).toBe(true);
    testMappingId = mapping.id;

    // Check that price history was created
    const priceHistories = await suppliersService.getPriceHistory(
      tenantOrg.organizationId,
      testSupplierId,
      testVariantId,
    );
    expect(priceHistories.length).toBeGreaterThanOrEqual(1);
    expect(Number(priceHistories[0].newPrice)).toBe(10500);
    expect(priceHistories[0].reason).toBe('INITIAL_MAPPING');
  });

  it('should update mapping price and record price audit history entry', async () => {
    const updated = await suppliersService.updateProductMapping(
      tenantOrg.organizationId,
      testSupplierId,
      testMappingId,
      {
        unitPrice: 10200,
        priceChangeReason: 'Quarterly volume price discount',
      },
      tenantOrg.userId,
    );

    expect(Number(updated.unitPrice)).toBe(10200);

    const priceHistories = await suppliersService.getPriceHistory(
      tenantOrg.organizationId,
      testSupplierId,
      testVariantId,
    );
    expect(priceHistories.length).toBe(2);
    expect(Number(priceHistories[0].oldPrice)).toBe(10500);
    expect(Number(priceHistories[0].newPrice)).toBe(10200);
    expect(priceHistories[0].reason).toBe('Quarterly volume price discount');
  });

  it('should retrieve complete 360 degree supplier profile', async () => {
    const profile = await suppliersService.getSupplier(tenantOrg.organizationId, testSupplierId);

    expect(profile).toBeDefined();
    expect(profile.contacts.length).toBe(1);
    expect(profile.addresses.length).toBe(1);
    expect(profile.bankAccounts.length).toBe(1);
    expect(profile.productMappings.length).toBe(1);
    expect(profile.productMappings[0].productVariant.sku).toBe('VAR-WAAREE-540W');
  });
});
