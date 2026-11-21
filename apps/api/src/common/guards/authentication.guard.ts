import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SessionService } from '../../modules/identity/session.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { session?: any; user?: any }>();
    const rawToken = this.extractTokenFromRequest(request);

    if (!rawToken) {
      throw new UnauthorizedException('Authentication required. Missing session cookie or Bearer token.');
    }

    const session = await this.sessionService.validateSession(rawToken);

    if (!session) {
      throw new UnauthorizedException('Invalid, revoked or expired session token.');
    }

    const user = session.user;

    if (!user.isActive || user.status === 'SUSPENDED' || user.status === 'ARCHIVED') {
      throw new ForbiddenException('User account is inactive or suspended.');
    }

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new ForbiddenException(`User account is temporarily locked until ${user.lockedUntil.toISOString()}`);
    }

    request.session = session;
    request.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      status: user.status,
      isActive: user.isActive,
      isSuperAdmin: user.isSuperAdmin,
      twoFactorEnabled: user.twoFactorEnabled,
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return true;
  }

  private extractTokenFromRequest(request: Request): string | null {
    // 1. Authorization header: Bearer <token>
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    // 2. Cookie: solaros_session
    if (request.cookies && request.cookies['solaros_session']) {
      return request.cookies['solaros_session'];
    }

    // 3. Fallback: Parse raw cookie header if cookie-parser middleware not mounted yet
    const rawCookie = request.headers.cookie;
    if (rawCookie) {
      const match = rawCookie.match(/(?:^|;\s*)solaros_session=([^;]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    return null;
  }
}
