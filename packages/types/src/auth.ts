export type RoleType = 'SYSTEM_ADMIN' | 'ORG_ADMIN' | 'PROJECT_MANAGER' | 'SOLAR_ENGINEER' | 'TECHNICIAN' | 'FINANCE_MANAGER' | 'PROCUREMENT_OFFICER' | 'SALES_REP' | 'CUSTOMER';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDefinition {
  id: string;
  name: string;
  code: string;
  description?: string;
  isSystem: boolean;
  permissions: string[];
}

export interface UserSession {
  sessionId: string;
  userId: string;
  activeOrganizationId: string;
  activeBranchId?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
}
