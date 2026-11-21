import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PasswordService } from './password.service';
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  AssignRolesRequestDto,
} from '@solaros/contracts';
import { UserProfile } from '@solaros/types';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService
  ) {}

  /**
   * List all users in an organization with their branch and roles
   */
  async listUsers(organizationId: string) {
    const memberships = await this.prisma.organizationMembership.findMany({
      where: {
        organizationId,
        deletedAt: null,
      },
      include: {
        user: true,
        branch: true,
        roles: {
          include: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((m) => ({
      membershipId: m.id,
      user: {
        id: m.user.id,
        email: m.user.email,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        phone: m.user.phone,
        status: m.user.status,
        isActive: m.user.isActive,
        isSuperAdmin: m.user.isSuperAdmin,
        twoFactorEnabled: m.user.twoFactorEnabled,
        lastLoginAt: m.user.lastLoginAt,
        createdAt: m.user.createdAt,
        updatedAt: m.user.updatedAt,
      },
      branch: m.branch
        ? { id: m.branch.id, code: m.branch.code, name: m.branch.name }
        : null,
      roles: m.roles.map((r) => ({
        id: r.role.id,
        code: r.role.code,
        name: r.role.name,
      })),
      joinedAt: m.joinedAt,
      isActive: m.isActive,
    }));
  }

  /**
   * Get user details by ID within organization context
   */
  async getUserById(userId: string, organizationId: string) {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: {
        userId,
        organizationId,
        deletedAt: null,
      },
      include: {
        user: true,
        branch: true,
        roles: {
          include: { role: true },
        },
      },
    });

    if (!membership) {
      throw new NotFoundException(`User ${userId} not found in this organization`);
    }

    return {
      membershipId: membership.id,
      user: {
        id: membership.user.id,
        email: membership.user.email,
        firstName: membership.user.firstName,
        lastName: membership.user.lastName,
        phone: membership.user.phone,
        status: membership.user.status,
        isActive: membership.user.isActive,
        isSuperAdmin: membership.user.isSuperAdmin,
        twoFactorEnabled: membership.user.twoFactorEnabled,
        lastLoginAt: membership.user.lastLoginAt,
        createdAt: membership.user.createdAt,
        updatedAt: membership.user.updatedAt,
      },
      branch: membership.branch
        ? { id: membership.branch.id, code: membership.branch.code, name: membership.branch.name }
        : null,
      roles: membership.roles.map((r) => ({
        id: r.role.id,
        code: r.role.code,
        name: r.role.name,
        scope: r.role.scope,
      })),
      joinedAt: membership.joinedAt,
      isActive: membership.isActive,
    };
  }

  /**
   * Create or invite user to organization
   */
  async createUser(organizationId: string, dto: CreateUserRequestDto) {
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (user) {
      // Check if already member
      const existingMembership = await this.prisma.organizationMembership.findFirst({
        where: { userId: user.id, organizationId, deletedAt: null },
      });
      if (existingMembership) {
        throw new ConflictException('User is already a member of this organization');
      }
    } else {
      const passwordHash = dto.password
        ? await this.passwordService.hashPassword(dto.password)
        : null;

      user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          passwordHash,
          status: dto.password ? 'ACTIVE' : 'INVITED',
        },
      });
    }

    // Create organization membership
    const membership = await this.prisma.organizationMembership.create({
      data: {
        organizationId,
        userId: user.id,
        branchId: dto.branchId || null,
        isActive: true,
      },
    });

    // Assign roles
    if (dto.roleCodes && dto.roleCodes.length > 0) {
      const roles = await this.prisma.role.findMany({
        where: {
          code: { in: dto.roleCodes },
          OR: [{ organizationId: null }, { organizationId }],
        },
      });

      for (const role of roles) {
        await this.prisma.membershipRole.create({
          data: {
            membershipId: membership.id,
            roleId: role.id,
          },
        });
      }
    }

    return this.getUserById(user.id, organizationId);
  }

  /**
   * Update user details and status
   */
  async updateUser(userId: string, organizationId: string, dto: UpdateUserRequestDto) {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: { userId, organizationId, deletedAt: null },
    });

    if (!membership) {
      throw new NotFoundException(`User ${userId} not found in this organization`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName ? { firstName: dto.firstName } : {}),
        ...(dto.lastName ? { lastName: dto.lastName } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });

    if (dto.isActive !== undefined) {
      await this.prisma.organizationMembership.update({
        where: { id: membership.id },
        data: { isActive: dto.isActive },
      });
    }

    return this.getUserById(userId, organizationId);
  }

  /**
   * Assign roles to user in organization
   */
  async assignRoles(userId: string, organizationId: string, dto: AssignRolesRequestDto) {
    const membership = await this.prisma.organizationMembership.findFirst({
      where: { userId, organizationId, deletedAt: null },
    });

    if (!membership) {
      throw new NotFoundException(`User ${userId} not found in this organization`);
    }

    // Remove existing roles
    await this.prisma.membershipRole.deleteMany({
      where: { membershipId: membership.id },
    });

    // Assign new roles
    for (const roleId of dto.roleIds) {
      await this.prisma.membershipRole.create({
        data: {
          membershipId: membership.id,
          roleId,
        },
      });
    }

    return this.getUserById(userId, organizationId);
  }
}
