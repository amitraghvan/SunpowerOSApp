import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PasswordService } from '../../identity/password.service';
import { SessionService } from '../../identity/session.service';
import { PlatformAuditService } from './platform-audit.service';
import { PlatformRole } from '@solaros/types';
import { PlatformLoginRequest, PlatformAuthResponse } from '@solaros/contracts';

@Injectable()
export class PlatformAuthService {
  private readonly logger = new Logger(PlatformAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService,
    private readonly auditService: PlatformAuditService,
  ) {}

  async login(
    dto: PlatformLoginRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<PlatformAuthResponse> {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        platformAdministrator: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid platform administrator credentials.');
    }

    if (!user.isActive || user.status === 'SUSPENDED' || user.status === 'ARCHIVED') {
      throw new ForbiddenException('User account is inactive or suspended.');
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      const waitMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (60 * 1000));
      throw new ForbiddenException(
        `Account temporarily locked due to excessive failed attempts. Please retry in ${waitMinutes} minute(s).`,
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Account has no password configured.');
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
          'Maximum failed login attempts exceeded. Account is locked for 15 minutes.',
        );
      }

      throw new UnauthorizedException('Invalid platform administrator credentials.');
    }

    // Reset failed login counter
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Check or bootstrap PlatformAdministrator
    let admin = user.platformAdministrator;
    if (!admin && user.isSuperAdmin) {
      admin = await this.prisma.platformAdministrator.create({
        data: {
          userId: user.id,
          role: PlatformRole.PLATFORM_OWNER,
          isActive: true,
          permissions: ['*'],
        },
      });
    }

    if (!admin) {
      throw new ForbiddenException('Access denied. User is not a Platform Administrator.');
    }

    if (!admin.isActive) {
      throw new ForbiddenException('Platform Administrator access is deactivated.');
    }

    // Find any organization ID for session binding or default
    const firstOrg = await this.prisma.organization.findFirst({ select: { id: true } });
    const sessionOrgId = firstOrg ? firstOrg.id : '00000000-0000-0000-0000-000000000000';

    const { rawToken, expiresAt } = await this.sessionService.createSession({
      userId: user.id,
      organizationId: sessionOrgId,
      ipAddress,
      userAgent,
    });

    await this.auditService.logEvent({
      actorId: admin.id,
      actorEmail: user.email,
      platformRole: admin.role,
      action: 'PLATFORM_ADMIN_LOGIN',
      targetType: 'PLATFORM_ADMIN',
      targetId: admin.id,
      ipAddress,
      userAgent,
    });

    return {
      accessToken: rawToken,
      refreshToken: rawToken,
      admin: {
        id: admin.id,
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: admin.role,
        permissions: admin.permissions,
      },
    };
  }

  async getProfile(adminId: string) {
    const admin = await this.prisma.platformAdministrator.findUnique({
      where: { id: adminId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            lastLoginAt: true,
          },
        },
      },
    });

    if (!admin) {
      throw new UnauthorizedException('Platform Administrator not found.');
    }

    return {
      id: admin.id,
      userId: admin.userId,
      email: admin.user.email,
      firstName: admin.user.firstName,
      lastName: admin.user.lastName,
      role: admin.role,
      isActive: admin.isActive,
      permissions: admin.permissions,
      notes: admin.notes,
      createdAt: admin.createdAt,
      user: admin.user,
    };
  }
}
