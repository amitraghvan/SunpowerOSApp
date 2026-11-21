import { PrismaClient } from '@prisma/client';

describe('PostgreSQL Row-Level Security (RLS) & Tenant Isolation', () => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public',
      },
    },
  });

  const orgAId = '11111111-1111-4111-8111-111111111111';
  const orgBId = '22222222-2222-4222-8222-222222222222';
  const branchAId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

  beforeAll(async () => {
    // Clean up any previous test artifacts
    await prisma.$executeRawUnsafe(`DELETE FROM "organization_branches" WHERE "id" = '${branchAId}'`);
    await prisma.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" IN ('${orgAId}', '${orgBId}')`);

    // Create Tenant Organizations
    await prisma.organization.createMany({
      data: [
        { id: orgAId, slug: 'tenant-rls-a', name: 'Tenant RLS Org A' },
        { id: orgBId, slug: 'tenant-rls-b', name: 'Tenant RLS Org B' },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe(`DELETE FROM "organization_branches" WHERE "id" = '${branchAId}'`);
    await prisma.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" IN ('${orgAId}', '${orgBId}')`);
    await prisma.$disconnect();
  });

  it('should isolate read access between tenants via PostgreSQL RLS policies', async () => {
    // 1. Insert Branch A under Org A with Org A transaction context
    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_organization_id = '${orgAId}'`);
      await tx.organizationBranch.create({
        data: {
          id: branchAId,
          organizationId: orgAId,
          code: 'BR-RLS-A',
          name: 'Branch A Under Org A',
          city: 'Jaipur',
          state: 'RJ',
        },
      });
    });

    // 2. Query as Org A -> Must return the branch
    const orgAResult = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_organization_id = '${orgAId}'`);
      return tx.organizationBranch.findUnique({
        where: { id: branchAId },
      });
    });

    expect(orgAResult).not.toBeNull();
    expect(orgAResult?.id).toBe(branchAId);
    expect(orgAResult?.organizationId).toBe(orgAId);

    // 3. Query as Org B -> Must be filtered out by PostgreSQL RLS (returns null)
    const orgBResult = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_organization_id = '${orgBId}'`);
      return tx.organizationBranch.findUnique({
        where: { id: branchAId },
      });
    });

    expect(orgBResult).toBeNull();
  });

  it('should reject cross-tenant insert violations at the database engine level', async () => {
    // Org B context attempting to insert a record belonging to Org A
    await expect(
      prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET LOCAL app.current_organization_id = '${orgBId}'`);
        await tx.$executeRawUnsafe(`
          INSERT INTO "organization_branches" ("id", "organizationId", "code", "name", "city", "state", "updatedAt")
          VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '${orgAId}', 'ILLEGAL-A', 'Illegal Branch', 'Delhi', 'DL', NOW())
        `);
      })
    ).rejects.toThrow();
  });
});
