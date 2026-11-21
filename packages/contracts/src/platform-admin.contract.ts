import {
  PlatformRole,
  PlatformEnquiryStatus,
  PlatformEnquiryCategory,
  SupportTicketStatus,
  SupportTicketPriority,
  SupportTicketCategory,
  PlatformAlertSeverity,
  PlatformAlertStatus,
  OrganizationLifecycleStatus,
} from '@solaros/types';

export interface PlatformLoginRequest {
  email: string;
  password: string;
}

export interface PlatformAuthResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: PlatformRole | string;
    permissions: string[];
  };
}

export interface ListPlatformOrganizationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrganizationLifecycleStatus | string;
  planId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SuspendOrganizationRequest {
  reason: string;
}

export interface ReactivateOrganizationRequest {
  notes?: string;
}

export interface UpdateOrganizationSubscriptionRequest {
  planId: string;
  seatLimit?: number;
  storageLimitMb?: number;
}

export interface CreatePublicEnquiryRequest {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  category?: PlatformEnquiryCategory | string;
  projectCapacity?: string;
  message: string;
  sourceUrl?: string;
}

export interface ListPlatformEnquiriesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PlatformEnquiryStatus | string;
  category?: PlatformEnquiryCategory | string;
  assignedToId?: string;
}

export interface UpdatePlatformEnquiryStatusRequest {
  status: PlatformEnquiryStatus | string;
  notes?: string;
}

export interface AssignPlatformEnquiryRequest {
  assignedToId: string;
}

export interface AddPlatformEnquiryNoteRequest {
  notes: string;
}

export interface CreateSupportTicketRequest {
  subject: string;
  category: SupportTicketCategory | string;
  priority?: SupportTicketPriority | string;
  message: string;
  attachments?: string[];
}

export interface ReplySupportTicketRequest {
  message: string;
  isInternalOnly?: boolean;
  attachments?: string[];
}

export interface UpdateSupportTicketStatusRequest {
  status: SupportTicketStatus | string;
  resolutionNotes?: string;
}

export interface AssignSupportTicketRequest {
  assignedToId: string;
}

export interface ListSupportTicketsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SupportTicketStatus | string;
  priority?: SupportTicketPriority | string;
  category?: SupportTicketCategory | string;
  organizationId?: string;
  assignedToId?: string;
}

export interface ResolveAlertRequest {
  notes?: string;
}

export interface CreatePlatformAdminRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: PlatformRole | string;
  permissions?: string[];
  notes?: string;
}

export interface UpdatePlatformAdminRequest {
  role?: PlatformRole | string;
  permissions?: string[];
  isActive?: boolean;
  notes?: string;
}

export interface CreateSaaSPlanRequest {
  code: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  annualPrice: number;
  maxUsers?: number;
  maxStorageMb?: number;
  maxProjects?: number;
  features?: string[];
  isActive?: boolean;
}
