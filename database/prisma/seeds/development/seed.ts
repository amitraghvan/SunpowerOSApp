import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * SolarOS Phase 0 Foundation Seed
 * Seeds essential system roles and core permissions.
 * DOES NOT create fake business records, invented CRM leads, or dummy inventory.
 */
async function main() {
  console.log('Seeding foundational roles and permissions...');

  const corePermissions = [
    { code: 'org:read', name: 'Read Organization Profile', category: 'ORGANIZATION' },
    { code: 'org:update', name: 'Update Organization Settings', category: 'ORGANIZATION' },
    { code: 'users:read', name: 'Read Users & Members', category: 'USER_MANAGEMENT' },
    { code: 'users:invite', name: 'Invite Members', category: 'USER_MANAGEMENT' },
    { code: 'audit:read', name: 'View Audit Logs', category: 'AUDIT' },
    { code: 'crm:read', name: 'Read CRM Leads & Customers', category: 'CRM' },
    { code: 'crm:write', name: 'Manage CRM Leads & Customers', category: 'CRM' },
    { code: 'survey:read', name: 'Read Site Surveys', category: 'FIELD_OPS' },
    { code: 'survey:write', name: 'Conduct Site Surveys', category: 'FIELD_OPS' },
    { code: 'engineering:read', name: 'View Engineering Designs', category: 'ENGINEERING' },
    { code: 'engineering:write', name: 'Create Engineering Designs', category: 'ENGINEERING' },
    { code: 'inventory:read', name: 'View Inventory & Serials', category: 'INVENTORY' },
    { code: 'inventory:write', name: 'Manage Warehouse & Dispatch', category: 'INVENTORY' },
    { code: 'finance:read', name: 'View Invoices & Project Profitability', category: 'FINANCE' },
    { code: 'finance:write', name: 'Create Invoices & Manage Payments', category: 'FINANCE' },
  ];

  for (const perm of corePermissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, category: perm.category },
      create: perm,
    });
  }

  const systemRoles = [
    {
      code: 'SUPER_ADMIN',
      name: 'Super Administrator',
      description: 'Platform operator with global root privileges',
      isSystem: true,
    },
    {
      code: 'ORG_ADMIN',
      name: 'Organization Administrator',
      description: 'Full administrative access within the tenant organization',
      isSystem: true,
    },
    {
      code: 'PROJECT_MANAGER',
      name: 'Solar Project Manager',
      description: 'Coordinates end-to-end solar EPC project execution',
      isSystem: true,
    },
    {
      code: 'SOLAR_ENGINEER',
      name: 'Solar Design Engineer',
      description: 'Designs PV arrays, SLDs, and generates BOMs',
      isSystem: true,
    },
    {
      code: 'TECHNICIAN',
      name: 'Field Technician',
      description: 'Performs on-site surveys, installations, and commissioning',
      isSystem: true,
    },
  ];

  for (const role of systemRoles) {
    const existing = await prisma.role.findFirst({
      where: { code: role.code, organizationId: null },
    });

    if (existing) {
      await prisma.role.update({
        where: { id: existing.id },
        data: { name: role.name, description: role.description },
      });
    } else {
      await prisma.role.create({
        data: role,
      });
    }
  }

  console.log('Foundation seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Foundation seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
