import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedRequest } from '../middleware/tenant-context.middleware';
import { TenantContext } from '@solaros/types';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantContext | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.tenantContext;
  }
);
