import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { API_CONSTANTS } from '@solaros/config';
import { TenantContext } from '@solaros/types';

export interface AuthenticatedRequest extends Request {
  tenantContext?: TenantContext;
}

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const orgId = req.headers[API_CONSTANTS.TENANT_ID_HEADER] as string;
    const branchId = req.headers[API_CONSTANTS.BRANCH_ID_HEADER] as string;

    if (orgId) {
      // In production, this context is verified against authenticated session/JWT
      req.tenantContext = {
        organizationId: orgId,
        organizationSlug: '',
        organizationName: '',
        branchId: branchId || undefined,
        userId: 'anonymous',
        userEmail: '',
        roles: [],
        permissions: [],
      };
    }

    next();
  }
}
