import { Injectable, Logger, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PERMISSION_REGISTRY, SYSTEM_ROLE_TEMPLATES } from './permissions.registry';
import { RoleDefinition, PermissionDefinition } from '@solaros/types';

@Injectable()
export class AccessControlService implements OnModuleInit {
  private readonly logger = new Logger(AccessControlService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedPermissionsAndSystemRoles();
  }

  /**
   * Ensure all registry permissions and system role templates exist in the database.
   */
  async seedPermissionsAndSystemRoles() {
    try {
      this.logger.log('Synchronizing permissions registry with database...');
      // 1. Sync permissions
      for (const p of PERMISSION_REGISTRY) {
        await this.prisma.permission.upsert({
          where: { code: p.code },
          update: {
            name: p.name,
            category: p.category,
            action: p.action,
            resource: p.resource,
            sensitivity: p.sensitivity,
            description: p.description,
          },
          create: {
            code: p.code,
            name: p.name,
            category: p.category,
            action: p.action,
            resource: p.resource,
            sensitivity: p.sensitivity,
            description: p.description,
          },
        });
      }

      // 2. Sync system role templates
      const allPermissions = await this.prisma.permission.findMany();
      const permMap = new Map(allPermissions.map((p) => [p.code, p.id]));

      for (const t of SYSTEM_ROLE_TEMPLATES) {
        let role = await this.prisma.role.findFirst({
          where: { code: t.code, organizationId: null },
        });

        if (!role) {
          role = await this.prisma.role.create({
            data: {
              name: t.name,
              code: t.code,
              description: t.description,
              isSystem: true,
              scope: t.scope,
              category: t.category,
              organizationId: null,
            },
          });
        } else {
          await this.prisma.role.update({
            where: { id: role.id },
            data: {
              name: t.name,
              description: t.description,
              scope: t.scope,
              category: t.category,
            },
          });
        }

        // Sync role permissions
        for (const pCode of t.permissions) {
          const permId = permMap.get(pCode);
          if (permId) {
            await this.prisma.rolePermission.upsert({
              where: {
                roleId_permissionId: {
                  roleId: role.id,
                  permissionId: permId,
                },
              },
              update: {},
              create: {
                roleId: role.id,
                permissionId: permId,
              },
            });
          }
        }
      }
      this.logger.log('Permissions and system roles synchronization completed.');
    } catch (err: any) {
      this.logger.warn(`Permission synchronization failed during bootstrap: ${err.message}. Retrying lazily on query.`);
    }
  }

  /**
   * Resolves effective permissions and roles for a user in a specific organization.
   */
  async getEffectivePermissions(
    userId: string,
    organizationId: string
  ): Promise<{ permissions: string[]; roles: string[]; roleDetails: RoleDefinition[] }> {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return { permissions: [], roles: [], roleDetails: [] };
    }

    const permissionCodes = new Set<string>();
    const roleCodes: string[] = [];
    const roleDetails: RoleDefinition[] = [];

    for (const mr of membership.roles) {
      const r = mr.role;
      roleCodes.push(r.code);
      const perms: string[] = [];

      for (const rp of r.permissions) {
        permissionCodes.add(rp.permission.code);
        perms.push(rp.permission.code);
      }

      roleDetails.push({
        id: r.id,
        organizationId: r.organizationId,
        name: r.name,
        code: r.code,
        description: r.description,
        scope: r.scope as any,
        category: r.category,
        isSystem: r.isSystem,
        permissions: perms,
      });
    }

    return {
      permissions: Array.from(permissionCodes),
      roles: roleCodes,
      roleDetails,
    };
  }

  /**
   * List all available permissions in the system.
   */
  async listPermissions(): Promise<PermissionDefinition[]> {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
    });

    return permissions.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      category: p.category,
      action: p.action as any,
      resource: p.resource,
      sensitivity: p.sensitivity as any,
      description: p.description,
    }));
  }

  /**
   * List roles accessible by the organization (global system roles + org-specific custom roles).
   */
  async listRoles(organizationId?: string): Promise<RoleDefinition[]> {
    const roles = await this.prisma.role.findMany({
      where: {
        OR: [
          { organizationId: null },
          ...(organizationId ? [{ organizationId }] : []),
        ],
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });

    return roles.map((r) => ({
      id: r.id,
      organizationId: r.organizationId,
      name: r.name,
      code: r.code,
      description: r.description,
      scope: r.scope as any,
      category: r.category,
      isSystem: r.isSystem,
      permissions: r.permissions.map((rp) => rp.permission.code),
    }));
  }

  /**
   * Get role details by ID
   */
  async getRoleById(roleId: string, organizationId?: string): Promise<RoleDefinition> {
    const role = await this.prisma.role.findFirst({
      where: {
        id: roleId,
        OR: [
          { organizationId: null },
          ...(organizationId ? [{ organizationId }] : []),
        ],
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleId} not found`);
    }

    return {
      id: role.id,
      organizationId: role.organizationId,
      name: role.name,
      code: role.code,
      description: role.description,
      scope: role.scope as any,
      category: role.category,
      isSystem: role.isSystem,
      permissions: role.permissions.map((rp) => rp.permission.code),
    };
  }

  /**
   * Create custom role for organization
   */
  async createRole(
    organizationId: string,
    data: { name: string; code: string; description?: string; scope?: string; category?: string; permissionIds: string[] }
  ): Promise<RoleDefinition> {
    const existing = await this.prisma.role.findFirst({
      where: { organizationId, code: data.code },
    });

    if (existing) {
      throw new BadRequestException(`Role with code ${data.code} already exists in this organization`);
    }

    const created = await this.prisma.role.create({
      data: {
        organizationId,
        name: data.name,
        code: data.code,
        description: data.description,
        scope: data.scope || 'ORGANIZATION',
        category: data.category || 'CUSTOM',
        isSystem: false,
        permissions: {
          create: data.permissionIds.map((pid) => ({
            permissionId: pid,
          })),
        },
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    return {
      id: created.id,
      organizationId: created.organizationId,
      name: created.name,
      code: created.code,
      description: created.description,
      scope: created.scope as any,
      category: created.category,
      isSystem: created.isSystem,
      permissions: created.permissions.map((p) => p.permission.code),
    };
  }

  /**
   * Update custom role
   */
  async updateRole(
    roleId: string,
    organizationId: string,
    data: { name?: string; description?: string; scope?: string; category?: string; permissionIds?: string[] }
  ): Promise<RoleDefinition> {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, organizationId },
    });

    if (!role) {
      throw new NotFoundException('Custom role not found or cannot edit system role');
    }

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be modified');
    }

    if (data.permissionIds) {
      await this.prisma.rolePermission.deleteMany({
        where: { roleId },
      });
      await this.prisma.rolePermission.createMany({
        data: data.permissionIds.map((pid) => ({
          roleId,
          permissionId: pid,
        })),
      });
    }

    const updated = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.scope ? { scope: data.scope } : {}),
        ...(data.category ? { category: data.category } : {}),
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    return {
      id: updated.id,
      organizationId: updated.organizationId,
      name: updated.name,
      code: updated.code,
      description: updated.description,
      scope: updated.scope as any,
      category: updated.category,
      isSystem: updated.isSystem,
      permissions: updated.permissions.map((p) => p.permission.code),
    };
  }

  /**
   * Delete custom role
   */
  async deleteRole(roleId: string, organizationId: string): Promise<void> {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, organizationId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('System roles cannot be deleted');
    }

    await this.prisma.role.delete({
      where: { id: roleId },
    });
  }
}
