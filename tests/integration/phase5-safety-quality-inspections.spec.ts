import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { SafetyQualityService } from '../../apps/api/src/modules/installation/safety-quality.service';

describe('Phase 5 — Safety Management, Stop-Work Controls & Quality Inspection Stage-Gates', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let safetyQualityService: SafetyQualityService;

  const tenantOrg = {
    organizationId: '85858585-8585-4585-8585-858585858585',
    organizationSlug: 'phase5-safety-org',
    organizationName: 'Phase 5 Safety Org',
    supervisorUserId: '95858585-8585-4585-8585-858585858585',
    inspectorUserId: '95858585-8585-4585-8585-858585858586',
  };

  let testProjectId: string;
  let testSafetyRecordId: string;
  let testInspectionId: string;

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
    safetyQualityService = new SafetyQualityService(prisma, numberingService);

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up previous test artifacts
      await tx.$executeRawUnsafe(`DELETE FROM "quality_inspection_items" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "installation_quality_inspections" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "safety_incidents" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "safety_observations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "safety_checklist_items" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "installation_safety_records" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "project_initiations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "sales_orders" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "quotations" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "bills_of_materials" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "engineering_designs" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "surveys" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customer_sites" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "customers" WHERE "organizationId" = '${tenantOrg.organizationId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" IN ('${tenantOrg.supervisorUserId}', '${tenantOrg.inspectorUserId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" = '${tenantOrg.organizationId}'`);

      await tx.organization.create({
        data: {
          id: tenantOrg.organizationId,
          slug: tenantOrg.organizationSlug,
          name: tenantOrg.organizationName,
        },
      });

      await tx.user.createMany({
        data: [
          {
            id: tenantOrg.supervisorUserId,
            email: 'safety.lead@solarcrew.com',
            firstName: 'Manoj',
            lastName: 'Tiwari',
          },
          {
            id: tenantOrg.inspectorUserId,
            email: 'qa.inspector@solarcrew.com',
            firstName: 'Pooja',
            lastName: 'Hegde',
          },
        ],
      });

      const customer = await tx.customer.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerNumber: 'CUST-P5-004',
          name: 'Apex Textile Mills',
          phone: '+919876533333',
        },
      });

      const site = await tx.customerSite.create({
        data: {
          organizationId: tenantOrg.organizationId,
          customerId: customer.id,
          siteName: 'Textile Mill Main Shed',
          addressLine1: 'Plot 55, Textile Park',
          city: 'Ichalkaranji',
          state: 'Maharashtra',
          postalCode: '416115',
        },
      });

      const survey = await tx.survey.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          surveyNumber: 'SRV-P5-004',
          status: 'APPROVED',
        },
      });

      const design = await tx.engineeringDesign.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          customer: { connect: { id: customer.id } },
          site: { connect: { id: site.id } },
          survey: { connect: { id: survey.id } },
          designNumber: 'DES-P5-004',
          title: 'Textile Mill 150kW Design',
          targetCapacityKw: 150.0,
          systemType: 'ON_GRID',
        },
      });

      const bom = await tx.billOfMaterials.create({
        data: {
          organization: { connect: { id: tenantOrg.organizationId } },
          design: { connect: { id: design.id } },
          bomNumber: 'BOM-P5-004',
          revisionNumber: 1,
          totalMaterialCost: 4800000,
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
          quotationNumber: 'QTN-P5-004',
          totalAmount: 6200000,
          grandTotal: 6200000,
          validUntil: new Date(Date.now() + 30 * 86400000),
          scopeOfWork: 'Textile Mill 150kW Turnkey Installation',
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
          orderNumber: 'SO-P5-004',
          totalAmount: 6200000,
          advanceRequired: 1240000,
          advanceReceived: 1240000,
          status: 'CONFIRMED',
        },
      });

      const project = await tx.projectInitiation.create({
        data: {
          organizationId: tenantOrg.organizationId,
          salesOrderId: salesOrder.id,
          projectCode: 'PRJ-P5-004',
          projectName: 'Apex Textile 150kW Solar EPC',
          customerId: customer.id,
          siteId: site.id,
          systemCapacityKw: 150.0,
          systemType: 'ON_GRID',
          bomSnapshot: {},
          designSnapshot: {},
          initiatedById: tenantOrg.supervisorUserId,
          installationStatus: 'INSTALLATION_IN_PROGRESS',
        },
      });
      testProjectId = project.id;
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('1. should create pre-work daily safety record with PPE and standard checklist items', async () => {
    const record = await safetyQualityService.createSafetyRecord(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        toolboxTalkConducted: true,
        toolboxTopic: 'Rooftop Working at Heights & Anchor Lines',
        ppeComplianceVerified: true,
        fallProtectionVerified: true,
        electricalIsolationVerified: true,
        weatherSafeForWork: true,
      },
      tenantOrg.supervisorUserId,
    );

    expect(record).toBeDefined();
    expect(record.safetyNumber).toMatch(/^SAF-\d{4}-\d{6}$/);
    expect(record.status).toBe('CLEARED');
    expect(record.checklistItems.length).toBeGreaterThanOrEqual(6);

    testSafetyRecordId = record.id;
  });

  it('2. should add safety observation for unsafe condition / near miss', async () => {
    const observation = await safetyQualityService.addObservation(
      tenantOrg.organizationId,
      testSafetyRecordId,
      {
        observationType: 'UNSAFE_CONDITION',
        severity: 'HIGH',
        description: 'Lifeline static wire anchor point loose on eastern parapet',
        correctiveAction: 'Re-anchor to structural column with certified M12 expansion bolts',
      },
      tenantOrg.supervisorUserId,
    );

    expect(observation).toBeDefined();
    expect(observation.severity).toBe('HIGH');
    expect(observation.isResolved).toBe(false);
  });

  it('3. should issue stop-work order and place project ON_HOLD', async () => {
    const stopped = await safetyQualityService.issueStopWork(
      tenantOrg.organizationId,
      testSafetyRecordId,
      {
        stopWorkReason: 'High wind gusts exceeding 40 km/h with loose rooftop anchor line',
      },
      tenantOrg.supervisorUserId,
    );

    expect(stopped).toBeDefined();
    expect(stopped.status).toBe('STOP_WORK');
    expect(stopped.stopWorkIssued).toBe(true);

    // Verify project installationStatus transitioned to ON_HOLD
    const projectOnHold = await prisma.asSuperAdmin(async (tx) =>
      tx.projectInitiation.findUnique({
        where: { id: testProjectId },
      }),
    );
    expect(projectOnHold?.installationStatus).toBe('ON_HOLD');
  });

  it('4. should lift stop-work order and restore project to INSTALLATION_IN_PROGRESS', async () => {
    const lifted = await safetyQualityService.liftStopWork(
      tenantOrg.organizationId,
      testSafetyRecordId,
      {
        resolutionNotes: 'Wind subsided below 15 km/h, anchor re-certified by safety lead',
      },
      tenantOrg.supervisorUserId,
    );

    expect(lifted).toBeDefined();
    expect(lifted.status).toBe('RESOLVED');
    expect(lifted.stopWorkLiftedAt).toBeDefined();

    // Verify project execution resumed
    const projectResumed = await prisma.asSuperAdmin(async (tx) =>
      tx.projectInitiation.findUnique({
        where: { id: testProjectId },
      }),
    );
    expect(projectResumed?.installationStatus).toBe('INSTALLATION_IN_PROGRESS');
  });

  it('5. should report safety incident with severity and corrective action', async () => {
    const incident = await safetyQualityService.reportIncident(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        severity: 'FIRST_AID',
        description: 'Minor superficial abrasion on hand while handling module mounting rail',
        immediateActionTaken: 'First-aid applied with antiseptic dressing by on-site first aider',
        preventiveAction: 'Enforce Level 3 cut-resistant gloves during rail handling',
      },
      tenantOrg.supervisorUserId,
    );

    expect(incident).toBeDefined();
    expect(incident.incidentNumber).toMatch(/^INC-\d{4}-\d{6}$/);
    expect(incident.severity).toBe('FIRST_AID');
  });

  it('6. should create quality inspection and enforce REWORK_REQUIRED when mandatory checkpoint fails', async () => {
    const inspection = await safetyQualityService.createQualityInspection(
      tenantOrg.organizationId,
      {
        projectInitiationId: testProjectId,
        stage: 'STRUCTURE_MOUNTING',
        items: [
          {
            checkpointKey: 'ANCHOR_TORQUE',
            checkpointName: 'Anchor Bolt Fastener Torque',
            toleranceCriteria: '40 Nm ± 2 Nm',
            observedValue: '28 Nm (Below torque spec)',
            isMandatory: true,
            result: 'FAIL',
            deviationNotes: 'Fasteners under-torqued on Table 3',
          },
          {
            checkpointKey: 'TILT_ANGLE',
            checkpointName: 'Structure Tilt Angle Verification',
            toleranceCriteria: '15° ± 1°',
            observedValue: '15.2°',
            isMandatory: true,
            result: 'PASS',
          },
        ],
      },
      tenantOrg.inspectorUserId,
    );

    expect(inspection).toBeDefined();
    expect(inspection.inspectionNumber).toMatch(/^IQI-\d{4}-\d{6}$/);
    expect(inspection.stage).toBe('STRUCTURE_MOUNTING');
    expect(inspection.overallResult).toBe('REWORK_REQUIRED');

    testInspectionId = inspection.id;
  });

  it('7. should resolve rework requirement and flip overallResult to PASS', async () => {
    const resolved = await safetyQualityService.resolveRework(
      tenantOrg.organizationId,
      testInspectionId,
      {
        reworkNotes: 'All M10 anchor bolts retorqued with calibrated torque wrench to 41 Nm',
      },
      tenantOrg.inspectorUserId,
    );

    expect(resolved).toBeDefined();
    expect(resolved.overallResult).toBe('PASS');
    expect(resolved.reworkCompletedAt).toBeDefined();
    expect(resolved.items.every((i) => i.result === 'PASS')).toBe(true);
  });
});
