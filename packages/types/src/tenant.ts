export interface TenantContext {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  branchId?: string;
  userId: string;
  userEmail: string;
  roles: string[];
  permissions: string[];
}

export interface OrganizationInfo {
  id: string;
  slug: string;
  name: string;
  taxIdentifier?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BranchInfo {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  city: string;
  state: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
