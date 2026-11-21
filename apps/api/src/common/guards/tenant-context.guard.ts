import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma.service';
import { AccessControlService } from '../../modules/access-control/access-control.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { API_CONSTANTS } from '@solaros/config';
import { TenantContext } from '@solaros/types';

@Injectable()
export class TenantContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly accessControlService: AccessControlService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const requestedOrgId = (request.headers[API_CONSTANTS.TENANT_ID_HEADER] as string) ||
      (request.session?.organizationId as string);

    const requestedBranchId = (request.headers[API_CONSTANTS.BRANCH_ID_HEADER] as string) || undefined;

    if (!requestedOrgId) {
      throw new UnauthorizedException('Tenant context is required. Missing organization identification.');
    }

    // Verify organization exists and is active
    const organization = await this.prisma.organization.findUnique({
      where: { id: requestedOrgId },
    });

    if (!organization || !organization.isActive || organization.deletedAt) {
      throw new ForbiddenException(`Organization ${requestedOrgId} is invalid or inactive.`);
    }

    let roles: string[] = [];
    let permissions: string[] = [];
    let resolvedBranchId = requestedBranchId;

    if (user) {
      if (user.isSuperAdmin) {
        // SuperAdmin has full system privileges across all organizations
        const allPermissions = await this.prisma.permission.findMany({ select: { code: true } });
        permissions = allPermissions.map((p) => p.code);
        roles = ['SYSTEM_ADMIN'];
      } else {
        // Regular user: verify membership
        const membership = await this.prisma.organizationMembership.findFirst({
          where: {
            userId: user.id,
            organizationId: requestedOrgId,
            isActive: true,
            deletedAt: null,
          },
          include: { branch: true },
        });

        if (!membership) {
          throw new ForbiddenException('User is not an active member of this organization.');
        }

        if (!resolvedBranchId && membership.branchId) {
          resolvedBranchId = membership.branchId;
        }

        const effective = await this.accessControlService.getEffectivePermissions(
          user.id,
          requestedOrgId
        );
        roles = effective.roles;
        permissions = effective.permissions;
      }
    } else {
      // Unauthenticated / legacy header-only test mode fallback
      roles = [];
      permissions = [];
    }

    const tenantContext: TenantContext & { toString: () => string; valueOf: () => string } = {
      organizationId: organization.id,
      organizationSlug: organization.slug,
      organizationName: organization.name,
      branchId: resolvedBranchId,
      userId: user ? user.id : 'anonymous',
      userEmail: user ? user.email : '',
      roles,
      permissions,
      toString() {
        return this.organizationId;
      },
      valueOf() {
        return this.organizationId;
      },
    };

    request.tenantContext = tenantContext;
    return true;
  }
}
