import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { AccessControlService } from '../access-control/access-control.service';
import {
  LoginRequestDto,
  RegisterRequestDto,
  AuthResponseDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
} from '@solaros/contracts';
import { UserProfile, UserMembershipInfo } from '@solaros/types';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
    private readonly accessControlService: AccessControlService
  ) {}

  /**
   * Authenticate user with email and password, lock out after 5 failures, create session.
   */
  async login(
    dto: LoginRequestDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
      include: {
        memberships: {
          where: { isActive: true, deletedAt: null },
          include: {
            organization: true,
            branch: true,
            roles: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Check account status
    if (!user.isActive || user.status === 'SUSPENDED' || user.status === 'ARCHIVED') {
      throw new ForbiddenException('User account is inactive or suspended. Contact administrator.');
    }

    // Check account lockout
    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const waitMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      throw new ForbiddenException(
        `Account temporarily locked due to excessive failed attempts. Please retry in ${waitMinutes} minute(s).`
      );
    }

    // Verify password
    if (!user.passwordHash) {
      throw new UnauthorizedException('Account has no password configured. Please accept your invitation or reset password.');
    }

    const isMatch = await this.passwordService.verifyPassword(user.passwordHash, dto.password || '');
    if (!isMatch) {
      const failedCount = user.failedLoginAttempts + 1;
      const willLock = failedCount >= 5;
      const lockedUntil = willLock ? new Date(Date.now() + 15 * 60 * 1000) : null;

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedCount,
          lockedUntil,
        },
      });

      if (willLock) {
        throw new ForbiddenException(
          'Maximum failed login attempts exceeded. Account is locked for 15 minutes.'
        );
      }

      throw new UnauthorizedException('Invalid email or password.');
    }

    // Reset failed login counter & record login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Determine target organization
    if (user.memberships.length === 0 && !user.isSuperAdmin) {
      throw new ForbiddenException('User is not assigned to any active organization.');
    }

    let activeMembership = user.memberships[0];
    if (dto.organizationSlug) {
      const matched = user.memberships.find(
        (m) => m.organization.slug.toLowerCase() === dto.organizationSlug?.toLowerCase()
      );
      if (matched) {
        activeMembership = matched;
      }
    }

    const organizationId = activeMembership ? activeMembership.organizationId : (
      user.isSuperAdmin ? (await this.prisma.organization.findFirst({ select: { id: true } }))?.id || '' : ''
    );

    if (!organizationId) {
      throw new ForbiddenException('No active organization found.');
    }

    // Create session
    const { rawToken, expiresAt } = await this.sessionService.createSession({
      userId: user.id,
      organizationId,
      ipAddress,
      userAgent,
      rememberMe: dto.rememberMe,
    });

    // Effective permissions and roles
    const effective = user.isSuperAdmin
      ? {
          roles: ['SYSTEM_ADMIN'],
          permissions: (await this.prisma.permission.findMany({ select: { code: true } })).map((p) => p.code),
        }
      : await this.accessControlService.getEffectivePermissions(user.id, organizationId);

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
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
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
      isDefault: m.organizationId === organizationId,
    }));

    return {
      user: userProfile,
      activeOrganization: {
        id: activeMembership ? activeMembership.organization.id : organizationId,
        slug: activeMembership ? activeMembership.organization.slug : '',
        name: activeMembership ? activeMembership.organization.name : 'System Admin',
      },
      activeBranch: activeMembership?.branch
        ? {
            id: activeMembership.branch.id,
            code: activeMembership.branch.code,
            name: activeMembership.branch.name,
          }
        : null,
      roles: effective.roles,
      permissions: effective.permissions,
      memberships: membershipsList,
      sessionToken: rawToken,
      expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    };
  }

  /**
   * Log out and invalidate session token
   */
  async logout(rawToken: string): Promise<void> {
    await this.sessionService.revokeSessionByToken(rawToken);
  }

  /**
   * Retrieve active authenticated user profile with organization context and permissions.
   */
  async getMe(userId: string, organizationId: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { isActive: true, deletedAt: null },
          include: {
            organization: true,
            branch: true,
            roles: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    const activeMembership = user.memberships.find((m) => m.organizationId === organizationId) || user.memberships[0];

    const effective = user.isSuperAdmin
      ? {
          roles: ['SYSTEM_ADMIN'],
          permissions: (await this.prisma.permission.findMany({ select: { code: true } })).map((p) => p.code),
        }
      : await this.accessControlService.getEffectivePermissions(user.id, organizationId);

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
      isDefault: m.organizationId === organizationId,
    }));

    return {
      user: userProfile,
      activeOrganization: {
        id: activeMembership ? activeMembership.organization.id : organizationId,
        slug: activeMembership ? activeMembership.organization.slug : '',
        name: activeMembership ? activeMembership.organization.name : 'System Admin',
      },
      activeBranch: activeMembership?.branch
        ? {
            id: activeMembership.branch.id,
            code: activeMembership.branch.code,
            name: activeMembership.branch.name,
          }
        : null,
      roles: effective.roles,
      permissions: effective.permissions,
      memberships: membershipsList,
      expiresIn: 86400,
    };
  }

  /**
   * Request password reset token
   */
  async forgotPassword(dto: ForgotPasswordRequestDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (user && user.isActive) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      this.logger.log(`Password reset token generated for user ${user.email} (token hash: ${tokenHash.slice(0, 8)}...)`);
    }

    return {
      message: 'If an account exists with that email, a password reset link has been dispatched.',
    };
  }

  /**
   * Reset password using token
   */
  async resetPassword(dto: ResetPasswordRequestDto): Promise<{ message: string }> {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const resetRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetRecord) {
      throw new BadRequestException('Password reset token is invalid or has expired.');
    }

    const passwordHash = await this.passwordService.hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { id: resetRecord.userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    // Invalidate all active sessions for security
    await this.sessionService.revokeAllUserSessions(resetRecord.userId);

    return {
      message: 'Password has been successfully reset. Please log in with your new password.',
    };
  }

  /**
   * Self-service registration: creates user, organization, default branch, assigns ORG_ADMIN, and creates session.
   */
  async register(
    dto: RegisterRequestDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponseDto> {
    const email = dto.email.toLowerCase().trim();
    if (!dto.termsAccepted || !dto.privacyAccepted) {
      throw new BadRequestException('You must accept the terms of service and privacy policy.');
    }

    // 1. Check existing user
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser && existingUser.passwordHash) {
      throw new ConflictException('An account with this email already exists. Please sign in.');
    }

    // 2. Prepare slug
    let baseSlug = (dto.organizationSlug || dto.organizationName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!baseSlug) baseSlug = 'workspace';

    let orgSlug = baseSlug;
    let counter = 1;
    while (await this.prisma.organization.findUnique({ where: { slug: orgSlug } })) {
      orgSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Hash password
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    // 4. Create or update user
    let user = existingUser;
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone?.trim() || null,
          passwordHash,
          status: 'ACTIVE',
          isActive: true,
          isSuperAdmin: false,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phone: dto.phone?.trim() || user.phone,
          passwordHash,
          status: 'ACTIVE',
          isActive: true,
        },
      });
    }

    // 5. Create Organization
    const organization = await this.prisma.organization.create({
      data: {
        name: dto.organizationName.trim(),
        slug: orgSlug,
        legalName: dto.organizationName.trim(),
        isActive: true,
      },
    });

    // 6. Create default Headquarter Branch, Membership, and Role inside tenant context
    const { branch, membership } = await this.prisma.forTenant(organization.id, async (tx) => {
      const b = await tx.organizationBranch.create({
        data: {
          organizationId: organization.id,
          code: 'HQ',
          name: 'Headquarters',
          city: dto.city?.trim() || 'New Delhi',
          state: dto.state?.trim() || 'Delhi',
          isActive: true,
        },
      });

      const m = await tx.organizationMembership.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          branchId: b.id,
          isActive: true,
        },
      });

      return { branch: b, membership: m };
    });

    // 8. Find or seed ORG_ADMIN role
    let orgAdminRole = await this.prisma.role.findFirst({
      where: { code: 'ORG_ADMIN' },
    });
    if (!orgAdminRole) {
      orgAdminRole = await this.prisma.role.create({
        data: {
          code: 'ORG_ADMIN',
          name: 'Organization Administrator',
          description: 'Full administrative access to the organization',
          scope: 'ORGANIZATION',
          category: 'ADMIN',
        },
      });
    }

    await this.prisma.membershipRole.create({
      data: {
        membershipId: membership.id,
        roleId: orgAdminRole.id,
      },
    });

    // 9. Audit Log
    try {
      await this.prisma.auditLog.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          action: 'REGISTER_ORGANIZATION',
          entityType: 'organizations',
          entityId: organization.id,
          metadata: {
            organizationName: organization.name,
            slug: organization.slug,
          },
          ipAddress: ipAddress || '127.0.0.1',
          userAgent: userAgent || 'SunPowerOS Web',
        },
      });
    } catch {
      // non-blocking
    }

    // 10. Create Session
    const { rawToken, expiresAt } = await this.sessionService.createSession({
      userId: user.id,
      organizationId: organization.id,
      ipAddress,
      userAgent,
      rememberMe: true,
    });

    // 11. Effective permissions
    const effective = await this.accessControlService.getEffectivePermissions(user.id, organization.id);

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
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const membershipsList: UserMembershipInfo[] = [
      {
        organizationId: organization.id,
        organizationName: organization.name,
        organizationSlug: organization.slug,
        branchId: branch.id,
        branchName: branch.name,
        roles: ['ORG_ADMIN'],
        isDefault: true,
      },
    ];

    return {
      user: userProfile,
      activeOrganization: {
        id: organization.id,
        slug: organization.slug,
        name: organization.name,
      },
      activeBranch: {
        id: branch.id,
        code: branch.code,
        name: branch.name,
      },
      roles: effective.roles.length > 0 ? effective.roles : ['ORG_ADMIN'],
      permissions: effective.permissions,
      memberships: membershipsList,
      sessionToken: rawToken,
      expiresIn: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    };
  }
}
