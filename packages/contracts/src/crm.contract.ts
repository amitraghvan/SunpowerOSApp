import { PaginationQueryDto } from './pagination.contract';
import { LeadStatus, LeadSource, SolarSystemType, LeadActivityType } from '@solaros/types';

export interface CreateLeadDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  city: string;
  state: string;
  postalCode?: string;
  source?: LeadSource | string;
  systemType?: SolarSystemType | string;
  estimatedMonthlyBill?: number;
  estimatedRoofAreaSqFt?: number;
  estimatedCapacityKw?: number;
  budget?: number;
  notes?: string;
  assignedToId?: string;
  branchId?: string;
}

export interface UpdateLeadDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  source?: LeadSource | string;
  systemType?: SolarSystemType | string;
  estimatedMonthlyBill?: number;
  estimatedRoofAreaSqFt?: number;
  estimatedCapacityKw?: number;
  budget?: number;
  score?: number;
  notes?: string;
  assignedToId?: string;
  branchId?: string;
  qualificationDetails?: Record<string, any>;
}

export interface ChangeLeadStatusDto {
  status: LeadStatus | string;
  reason?: string;
}

export interface CreateLeadActivityDto {
  type: LeadActivityType | string;
  summary: string;
  details?: string;
  scheduledAt?: string;
  completedAt?: string;
}

export interface ConvertLeadDto {
  customerType?: string;
  taxId?: string;
  siteName?: string;
  roofType?: string;
  sanctionedLoadKw?: number;
  electricityConnectionNumber?: string;
}

export interface LeadFilterQueryDto extends PaginationQueryDto {
  status?: string;
  source?: string;
  assignedToId?: string;
  branchId?: string;
  systemType?: string;
}
