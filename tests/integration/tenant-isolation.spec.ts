import { TenantGuard } from '../../apps/api/src/common/guards/tenant.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('TenantGuard Isolation Protection', () => {
  let guard: TenantGuard;

  beforeEach(() => {
    guard = new TenantGuard();
  });

  it('should grant access when valid tenant context is present', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          tenantContext: {
            organizationId: '123e4567-e89b-12d3-a456-426614174000',
            organizationSlug: 'acme-solar',
            organizationName: 'Acme Solar Ltd',
            userId: 'user-uuid',
            userEmail: 'user@acme.com',
            roles: ['ORG_ADMIN'],
            permissions: ['org:read'],
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should reject request with UnauthorizedException when tenant context is missing', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          tenantContext: undefined,
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should reject request when organizationId is empty', () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          tenantContext: {
            organizationId: '',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
