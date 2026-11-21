import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthenticatedRequest } from '../middleware/tenant-context.middleware';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.tenantContext || !request.tenantContext.organizationId) {
      throw new UnauthorizedException('Tenant context is required for this operation.');
    }

    return true;
  }
}
