import { PaginationQueryDto } from './pagination.contract';
import { CustomerType, CustomerStatus, AddressType, RoofType } from '@solaros/types';

export interface CreateCustomerDto {
  name: string;
  customerType?: CustomerType | string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  taxId?: string;
  notes?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  customerType?: CustomerType | string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  taxId?: string;
  status?: CustomerStatus | string;
  notes?: string;
}

export interface CreateCustomerContactDto {
  name: string;
  designation?: string;
  email?: string;
  phone: string;
  isPrimary?: boolean;
}

export interface CreateCustomerAddressDto {
  type?: AddressType | string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  isPrimary?: boolean;
}

export interface CreateCustomerSiteDto {
  siteName: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  electricityConnectionNumber?: string;
  sanctionedLoadKw?: number;
  tariffCategory?: string;
  discomName?: string;
  transformerCapacityKva?: number;
  meterNumber?: string;
  averageMonthlyUnits?: number;
  roofAreaSqFt?: number;
  roofType?: RoofType | string;
  buildingHeightFloors?: number;
  shadowFreeAreaSqFt?: number;
  notes?: string;
}

export interface CustomerFilterQueryDto extends PaginationQueryDto {
  customerType?: string;
  status?: string;
}
