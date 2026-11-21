import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PlatformRole, PlatformPermission } from '@solaros/types';

export const PLATFORM_ROLES_KEY = 'platform_roles';
export const PLATFORM_PERMISSIONS_KEY = 'platform_permissions';

export const RequirePlatformRoles = (...roles: (PlatformRole | string)[]) =>
  SetMetadata(PLATFORM_ROLES_KEY, roles);

export const RequirePlatformPermissions = (...permissions: (PlatformPermission | string)[]) =>
  SetMetadata(PLATFORM_PERMISSIONS_KEY, permissions);

export const CurrentPlatformAdmin = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const admin = request.platformAdmin;
    if (!admin) return null;
    return data ? admin[data] : admin;
  },
);
