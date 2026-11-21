import { LeadStatus, LeadSource, SolarSystemType, LeadActivityType } from './domain-enums';

export interface ILead {
  id: string;
  organizationId: string;
  branchId?: string | null;
  leadNumber: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  alternatePhone?: string | null;
  address?: string | null;
  city: string;
  state: string;
  postalCode?: string | null;
  source: LeadSource | string;
  status: LeadStatus | string;
  systemType: SolarSystemType | string;
  estimatedMonthlyBill?: number | null;
  estimatedRoofAreaSqFt?: number | null;
  estimatedCapacityKw?: number | null;
  budget?: number | null;
  score: number;
  lostReason?: string | null;
  qualificationDetails?: Record<string, any> | null;
  notes?: string | null;
  assignedToId?: string | null;
  convertedCustomerId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}

export interface ILeadActivity {
  id: string;
  organizationId: string;
  leadId: string;
  userId?: string | null;
  type: LeadActivityType | string;
  summary: string;
  details?: string | null;
  scheduledAt?: Date | string | null;
  completedAt?: Date | string | null;
  createdAt: Date | string;
}

export interface ILeadStatusHistory {
  id: string;
  organizationId: string;
  leadId: string;
  fromStatus: string;
  toStatus: string;
  changedById?: string | null;
  reason?: string | null;
  createdAt: Date | string;
}

export interface ILeadDuplicateCheckResult {
  isDuplicate: boolean;
  matchingField?: 'phone' | 'email' | null;
  existingLeadId?: string | null;
  existingLeadNumber?: string | null;
}

export interface ILeadConversionResult {
  success: boolean;
  customerId: string;
  customerNumber: string;
  contactId: string;
  siteId: string;
  leadId: string;
}

export interface ICrmAnalytics {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRatePercent: number;
  averageDealSizeKw: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
}
