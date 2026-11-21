import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { NumberingService } from '../../apps/api/src/common/services/numbering.service';
import { WarehouseService } from '../../apps/api/src/modules/inventory/warehouse.service';
import { WarehouseLocationType } from '@solaros/types';

describe('Phase 4 — Warehouse Management & Storage Locations', () => {
  let prisma: PrismaService;
  let numberingService: NumberingService;
  let warehouseService: WarehouseService;

  const tenantOrg = {
    organizationId: '71717171-7171-4171-8171-717171717171',
    organizationSlug: 'phase4-warehouse-org',
    organizationName: 'Phase 4 Warehouse Org',
    userId: '91717171-7171-4171-8171-717171717171',
  };

  const otherTenantOrg = {
    organizationId: '72727272-7272-4272-8272-727272727272',
    organizationSlug: 'phase4-other-warehouse-org',
    organizationName: 'Phase 4 Other Warehouse Org',
  };

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
    warehouseService = new WarehouseService(prisma, numberingService);

    await prisma.asSuperAdmin(async (tx) => {
      // Clean up test tenants
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${otherTenantOrg.organizationId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "warehouses" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${otherTenantOrg.organizationId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" IN ('${tenantOrg.organizationId}', '${otherTenantOrg.organizationId}')`);

      await tx.organization.create({
        data: {
          id: tenantOrg.organizationId,
          slug: tenantOrg.organizationSlug,
          name: tenantOrg.organizationName,
        },
      });

      await tx.organization.create({
        data: {
          id: otherTenantOrg.organizationId,
          slug: otherTenantOrg.organizationSlug,
          name: otherTenantOrg.organizationName,
        },
      });

      await tx.user.create({
        data: {
          id: tenantOrg.userId,
          email: 'warehouse-manager@solaros.io',
          firstName: 'Warehouse',
          lastName: 'Manager',
        },
      });
    });
  });

  afterAll(async () => {
    await prisma.asSuperAdmin(async (tx) => {
      await tx.$executeRawUnsafe(`DELETE FROM "inventory_locations" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${otherTenantOrg.organizationId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "warehouses" WHERE "organizationId" IN ('${tenantOrg.organizationId}', '${otherTenantOrg.organizationId}')`);
      await tx.$executeRawUnsafe(`DELETE FROM "users" WHERE "id" = '${tenantOrg.userId}'`);
      await tx.$executeRawUnsafe(`DELETE FROM "organizations" WHERE "id" IN ('${tenantOrg.organizationId}', '${otherTenantOrg.organizationId}')`);
    });
    await prisma.$disconnect();
  });

  it('should create a central warehouse and automatically provision default locations', async () => {
    const warehouse = await warehouseService.createWarehouse(
      tenantOrg.organizationId,
      {
        name: 'Central Solar Hub - Gujarat',
        code: 'WH-GUJ-01',
        address: 'Plot 42, Sanand Industrial Area, Ahmedabad, Gujarat 382110',
        contactPhone: '+91 98765 43210',
      },
      tenantOrg.userId,
    );

    expect(warehouse).toBeDefined();
    expect(warehouse.id).toBeDefined();
    expect(warehouse.code).toBe('WH-GUJ-01');
    expect(warehouse.name).toBe('Central Solar Hub - Gujarat');
    expect(warehouse.isActive).toBe(true);

    // Verify automatically created receiving bay and general storage
    const locations = await warehouseService.listWarehouseLocations(tenantOrg.organizationId, warehouse.id);
    expect(locations.length).toBeGreaterThanOrEqual(2);

    const receivingBay = locations.find((l) => l.isDefaultReceiving);
    expect(receivingBay).toBeDefined();
    expect(receivingBay?.type).toBe(WarehouseLocationType.RECEIVING);
  });

  it('should prevent creating duplicate warehouse codes within the same organization', async () => {
    await expect(
      warehouseService.createWarehouse(
        tenantOrg.organizationId,
        {
          name: 'Duplicate Hub',
          code: 'WH-GUJ-01',
        },
        tenantOrg.userId,
      ),
    ).rejects.toThrow();
  });

  it('should create hierarchical storage racks and bins inside warehouse', async () => {
    const whList = await warehouseService.listWarehouses(tenantOrg.organizationId);
    const wh = whList[0];

    const zoneLocation = await warehouseService.createLocation(
      tenantOrg.organizationId,
      wh.id,
      {
        name: 'Inverter Bay - Zone A',
        code: 'BAY-A',
        type: WarehouseLocationType.STORAGE,
        zone: 'Zone A',
      },
    );

    expect(zoneLocation).toBeDefined();
    expect(zoneLocation.zone).toBe('Zone A');

    const binLocation = await warehouseService.createLocation(
      tenantOrg.organizationId,
      wh.id,
      {
        name: 'Rack 1 - Shelf 2 - Bin 04',
        code: 'A-R1-S2-B04',
        type: WarehouseLocationType.STORAGE,
        zone: 'Zone A',
        rack: 'Rack 01',
        bin: 'Bin 04',
        parentId: zoneLocation.id,
      },
    );

    expect(binLocation).toBeDefined();
    expect(binLocation.rack).toBe('Rack 01');
    expect(binLocation.bin).toBe('Bin 04');
    expect(binLocation.parentId).toBe(zoneLocation.id);
  });

  it('should enforce tenant isolation on warehouse list and access', async () => {
    // Other tenant should not see tenantOrg's warehouses
    const otherWhs = await warehouseService.listWarehouses(otherTenantOrg.organizationId);
    expect(otherWhs.length).toBe(0);

    const myWhs = await warehouseService.listWarehouses(tenantOrg.organizationId);
    expect(myWhs.length).toBe(1);

    // Other tenant cannot fetch warehouse by ID
    await expect(
      warehouseService.getWarehouse(otherTenantOrg.organizationId, myWhs[0].id),
    ).rejects.toThrow();
  });
});
