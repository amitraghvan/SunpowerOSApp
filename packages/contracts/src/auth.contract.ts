import { UserProfile, UserMembershipInfo, ActiveSession, RoleDefinition, PermissionDefinition, OrganizationInvitationInfo } from '@solaros/types';

export interface LoginRequestDto {
  email: string;
  password?: string;
  organizationSlug?: string;
  rememberMe?: boolean;
}

export interface AuthResponseDto {
  user: UserProfile;
  activeOrganization: {
    id: string;
    slug: string;
    name: string;
  };
  activeBranch?: {
    id: string;
    code: string;
    name: string;
  } | null;
  roles: string[];
  permissions: string[];
  memberships: UserMembershipInfo[];
  sessionToken?: string;
  expiresIn: number;
}

export interface ForgotPasswordRequestDto {
  email: string;
}

export interface ResetPasswordRequestDto {
  token: string;
  newPassword: string;
}

export interface Enable2faResponseDto {
  secret: string;
  qrCodeUrl: string;
  recoveryCodes: string[];
}

export interface Verify2faRequestDto {
  token: string;
}

export interface SwitchOrganizationRequestDto {
  organizationId: string;
  branchId?: string;
}

export interface CreateUserRequestDto {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password?: string;
  roleCodes?: string[];
  branchId?: string;
}

export interface UpdateUserRequestDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  isActive?: boolean;
}

export interface AssignRolesRequestDto {
  roleIds: string[];
}

export interface CreateRoleRequestDto {
  name: string;
  code: string;
  description?: string;
  scope?: string;
  category?: string;
  permissionIds: string[];
}

export interface UpdateRoleRequestDto {
  name?: string;
  description?: string;
  scope?: string;
  category?: string;
  permissionIds?: string[];
}

export interface CreateInvitationRequestDto {
  email: string;
  roleCode: string;
  branchId?: string;
}

export interface AcceptInvitationRequestDto {
  token: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}
