import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { SessionService } from '../identity/session.service';
import { PasswordService } from '../identity/password.service';
import { AccessControlService } from '../access-control/access-control.service';
import {
  CreateInvitationRequestDto,
  AcceptInvitationRequestDto,
  AuthResponseDto,
} from '@solaros/contracts';
import { UserProfile, UserMembershipInfo } from '@solaros/types';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionService: SessionService,
    private readonly passwordService: PasswordService,
    private readonly accessControlService: AccessControlService
  ) {}

  /**
   * List organizations for a user
   */
  async listUserOrganizations(userId: string) {
    const memberships = await this.prisma.organizationMembership.findMany({
      where: {
        userId,
        isActive: true,
        deletedAt: null,
      },
      include: {
        organization: true,
        branch: true,
        roles: {
          include: { role: true },
        },
      },
    });

    return memberships.map((m) => ({
      organization: {
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        taxIdentifier: m.organization.taxIdentifier,
        isActive: m.organization.isActive,
      },
      branch: m.branch
        ? { id: m.branch.id, code: m.branch.code, name: m.branch.name }
        : null,
      roles: m.roles.map((r) => r.role.code),
      joinedAt: m.joinedAt,
    }));
  }

  /**
   * Switch active organization context
   */
  async switchOrganization(
    userId: string,
    targetOrgId: string,
    targetBranchId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { isActive: true, deletedAt: null },
          include: {
            organization: true,
            branch: true,
            roles: { include: { role: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    let targetMembership = user.memberships.find(
      (m) => m.organizationId === targetOrgId
    );

    if (!targetMembership && !user.isSuperAdmin) {
      throw new ForbiddenException('User is not a member of target organization.');
    }

    // Verify organization is active
    const org = await this.prisma.organization.findUnique({
      where: { id: targetOrgId },
    });

    if (!org || !org.isActive || org.deletedAt) {
      throw new ForbiddenException('Target organization is inactive or deleted.');
    }

    // Verify branch if provided
    let activeBranch = targetMembership?.branch;
    if (targetBranchId) {
      const branch = await this.prisma.organizationBranch.findFirst({
        where: { id: targetBranchId, organizationId: targetOrgId, isActive: true },
      });
      if (branch) {
        activeBranch = branch;
      }
    }

    // Create a new session scoped to the selected organization
    const { rawToken, expiresAt } = await this.sessionService.createSession({
      userId: user.id,
      organizationId: targetOrgId,
      ipAddress,
      userAgent,
    });

    const effective = user.isSuperAdmin
      ? {
          roles: ['SYSTEM_ADMIN'],
          permissions: (await this.prisma.permission.findMany({ select: { code: true } })).map((p) => p.code),
        }
      : await this.accessControlService.getEffectivePermissions(user.id, targetOrgId);

    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      status: user.status as any,
      isActive: user.isActive,
      isSuperAdmin: user.isSuperAdmin,
      twoFactorEnabled: user.twoFactorEnabled,
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const membershipsList: UserMembershipInfo[] = user.memberships.map((m) => ({
      organizationId: m.organizationId,
      organizationName: m.organization.name,
      organizationSlug: m.organization.slug,
      branchId: m.branchId,
      branchName: m.branch?.name,
      roles: m.roles.map((r) => r.role.code),
      isDefault: m.organizationId === targetOrgId,
    }));

    return {
      user: userProfile,
      activeOrganization: {
        id: org.id,
        slug: org.slug,
        name: org.name,
      },
      activeBranch: activeBranch
        ? { id: activeBranch.id, code: activeBranch.code, name: activeBranch.name }
        : null,
      roles: effective.roles,
      permissions: effective.permissions,
      memberships: membershipsList,
      sessionToken: rawToken,
      expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    };
  }

  /**
   * List branches in organization
   */
  async listBranches(organizationId: string) {
    return this.prisma.forTenant(organizationId, async (tx) => {
      return tx.organizationBranch.findMany({
        where: { organizationId, deletedAt: null },
        orderBy: { name: 'asc' },
      });
    });
  }

  /**
   * Create a new branch
   */
  async createBranch(
    organizationId: string,
    data: {
      code: string;
      name: string;
      city: string;
      state: string;
      address?: string;
      postalCode?: string;
    }
  ) {
    return this.prisma.forTenant(organizationId, async (tx) => {
      const existing = await tx.organizationBranch.findFirst({
        where: { organizationId, code: data.code.toUpperCase().trim() },
      });

      if (existing) {
        throw new ConflictException(`Branch code ${data.code} already exists in this organization.`);
      }

      return tx.organizationBranch.create({
        data: {
          organizationId,
          code: data.code.toUpperCase().trim(),
          name: data.name.trim(),
          city: data.city.trim(),
          state: data.state.trim(),
          address: data.address,
          postalCode: data.postalCode,
        },
      });
    });
  }

  /**
   * Create employee invitation
   */
  async createInvitation(
    organizationId: string,
    invitedById: string,
    dto: CreateInvitationRequestDto
  ) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await this.prisma.organizationInvitation.create({
      data: {
        organizationId,
        email: dto.email.toLowerCase().trim(),
        roleCode: dto.roleCode,
        branchId: dto.branchId || null,
        tokenHash,
        invitedById,
        status: 'PENDING',
        expiresAt,
      },
    });

    return {
      invitationId: invitation.id,
      email: invitation.email,
      roleCode: invitation.roleCode,
      invitationToken: rawToken,
      expiresAt: invitation.expiresAt,
    };
  }

  /**
   * List pending and historical invitations
   */
  async listInvitations(organizationId: string) {
    return this.prisma.organizationInvitation.findMany({
      where: { organizationId },
      include: {
        invitedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
        branch: {
          select: { name: true, code: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Accept an invitation and set up user account
   */
  async acceptInvitation(dto: AcceptInvitationRequestDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const invitation = await this.prisma.organizationInvitation.findFirst({
      where: {
        tokenHash,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });

    if (!invitation) {
      throw new BadRequestException('Invitation is invalid, expired, or already accepted.');
    }

    let user = await this.prisma.user.findUnique({
      where: { email: invitation.email },
    });

    if (!user) {
      if (!dto.password) {
        throw new BadRequestException('Password is required for new user registration.');
      }
      const passwordHash = await this.passwordService.hashPassword(dto.password);
      user = await this.prisma.user.create({
        data: {
          email: invitation.email,
          firstName: dto.firstName || 'Solar',
          lastName: dto.lastName || 'User',
          passwordHash,
          status: 'ACTIVE',
        },
      });
    }

    // Create or activate membership
    let membership = await this.prisma.organizationMembership.findFirst({
      where: { organizationId: invitation.organizationId, userId: user.id },
    });

    if (!membership) {
      membership = await this.prisma.organizationMembership.create({
        data: {
          organizationId: invitation.organizationId,
          userId: user.id,
          branchId: invitation.branchId,
          isActive: true,
        },
      });
    }

    // Assign role
    const role = await this.prisma.role.findFirst({
      where: {
        code: invitation.roleCode,
        OR: [{ organizationId: null }, { organizationId: invitation.organizationId }],
      },
    });

    if (role) {
      await this.prisma.membershipRole.upsert({
        where: {
          membershipId_roleId: {
            membershipId: membership.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          membershipId: membership.id,
          roleId: role.id,
        },
      });
    }

    // Mark invitation accepted
    await this.prisma.organizationInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });

    return {
      message: 'Invitation accepted successfully. You can now log in to SolarOS.',
      organizationId: invitation.organizationId,
      email: invitation.email,
    };
  }
}
