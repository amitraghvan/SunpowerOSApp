import { LeadsService } from '../../apps/api/src/modules/crm/leads.service';
import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { LeadStatus } from '@solaros/types';

describe('Phase 1 — CRM & Lead Lifecycle Integration Suite', () => {
  let prisma: PrismaService;
  let leadsService: LeadsService;

  const tenantOrg = {
    organizationId: '33333333-3333-4333-8333-333333333333',
    organizationSlug: 'crm-test-org',
    organizationName: 'CRM Test Organization',
    userId: '11111111-aaaa-4aaa-aaaa-111111111111',
    userEmail: 'agent@crmtest.com',
    roles: ['SALES_REP'],
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
    leadsService = new LeadsService(prisma);

    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "leads" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);

      await tx.user.create({
        data: {
          id: tenantOrg.userId,
          email: tenantOrg.userEmail,
          firstName: 'CRM',
          lastName: 'Agent',
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
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "leads" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);
    });
    await prisma.$disconnect();
  });

  it('1. should create a lead with auto-generated lead number, qualification score, and initial history', async () => {
    const lead = await leadsService.createLead(tenantOrg, {
      firstName: 'Rajesh',
      lastName: 'Sharma',
      phone: '9876543210',
      email: 'rajesh.sharma@example.com',
      city: 'Gurugram',
      state: 'Haryana',
      source: 'WEBSITE',
      systemType: 'ON_GRID',
      estimatedMonthlyBill: 6000,
      estimatedRoofAreaSqFt: 800,
      estimatedCapacityKw: 5,
    });

    expect(lead).toBeDefined();
    expect(lead.id).toBeDefined();
    expect(lead.leadNumber).toMatch(/^LEAD-\d{8}-\d{4}$/);
    expect(lead.status).toBe(LeadStatus.NEW);
    expect(lead.score).toBeGreaterThan(60);

    // Verify status history
    const history = await prisma.forTenant(tenantOrg.organizationId, (tx) =>
      tx.leadStatusHistory.findMany({ where: { leadId: lead.id } })
    );
    expect(history.length).toBe(1);
    expect(history[0].toStatus).toBe(LeadStatus.NEW);

    // Verify activity
    const activities = await prisma.forTenant(tenantOrg.organizationId, (tx) =>
      tx.leadActivity.findMany({ where: { leadId: lead.id } })
    );
    expect(activities.length).toBe(1);
    expect(activities[0].type).toBe('NOTE');
  });

  it('2. should detect potential duplicate leads by phone and email within same tenant', async () => {
    const dupCheckPhone = await leadsService.checkDuplicate(tenantOrg, '9876543210');
    expect(dupCheckPhone.isDuplicate).toBe(true);
    expect(dupCheckPhone.matchingField).toBe('phone');

    const dupCheckEmail = await leadsService.checkDuplicate(tenantOrg, '9999999999', 'rajesh.sharma@example.com');
    expect(dupCheckEmail.isDuplicate).toBe(true);
    expect(dupCheckEmail.matchingField).toBe('email');

    const noDupCheck = await leadsService.checkDuplicate(tenantOrg, '9111111111', 'unique@example.com');
    expect(noDupCheck.isDuplicate).toBe(false);
  });

  it('3. should enforce valid state machine transitions and reject invalid leaps', async () => {
    const lead = await leadsService.createLead(tenantOrg, {
      firstName: 'Amit',
      lastName: 'Patel',
      phone: '9811122233',
      city: 'Ahmedabad',
      state: 'Gujarat',
    });

    // Invalid transition: NEW -> WON directly
    await expect(
      leadsService.changeLeadStatus(tenantOrg, lead.id, { status: LeadStatus.WON })
    ).rejects.toThrow();

    // Valid transition: NEW -> CONTACTED
    const contacted = await leadsService.changeLeadStatus(tenantOrg, lead.id, {
      status: LeadStatus.CONTACTED,
      reason: 'Spoke over phone, interested in 3kW on-grid',
    });
    expect(contacted.status).toBe(LeadStatus.CONTACTED);

    // Valid transition: CONTACTED -> QUALIFIED
    const qualified = await leadsService.changeLeadStatus(tenantOrg, lead.id, {
      status: LeadStatus.QUALIFIED,
      reason: 'Rooftop shadow free and verified',
    });
    expect(qualified.status).toBe(LeadStatus.QUALIFIED);

    // Verify history accumulation
    const history = await prisma.forTenant(tenantOrg.organizationId, (tx) =>
      tx.leadStatusHistory.findMany({
        where: { leadId: lead.id },
        orderBy: { createdAt: 'asc' },
      })
    );
    expect(history.length).toBe(3); // INITIAL->NEW, NEW->CONTACTED, CONTACTED->QUALIFIED
  });

  it('4. should atomically convert a lead into a Customer with Contact, Address and Site', async () => {
    const lead = await leadsService.createLead(tenantOrg, {
      firstName: 'Sunita',
      lastName: 'Verma',
      phone: '9822233344',
      email: 'sunita.verma@example.com',
      address: 'Plot 42, Sector 14',
      city: 'Chandigarh',
      state: 'Punjab',
      postalCode: '160014',
      estimatedCapacityKw: 4,
      estimatedRoofAreaSqFt: 600,
    });

    const conversionResult = await leadsService.convertLead(tenantOrg, lead.id, {
      customerType: 'INDIVIDUAL',
      siteName: 'Sunita Verma Residence',
      sanctionedLoadKw: 5,
      electricityConnectionNumber: 'CH-ELE-9821',
    });

    expect(conversionResult.success).toBe(true);
    expect(conversionResult.customerNumber).toMatch(/^CUST-\d{8}-\d{4}$/);

    // Verify Customer record
    const customer = await prisma.forTenant(tenantOrg.organizationId, (tx) =>
      tx.customer.findUnique({
        where: { id: conversionResult.customerId },
        include: { contacts: true, addresses: true, sites: true },
      })
    );
    expect(customer).not.toBeNull();
    expect(customer?.name).toBe('Sunita Verma');
    expect(customer?.contacts.length).toBe(1);
    expect(customer?.contacts[0].isPrimary).toBe(true);
    expect(customer?.addresses.length).toBe(1);
    expect(customer?.sites.length).toBe(1);
    expect(customer?.sites[0].electricityConnectionNumber).toBe('CH-ELE-9821');

    // Verify Lead is marked WON and linked
    const updatedLead = await leadsService.getLeadById(tenantOrg, lead.id);
    expect(updatedLead.status).toBe(LeadStatus.WON);
    expect(updatedLead.convertedCustomerId).toBe(conversionResult.customerId);
  });
});
