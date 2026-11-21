import { PrismaClient } from '@prisma/client';

describe('Phase 1 — Row-Level Security (RLS) Tenant Isolation Across Core Commercial Tables', () => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public',
      },
    },
  });

  const orgAId = '77777777-7777-4777-8777-777777777777';
  const orgBId = '88888888-8888-4888-8888-888888888888';

  const leadAId = 'aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa';
  const customerAId = 'aaaaaaaa-2222-4aaa-8aaa-aaaaaaaaaaaa';
  const siteAId = 'aaaaaaaa-3333-4aaa-8aaa-aaaaaaaaaaaa';
  const surveyAId = 'aaaaaaaa-4444-4aaa-8aaa-aaaaaaaaaaaa';
  const catAId = 'aaaaaaaa-5555-4aaa-8aaa-aaaaaaaaaaaa';
  const manAId = 'aaaaaaaa-6666-4aaa-8aaa-aaaaaaaaaaaa';
  const prodAId = 'aaaaaaaa-7777-4aaa-8aaa-aaaaaaaaaaaa';

  beforeAll(async () => {
    // Clean up
    await prisma.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "leads" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" IN ('${orgAId}', '${orgBId}')`);

    // Create Tenant Organizations
    await prisma.organization.createMany({
      data: [
        { id: orgAId, slug: 'phase1-rls-org-a', name: 'Phase 1 RLS Org A' },
        { id: orgBId, slug: 'phase1-rls-org-b', name: 'Phase 1 RLS Org B' },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "products" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "product_categories" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "manufacturers" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "leads" WHERE "organizationId" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$disconnect();
  });

  it('1. should insert records under Tenant A context', async () => {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_organization_id = '${orgAId}'`);

      // 1. Lead under Org A
      await tx.lead.create({
        data: {
          id: leadAId,
          organizationId: orgAId,
          leadNumber: 'LEAD-RLS-001',
          firstName: 'Anil',
          lastName: 'Kapoor',
          phone: '9800099901',
          city: 'Mumbai',
          state: 'MH',
          source: 'WEBSITE',
        },
      });

      // 2. Customer & Site under Org A
      await tx.customer.create({
        data: {
          id: customerAId,
          organizationId: orgAId,
          customerNumber: 'CUST-RLS-001',
          name: 'Anil Kapoor Household',
          phone: '9800099901',
        },
      });

      await tx.customerSite.create({
        data: {
          id: siteAId,
          organizationId: orgAId,
          customerId: customerAId,
          siteName: 'Juhu Villa Rooftop',
          addressLine1: 'Plot 10 Juhu',
          city: 'Mumbai',
          state: 'MH',
          postalCode: '400049',
        },
      });

      // 3. Survey under Org A
      await tx.survey.create({
        data: {
          id: surveyAId,
          organizationId: orgAId,
          surveyNumber: 'SURV-RLS-001',
          customerId: customerAId,
          siteId: siteAId,
          status: 'REQUESTED',
        },
      });

      // 4. Catalog under Org A
      await tx.productCategory.create({
        data: {
          id: catAId,
          organizationId: orgAId,
          code: 'CAT-RLS-001',
          name: 'RLS Category',
        },
      });

      await tx.manufacturer.create({
        data: {
          id: manAId,
          organizationId: orgAId,
          code: 'MAN-RLS-001',
          name: 'RLS Manufacturer',
        },
      });

      await tx.product.create({
        data: {
          id: prodAId,
          organizationId: orgAId,
          categoryId: catAId,
          manufacturerId: manAId,
          code: 'PROD-RLS-001',
          name: 'RLS Solar Panel',
          modelNumber: 'RLS-MOD-1',
          type: 'PANEL',
        },
      });
    });
  });

  it('2. should verify Tenant A can read all its records', async () => {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_organization_id = '${orgAId}'`);

      const lead = await tx.lead.findUnique({ where: { id: leadAId } });
      const customer = await tx.customer.findUnique({ where: { id: customerAId } });
      const survey = await tx.survey.findUnique({ where: { id: surveyAId } });
      const product = await tx.product.findUnique({ where: { id: prodAId } });

      expect(lead).not.toBeNull();
      expect(customer).not.toBeNull();
      expect(survey).not.toBeNull();
      expect(product).not.toBeNull();
    });
  });

  it('3. should enforce strict RLS isolation: Tenant B CANNOT read any of Tenant A records', async () => {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_organization_id = '${orgBId}'`);

      const lead = await tx.lead.findUnique({ where: { id: leadAId } });
      const customer = await tx.customer.findUnique({ where: { id: customerAId } });
      const survey = await tx.survey.findUnique({ where: { id: surveyAId } });
      const product = await tx.product.findUnique({ where: { id: prodAId } });

      // All must be null due to RLS policy filtering at the PostgreSQL engine level
      expect(lead).toBeNull();
      expect(customer).toBeNull();
      expect(survey).toBeNull();
      expect(product).toBeNull();
    });
  });

  it('4. should reject Tenant B cross-tenant insertion violations at the database level', async () => {
    // Org B context attempting to insert a Lead with organizationId = Org A
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL app.current_organization_id = '${orgBId}'`);
        await tx.$executeRawUnsafe(`
          INSERT INTO "leads" ("id", "organizationId", "leadNumber", "firstName", "lastName", "phone", "city", "state", "updatedAt")
          VALUES ('ffffffff-ffff-4fff-8fff-ffffffffffff', '${orgAId}', 'LEAD-ILLEGAL', 'Hacker', 'Attempt', '9999999999', 'Delhi', 'DL', NOW())
        `);
      })
    ).rejects.toThrow();
  });

  it('5. should allow Super Admin bypass to read across tenants for system maintenance', async () => {
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.is_super_admin = 'true'`);

      const lead = await tx.lead.findUnique({ where: { id: leadAId } });
      const customer = await tx.customer.findUnique({ where: { id: customerAId } });

      expect(lead).not.toBeNull();
      expect(customer).not.toBeNull();
    });
  });
});
