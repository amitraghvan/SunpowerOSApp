export type RoleType =
  | 'SYSTEM_ADMIN'
  | 'ORG_ADMIN'
  | 'PROJECT_MANAGER'
  | 'SOLAR_ENGINEER'
  | 'TECHNICIAN'
  | 'FINANCE_MANAGER'
  | 'PROCUREMENT_OFFICER'
  | 'SALES_REP'
  | 'CUSTOMER';

export type UserStatus = 'INVITED' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export type RoleScope = 'NONE' | 'OWN' | 'ASSIGNED' | 'TEAM' | 'BRANCH' | 'ORGANIZATION';

export type PermissionAction =
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'ASSIGN'
  | 'EXPORT'
  | 'MANAGE';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  status: UserStatus;
  isActive: boolean;
  isSuperAdmin: boolean;
  twoFactorEnabled: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PermissionDefinition {
  id: string;
  code: string;
  name: string;
  category: string;
  action: PermissionAction;
  resource: string;
  sensitivity: 'NORMAL' | 'SENSITIVE' | 'CRITICAL';
  description?: string | null;
}

export interface RoleDefinition {
  id: string;
  organizationId?: string | null;
  name: string;
  code: string;
  description?: string | null;
  scope: RoleScope;
  category: string;
  isSystem: boolean;
  permissions: string[];
}

export interface UserMembershipInfo {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  branchId?: string | null;
  branchName?: string | null;
  roles: string[];
  isDefault?: boolean;
}

export interface ActiveSession {
  id: string;
  userId: string;
  organizationId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: Date;
  createdAt: Date;
  isCurrent?: boolean;
}

export interface OrganizationInvitationInfo {
  id: string;
  organizationId: string;
  email: string;
  roleCode: string;
  branchId?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  expiresAt: Date;
  acceptedAt?: Date | null;
  createdAt: Date;
}
