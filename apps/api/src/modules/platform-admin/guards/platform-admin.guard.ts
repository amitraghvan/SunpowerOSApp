import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SessionService } from '../../identity/session.service';
import { PrismaService } from '../../../database/prisma.service';
import { PLATFORM_ROLES_KEY, PLATFORM_PERMISSIONS_KEY } from '../decorators/platform-admin.decorator';
import { PlatformRole } from '@solaros/types';

@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      Request & { session?: any; user?: any; platformAdmin?: any }
    >();

    const rawToken = this.extractTokenFromRequest(request);
    if (!rawToken) {
      throw new UnauthorizedException('Platform Administrator authentication required.');
    }

    const session = await this.sessionService.validateSession(rawToken);
    if (!session || !session.user) {
      throw new UnauthorizedException('Invalid, revoked or expired session token.');
    }

    const user = session.user;
    if (!user.isActive || user.status === 'SUSPENDED' || user.status === 'ARCHIVED') {
      throw new ForbiddenException('User account is inactive or suspended.');
    }

    // Look up PlatformAdministrator record
    let platformAdmin = await this.prisma.platformAdministrator.findFirst({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isSuperAdmin: true,
          },
        },
      },
    });

    // If user is a super admin and has no PlatformAdministrator record yet, auto-bootstrap PLATFORM_OWNER
    if (!platformAdmin && user.isSuperAdmin) {
      platformAdmin = await this.prisma.platformAdministrator.create({
        data: {
          userId: user.id,
          role: PlatformRole.PLATFORM_OWNER,
          isActive: true,
          permissions: ['*'],
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              isSuperAdmin: true,
            },
          },
        },
      });
    }

    if (!platformAdmin) {
      throw new ForbiddenException(
        'Access denied. User does not possess Platform Administrator privileges.',
      );
    }

    if (!platformAdmin.isActive) {
      throw new ForbiddenException('Platform Administrator account is suspended or inactive.');
    }

    // Check required platform roles if any
    const requiredRoles = this.reflector.getAllAndOverride<(PlatformRole | string)[]>(
      PLATFORM_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles && requiredRoles.length > 0) {
      // PLATFORM_OWNER has access to all roles
      if (
        platformAdmin.role !== PlatformRole.PLATFORM_OWNER &&
        !requiredRoles.includes(platformAdmin.role)
      ) {
        throw new ForbiddenException(
          `Insufficient platform role. Required: [${requiredRoles.join(', ')}], current: ${platformAdmin.role}`,
        );
      }
    }

    // Check required permissions if any
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PLATFORM_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasWildcard =
        platformAdmin.role === PlatformRole.PLATFORM_OWNER ||
        platformAdmin.permissions.includes('*');

      if (!hasWildcard) {
        const hasAll = requiredPermissions.every((p) =>
          platformAdmin.permissions.includes(p),
        );
        if (!hasAll) {
          throw new ForbiddenException('Insufficient platform permissions for this action.');
        }
      }
    }

    request.user = user;
    request.session = session;
    request.platformAdmin = platformAdmin;

    return true;
  }

  private extractTokenFromRequest(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    const cookieToken = (req as any).cookies?.['solaros_session'];
    if (cookieToken) {
      return cookieToken;
    }
    return null;
  }
}
