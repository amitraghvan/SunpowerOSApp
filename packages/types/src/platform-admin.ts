export enum PlatformRole {
  PLATFORM_OWNER = 'PLATFORM_OWNER',
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  PLATFORM_SUPPORT = 'PLATFORM_SUPPORT',
  PLATFORM_ANALYST = 'PLATFORM_ANALYST',
  PLATFORM_READ_ONLY = 'PLATFORM_READ_ONLY',
}

export enum PlatformPermission {
  PLATFORM_MANAGE_ORGS = 'platform:manage_orgs',
  PLATFORM_SUSPEND_ORGS = 'platform:suspend_orgs',
  PLATFORM_VIEW_ANALYTICS = 'platform:view_analytics',
  PLATFORM_MANAGE_ENQUIRIES = 'platform:manage_enquiries',
  PLATFORM_MANAGE_SUPPORT = 'platform:manage_support',
  PLATFORM_MANAGE_ADMINS = 'platform:manage_admins',
  PLATFORM_MANAGE_PLANS = 'platform:manage_plans',
  PLATFORM_MANAGE_ALERTS = 'platform:manage_alerts',
  PLATFORM_VIEW_AUDIT_LOGS = 'platform:view_audit_logs',
}

export enum PlatformEnquiryStatus {
  NEW = 'NEW',
  IN_REVIEW = 'IN_REVIEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  CONVERTED = 'CONVERTED',
  CLOSED = 'CLOSED',
}

export enum PlatformEnquiryCategory {
  GENERAL_INQUIRY = 'GENERAL_INQUIRY',
  SALES_DEMO = 'SALES_DEMO',
  ENTERPRISE_PRICING = 'ENTERPRISE_PRICING',
  PARTNERSHIP = 'PARTNERSHIP',
  CUSTOM_INTEGRATION = 'CUSTOM_INTEGRATION',
  OTHER = 'OTHER',
}

export enum SupportTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_ON_CUSTOMER = 'WAITING_ON_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum SupportTicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum SupportTicketCategory {
  BILLING = 'BILLING',
  TECHNICAL = 'TECHNICAL',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  BUG_REPORT = 'BUG_REPORT',
  ACCOUNT_ACCESS = 'ACCOUNT_ACCESS',
  GENERAL = 'GENERAL',
}

export enum PlatformAlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum PlatformAlertStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
}

export enum OrganizationLifecycleStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ONBOARDING = 'ONBOARDING',
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum SaaSPlanTier {
  STARTER = 'STARTER',
  GROWTH = 'GROWTH',
  ENTERPRISE = 'ENTERPRISE',
}

export interface PlatformAdministratorProfile {
  id: string;
  userId: string;
  role: PlatformRole | string;
  isActive: boolean;
  permissions: string[];
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface PlatformEnquiryDto {
  id: string;
  referenceNumber: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  category: string;
  projectCapacity?: string | null;
  message: string;
  status: string;
  assignedToId?: string | null;
  internalNotes?: string | null;
  sourceUrl?: string | null;
  ipAddress?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  assignedTo?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
  activities?: Array<{
    id: string;
    activityType: string;
    details?: any;
    createdAt: string | Date;
  }>;
}

export interface SupportTicketDto {
  id: string;
  ticketNumber: string;
  organizationId: string;
  submittedById: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assignedToId?: string | null;
  resolutionNotes?: string | null;
  resolvedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  submittedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
  messages?: SupportTicketMessageDto[];
}

export interface SupportTicketMessageDto {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'TENANT_USER' | 'PLATFORM_ADMIN' | string;
  message: string;
  isInternalOnly: boolean;
  attachments: string[];
  createdAt: string | Date;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface PlatformAlertDto {
  id: string;
  alertNumber: string;
  severity: string;
  category: string;
  source: string;
  title: string;
  message: string;
  details?: any;
  status: string;
  acknowledgedById?: string | null;
  acknowledgedAt?: string | Date | null;
  resolvedById?: string | null;
  resolvedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PlatformOverviewMetrics {
  totalOrganizations: number;
  activeOrganizations: number;
  trialOrganizations: number;
  suspendedOrganizations: number;
  totalUsers: number;
  totalProjects: number;
  totalStorageBytes: number;
  newEnquiriesCount: number;
  openTicketsCount: number;
  activeAlertsCount: number;
  monthlyGrowthRate: number;
}
