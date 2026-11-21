import { CustomerType, CustomerStatus, AddressType, RoofType } from './domain-enums';
import { ILead } from './crm';

export interface ICustomer {
  id: string;
  organizationId: string;
  customerNumber: string;
  customerType: CustomerType | string;
  name: string;
  email?: string | null;
  phone: string;
  alternatePhone?: string | null;
  taxId?: string | null;
  status: CustomerStatus | string;
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  deletedAt?: Date | string | null;
}

export interface ICustomerContact {
  id: string;
  organizationId: string;
  customerId: string;
  name: string;
  designation?: string | null;
  email?: string | null;
  phone: string;
  isPrimary: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICustomerAddress {
  id: string;
  organizationId: string;
  customerId: string;
  type: AddressType | string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  isPrimary: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICustomerSite {
  id: string;
  organizationId: string;
  customerId: string;
  siteName: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number | null;
  longitude?: number | null;
  electricityConnectionNumber?: string | null;
  sanctionedLoadKw?: number | null;
  tariffCategory?: string | null;
  discomName?: string | null;
  transformerCapacityKva?: number | null;
  meterNumber?: string | null;
  averageMonthlyUnits?: number | null;
  roofAreaSqFt?: number | null;
  roofType?: RoofType | string | null;
  buildingHeightFloors?: number | null;
  shadowFreeAreaSqFt?: number | null;
  notes?: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ICustomer360 extends ICustomer {
  contacts: ICustomerContact[];
  addresses: ICustomerAddress[];
  sites: ICustomerSite[];
  convertedLead?: ILead | null;
  surveys?: any[];
  quotations?: any[];
  projects?: any[];
  activityTimeline: Array<{
    id: string;
    type: string;
    timestamp: Date | string;
    summary: string;
    metadata?: Record<string, any>;
  }>;
}
