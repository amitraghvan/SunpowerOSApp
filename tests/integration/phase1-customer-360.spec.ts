import { CustomersService } from '../../apps/api/src/modules/customers/customers.service';
import { PrismaService } from '../../apps/api/src/database/prisma.service';

describe('Phase 1 — Customer Management & Customer 360 Integration Suite', () => {
  let prisma: PrismaService;
  let customersService: CustomersService;

  const tenantOrg = {
    organizationId: '44444444-4444-4444-8444-444444444444',
    organizationSlug: 'cust-test-org',
    organizationName: 'Customer Test Organization',
    userId: 'user-cust-1',
    userEmail: 'admin@custtest.com',
    roles: ['ORG_ADMIN'],
    permissions: [],
  };

  beforeAll(async () => {
    prisma = new PrismaService({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public',
        },
      },
    });
    await prisma.$connect();
    customersService = new CustomersService(prisma);

    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);

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
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);
    });
    await prisma.$disconnect();
  });

  it('1. should create a customer and manage contacts with primary contact rule', async () => {
    const customer = await customersService.createCustomer(tenantOrg, {
      name: 'Sterling Solar Farms Ltd',
      customerType: 'COMMERCIAL',
      phone: '9812345678',
      email: 'operations@sterlingsolar.com',
      taxId: '07AAACS1234F1Z5',
    });

    expect(customer.id).toBeDefined();
    expect(customer.customerNumber).toMatch(/^CUST-\d{8}-\d{4}$/);

    // Add first contact as Primary
    const contact1 = await customersService.addContact(tenantOrg, customer.id, {
      name: 'Vikas Aggarwal',
      designation: 'Managing Director',
      phone: '9812345678',
      email: 'vikas@sterlingsolar.com',
      isPrimary: true,
    });
    expect(contact1.isPrimary).toBe(true);

    // Add second contact also marked as Primary -> Contact1 primary should flip to false
    const contact2 = await customersService.addContact(tenantOrg, customer.id, {
      name: 'Rohit Bansal',
      designation: 'Plant Engineer',
      phone: '9812345679',
      isPrimary: true,
    });
    expect(contact2.isPrimary).toBe(true);

    // Check contact1
    const refreshedContact1 = await prisma.forTenant(tenantOrg.organizationId, (tx) =>
      tx.customerContact.findUnique({
        where: { id: contact1.id },
      })
    );
    expect(refreshedContact1?.isPrimary).toBe(false);
  });

  it('2. should register sites and addresses and aggregate into Customer 360 view', async () => {
    const customer = await customersService.createCustomer(tenantOrg, {
      name: 'Mehra Residency',
      customerType: 'INDIVIDUAL',
      phone: '9899001122',
    });

    // Add address
    await customersService.addAddress(tenantOrg, customer.id, {
      type: 'BILLING',
      addressLine1: 'B-12 Greater Kailash 1',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110048',
      isPrimary: true,
    });

    // Add rooftop site
    const site = await customersService.addSite(tenantOrg, customer.id, {
      siteName: 'GK1 Rooftop',
      addressLine1: 'B-12 Greater Kailash 1',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110048',
      roofType: 'RCC_FLAT',
      roofAreaSqFt: 1200,
      sanctionedLoadKw: 10,
      electricityConnectionNumber: 'BSES-GK-9921',
      discomName: 'BSES Rajdhani',
    });
    expect(site.id).toBeDefined();
    expect(site.sanctionedLoadKw).toBeDefined();

    // Fetch Customer 360
    const c360 = await customersService.getCustomer360(tenantOrg, customer.id);
    expect(c360.id).toBe(customer.id);
    expect(c360.sites.length).toBe(1);
    expect(c360.addresses.length).toBe(1);
    expect(c360.activityTimeline).toBeDefined();
    expect(c360.activityTimeline.length).toBeGreaterThan(0);
    expect(c360.activityTimeline[0].timestamp).toBeDefined();
  });
});
