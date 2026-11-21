import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { TechnicianCrewService } from '../../apps/api/src/modules/installation/technician-crew.service';
import { InstallationSchedulingService } from '../../apps/api/src/modules/installation/installation-scheduling.service';
import { ProjectExecutionService } from '../../apps/api/src/modules/installation/project-execution.service';

describe('Phase 5 — Technician & Crew Management and Installation Scheduling', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let technicianCrewService: TechnicianCrewService;
  let schedulingService: InstallationSchedulingService;
  let projectExecutionService: ProjectExecutionService;

  const tenantOrg = {
    organizationId: '81818181-8181-4181-8181-818181818181',
    organizationSlug: 'phase5-crew-org',
    organizationName: 'Phase 5 Crew Org',
    supervisorUserId: '91818181-8181-4181-8181-818181818181',
    techUserId1: '91818181-8181-4181-8181-818181818182',
    techUserId2: '91818181-8181-4181-8181-818181818183',
    otherOrgId: '82828282-8282-4282-8282-828282828282',
  };

  let testProjectId: string;
  let techProfile1: any;
  let techProfile2: any;
  let crew: any;

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
    technicianCrewService = new TechnicianCrewService(prisma, numberingService);
    schedulingService = new InstallationSchedulingService(prisma, numberingService);
    projectExecutionService = new ProjectExecutionService(prisma);

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up test data
      await tx.$executeRawUnsafe(`DELETE FROM "installation_schedules" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "crew_members" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "installation_crews" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "technician_skills" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "technician_certifications" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "technician_profiles" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_initiations" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_orders" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotations" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "bills_of_materials" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" IN ('${tenantOrg.supervisorUserId}', '${tenantOrg.techUserId1}', '${tenantOrg.techUserId2}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" IN ('${tenantOrg.organizationId}', '${tenantOrg.otherOrgId}')`);

      await tx.organization.create({
        data: {
          id: tenantOrg.organizationId,
          slug: tenantOrg.organizationSlug,
          name: tenantOrg.organizationName,
        },
      });

      await tx.organization.create({
        data: {
          id: tenantOrg.otherOrgId,
          slug: 'phase5-other-crew-org',
          name: 'Other Org',
        },
      });

      await tx.user.createMany({
        data: [
          {
            id: tenantOrg.supervisorUserId,
            email: 'supervisor@solarcrew.com',
            firstName: 'Rajesh',
            lastName: 'Sharma',
            phone: '+919876543210',
          },
          {
            id: tenantOrg.techUserId1,
            email: 'tech1@solarcrew.com',
            firstName: 'Vikram',
            lastName: 'Singh',
            phone: '+919876543211',
          },
          {
            id: tenantOrg.techUserId2,
            email: 'tech2@solarcrew.com',
            firstName: 'Amit',
            lastName: 'Patel',
            phone: '+919876543212',
          },
        ],
      });

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-P5-001',
          name: 'Apex Manufacturing Ltd',
          phone: '+919876500000',
        },
      });

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Apex Rooftop Plant 1',
          addressLine1: 'Plot 42, Industrial Area',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411018',
        },
      });

      const survey = await tx.survey.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          surveyNumber: 'SRV-P5-001',
          status: 'APPROVED',
        },
      });

      const design = await tx.engineeringDesign.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          survey: { connect: { id: survey.id } },
          designNumber: 'DES-P5-001',
          title: 'Apex 25kW Design',
          targetCapacityKw: 25.0,
          systemType: 'ON_GRID',
        },
      });

      const bom = await tx.billOfMaterials.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          design: { connect: { id: design.id } },
          bomNumber: 'BOM-P5-001',
          revisionNumber: 1,
          totalMaterialCost: 950000,
          status: 'APPROVED',
        },
      });

      const quote = await tx.quotation.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          design: { connect: { id: design.id } },
          bom: { connect: { id: bom.id } },
          quotationNumber: 'QTN-P5-001',
          totalAmount: 1250000,
          grandTotal: 1250000,
          validUntil: new Date(Date.now() + 30 * 86400000),
          scopeOfWork: 'Apex 25kW Turnkey Installation',
          paymentTerms: { advance: 20 },
          status: 'ACCEPTED',
        },
      });

      const salesOrder = await tx.salesOrder.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          quotation: { connect: { id: quote.id } },
          design: { connect: { id: design.id } },
          bom: { connect: { id: bom.id } },
          orderNumber: 'SO-P5-001',
          totalAmount: 1250000,
          advanceRequired: 250000,
          advanceReceived: 250000,
          status: 'CONFIRMED',
        },
      });

      const project = await tx.projectInitiation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          salesOrderId: salesOrder.id,
          projectCode: 'PRJ-P5-001',
          projectName: 'Apex 25kW Solar Project',
          customerId: customer.id,
          siteId: site.id,
          systemCapacityKw: 25.0,
          systemType: 'ON_GRID',
          bomSnapshot: {},
          designSnapshot: {},
          initiatedById: tenantOrg.supervisorUserId,
        },
      });
      testProjectId = project.id;
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. should register technician profiles with skills and certifications', async () => {
    techProfile1 = await technicianCrewService.createTechnicianProfile(tenantOrg.organizationId, {
      userId: tenantOrg.techUserId1,
      technicianType: 'ELECTRICAL_TECHNICIAN',
      bloodGroup: 'O+',
      yearsOfExperience: 5.5,
      specializations: ['DC_CABLING', 'INVERTER_WIRING'],
      safetyInductionDate: new Date('2026-01-10'),
    });

    expect(techProfile1.id).toBeDefined();
    expect(techProfile1.technicianCode).toMatch(/^TECH-/);
    expect(techProfile1.technicianType).toBe('ELECTRICAL_TECHNICIAN');
    expect(techProfile1.availabilityStatus).toBe('AVAILABLE');

    techProfile2 = await technicianCrewService.createTechnicianProfile(tenantOrg.organizationId, {
      userId: tenantOrg.techUserId2,
      technicianType: 'INSTALLATION_TECHNICIAN',
      bloodGroup: 'B+',
      yearsOfExperience: 3.0,
      specializations: ['MOUNTING_STRUCTURE', 'TORQUE_FIXING'],
    });

    expect(techProfile2.id).toBeDefined();

    // Add verified skill
    const skill = await technicianCrewService.addSkill(
      tenantOrg.organizationId,
      techProfile1.id,
      { skillName: 'Solar PV Inverter Commissioning', proficiencyLevel: 'EXPERT' },
      tenantOrg.supervisorUserId,
    );
    expect(skill.skillName).toBe('Solar PV Inverter Commissioning');
    expect(skill.verifiedByUserId).toBe(tenantOrg.supervisorUserId);

    // Add certification with validity
    const cert = await technicianCrewService.addCertification(
      tenantOrg.organizationId,
      techProfile1.id,
      {
        certificateName: 'Govt Certified Solar Rooftop Grid Installer',
        issuingAuthority: 'Skill Council for Green Jobs (SCGJ)',
        certificateNumber: 'SCGJ-2026-9921',
        expiryDate: new Date('2028-12-31'),
      },
      tenantOrg.supervisorUserId,
    );
    expect(cert.isVerified).toBe(true);
    expect(cert.certificateNumber).toBe('SCGJ-2026-9921');
  });

  it('2. should assemble an installation crew and add members', async () => {
    crew = await technicianCrewService.createCrew(tenantOrg.organizationId, {
      crewName: 'Pune Alpha Solar Crew',
      crewLeaderId: tenantOrg.supervisorUserId,
      maxConcurrentProjects: 2,
      serviceAreas: ['Pune', 'PCMC', 'Chakan'],
      memberProfileIds: [techProfile1.id],
    });

    expect(crew.id).toBeDefined();
    expect(crew.crewCode).toMatch(/^CRW-/);
    expect(crew.crewName).toBe('Pune Alpha Solar Crew');

    // Add second technician
    const member2 = await technicianCrewService.addCrewMember(tenantOrg.organizationId, crew.id, {
      technicianProfileId: techProfile2.id,
      roleInCrew: 'MECHANICAL_LEAD',
    });
    expect(member2.roleInCrew).toBe('MECHANICAL_LEAD');

    const fetchedCrew = await technicianCrewService.getCrew(tenantOrg.organizationId, crew.id);
    expect(fetchedCrew.members.length).toBe(2);
  });

  it('3. should assign crew to project and update project status to CREW_ASSIGNED', async () => {
    const assignedProject = await technicianCrewService.assignCrewToProject(
      tenantOrg.organizationId,
      testProjectId,
      crew.id,
      tenantOrg.supervisorUserId,
    );

    expect(assignedProject.assignedCrewId).toBe(crew.id);
    expect(assignedProject.installationStatus).toBe('CREW_ASSIGNED');
  });

  it('4. should schedule site execution visit and detect crew conflicts', async () => {
    const scheduledDate = new Date('2026-11-25T09:00:00Z');
    const endDate = new Date('2026-11-26T18:00:00Z');

    const schedule = await schedulingService.createSchedule(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        crewId: crew.id,
        visitType: 'MOUNTING_STRUCTURE',
        scheduledDate,
        endDate,
        startTime: '09:00',
        endTime: '18:00',
        notes: 'Mounting structure installation and rooftop purlin anchoring',
      },
      tenantOrg.supervisorUserId,
    );

    expect(schedule.id).toBeDefined();
    expect(schedule.scheduleCode).toMatch(/^SCH-/);
    expect(schedule.status).toBe('SCHEDULED');

    // Conflict detection should return true for overlapping dates on the same crew
    const hasConflict = await schedulingService.checkCrewConflict(
      tenantOrg.organizationId,
      crew.id,
      new Date('2026-11-25T14:00:00Z'),
      new Date('2026-11-27T10:00:00Z'),
    );
    expect(hasConflict).toBe(true);

    // Reschedule with documented reason
    const rescheduled = await schedulingService.rescheduleVisit(
      tenantOrg.organizationId,
      schedule.id,
      {
        scheduledDate: new Date('2026-11-28T09:00:00Z'),
        rescheduleReason: 'Customer requested weekend execution window',
      },
      tenantOrg.supervisorUserId,
    );

    expect(rescheduled.status).toBe('RESCHEDULED');
    expect(rescheduled.rescheduleReason).toBe('Customer requested weekend execution window');
  });

  it('5. should enforce tenant isolation on technicians and crews', async () => {
    const otherCrewList = await technicianCrewService.listCrews(tenantOrg.otherOrgId);
    expect(otherCrewList.length).toBe(0);

    const otherTechList = await technicianCrewService.listTechnicians(tenantOrg.otherOrgId);
    expect(otherTechList.length).toBe(0);
  });
});
