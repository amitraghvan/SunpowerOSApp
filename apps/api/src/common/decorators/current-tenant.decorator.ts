import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContext } from '@solaros/types';

export const CurrentTenant = createParamDecorator(
  (data: keyof TenantContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const tenant = request.tenantContext;
    return data && tenant ? tenant[data] : tenant;
  }
);
