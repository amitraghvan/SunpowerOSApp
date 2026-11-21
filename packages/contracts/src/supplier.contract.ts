import { SupplierCategory, SupplierType, SupplierStatus, PaymentTerms, SupplierDocumentType } from '@solaros/types';

export interface CreateSupplierDto {
  supplierCode?: string;
  legalName: string;
  tradeName?: string;
  category: SupplierCategory;
  supplierType: SupplierType;
  gstin?: string;
  pan?: string;
  msmeNumber?: string;
  paymentTerms?: PaymentTerms;
  creditPeriodDays?: number;
  creditLimit?: number;
  currency?: string;
  notes?: string;
}

export interface UpdateSupplierDto {
  legalName?: string;
  tradeName?: string;
  category?: SupplierCategory;
  supplierType?: SupplierType;
  gstin?: string;
  pan?: string;
  msmeNumber?: string;
  status?: SupplierStatus;
  paymentTerms?: PaymentTerms;
  creditPeriodDays?: number;
  creditLimit?: number;
  currency?: string;
  rating?: number;
  notes?: string;
  isActive?: boolean;
}

export interface CreateSupplierContactDto {
  name: string;
  designation?: string;
  department?: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  isPrimary?: boolean;
}

export interface CreateSupplierAddressDto {
  type: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface CreateSupplierBankAccountDto {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string;
  accountType?: string;
  isPrimary?: boolean;
}

export interface CreateSupplierDocumentDto {
  documentType: SupplierDocumentType;
  documentNumber?: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes?: number;
  mimeType?: string;
  expiryDate?: Date;
}

export interface CreateSupplierProductMappingDto {
  productVariantId: string;
  supplierPartCode?: string;
  supplierPartName?: string;
  leadTimeDays?: number;
  minimumOrderQuantity?: number;
  unitPrice: number;
  taxRatePercent?: number;
  isPreferred?: boolean;
  currency?: string;
  effectiveFrom?: Date;
  effectiveTo?: Date;
}

export interface UpdateSupplierProductMappingDto {
  supplierPartCode?: string;
  supplierPartName?: string;
  leadTimeDays?: number;
  minimumOrderQuantity?: number;
  unitPrice?: number;
  taxRatePercent?: number;
  isPreferred?: boolean;
  currency?: string;
  effectiveTo?: Date;
  isActive?: boolean;
  priceChangeReason?: string;
}
