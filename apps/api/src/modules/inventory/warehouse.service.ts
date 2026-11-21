import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NumberingService } from '../../common/services/numbering.service';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  CreateWarehouseLocationDto,
} from '@solaros/contracts';
import { WarehouseLocationType } from '@solaros/types';

@Injectable()
export class WarehouseService {
  private readonly logger = new Logger(WarehouseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
  ) {}

  async createWarehouse(organizationId: string, dto: CreateWarehouseDto, userId?: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const existing = await tx.warehouse.findFirst({
        where: { organizationId, code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`Warehouse with code ${dto.code} already exists`);
      }

      const warehouse = await tx.warehouse.create({
        data: {
          organizationId,
          code: dto.code,
          name: dto.name,
          branchId: dto.branchId,
          address: dto.address,
          contactPhone: dto.contactPhone,
          contactEmail: dto.contactEmail,
          managerId: dto.managerId || userId,
          isActive: true,
        },
        include: {
          branch: { select: { id: true, code: true, name: true } },
          manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      // Automatically create a default RECEIVING and STORAGE location for this warehouse
      await tx.inventoryLocation.create({
        data: {
          organizationId,
          warehouseId: warehouse.id,
          code: `${warehouse.code}-RCV`,
          name: `${warehouse.name} Receiving Bay`,
          type: WarehouseLocationType.RECEIVING,
          isDefaultReceiving: true,
        },
      });

      await tx.inventoryLocation.create({
        data: {
          organizationId,
          warehouseId: warehouse.id,
          code: `${warehouse.code}-GEN`,
          name: `${warehouse.name} General Storage`,
          type: WarehouseLocationType.STORAGE,
          isDefaultReceiving: false,
        },
      });

      this.logger.log(`Created warehouse ${warehouse.code} (${warehouse.name}) for tenant ${organizationId}`);
      return warehouse;
    });
  }

  async listWarehouses(
    organizationId: string,
    filters?: { branchId?: string; isActive?: boolean; search?: string },
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const where: any = { organizationId };
      if (filters?.branchId) where.branchId = filters.branchId;
      if (filters?.isActive !== undefined) where.isActive = filters.isActive;
      if (filters?.search) {
        where.OR = [
          { code: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } },
          { address: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const warehouses = await tx.warehouse.findMany({
        where,
        include: {
          branch: { select: { id: true, code: true, name: true } },
          manager: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { locations: true } },
        },
        orderBy: { code: 'asc' },
      });

      return warehouses.map((w) => ({
        ...w,
        locationsCount: w._count.locations,
        branchName: w.branch?.name,
        managerName: w.manager ? `${w.manager.firstName} ${w.manager.lastName}` : undefined,
      }));
    });
  }

  async getWarehouse(organizationId: string, id: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: { id, organizationId },
        include: {
          branch: true,
          manager: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          locations: {
            orderBy: { code: 'asc' },
            include: {
              _count: { select: { serials: true } },
            },
          },
        },
      });

      if (!warehouse) {
        throw new NotFoundException(`Warehouse with id ${id} not found`);
      }

      return warehouse;
    });
  }

  async updateWarehouse(organizationId: string, id: string, dto: UpdateWarehouseDto) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: { id, organizationId },
      });

      if (!warehouse) {
        throw new NotFoundException(`Warehouse with id ${id} not found`);
      }

      return await tx.warehouse.update({
        where: { id },
        data: {
          name: dto.name,
          branchId: dto.branchId,
          address: dto.address,
          contactPhone: dto.contactPhone,
          contactEmail: dto.contactEmail,
          managerId: dto.managerId,
          isActive: dto.isActive,
        },
        include: {
          branch: true,
          manager: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });
    });
  }

  async createLocation(
    organizationId: string,
    warehouseId: string,
    dto: CreateWarehouseLocationDto,
  ) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      const warehouse = await tx.warehouse.findFirst({
        where: { id: warehouseId, organizationId },
      });

      if (!warehouse) {
        throw new NotFoundException(`Warehouse with id ${warehouseId} not found`);
      }

      const existing = await tx.inventoryLocation.findFirst({
        where: { organizationId, code: dto.code },
      });

      if (existing) {
        throw new ConflictException(`Location code ${dto.code} already exists in organization`);
      }

      // If set as default receiving, unset previous defaults
      if (dto.isDefaultReceiving) {
        await tx.inventoryLocation.updateMany({
          where: { organizationId, warehouseId, isDefaultReceiving: true },
          data: { isDefaultReceiving: false },
        });
      }

      return await tx.inventoryLocation.create({
        data: {
          organizationId,
          warehouseId,
          code: dto.code,
          name: dto.name,
          type: dto.type || WarehouseLocationType.STORAGE,
          zone: dto.zone,
          rack: dto.rack,
          bin: dto.bin,
          parentId: dto.parentId,
          address: dto.address,
          isDefaultReceiving: dto.isDefaultReceiving ?? false,
          isActive: true,
        },
      });
    });
  }

  async listWarehouseLocations(organizationId: string, warehouseId: string) {
    return await this.prisma.forTenant(organizationId, async (tx) => {
      return await tx.inventoryLocation.findMany({
        where: { organizationId, warehouseId, isActive: true },
        orderBy: { code: 'asc' },
      });
    });
  }
}
