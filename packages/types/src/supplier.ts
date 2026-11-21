import { SupplierCategory, SupplierType, SupplierStatus, PaymentTerms, SupplierDocumentType } from './domain-enums';

export interface Supplier {
  id: string;
  organizationId: string;
  supplierCode: string;
  legalName: string;
  tradeName?: string | null;
  category: SupplierCategory;
  supplierType: SupplierType;
  gstin?: string | null;
  pan?: string | null;
  msmeNumber?: string | null;
  status: SupplierStatus;
  paymentTerms: PaymentTerms;
  creditPeriodDays: number;
  creditLimit: number;
  currency: string;
  rating?: number | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface SupplierContact {
  id: string;
  organizationId: string;
  supplierId: string;
  name: string;
  designation?: string | null;
  department?: string | null;
  email?: string | null;
  phone: string;
  alternatePhone?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierAddress {
  id: string;
  organizationId: string;
  supplierId: string;
  type: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierBankAccount {
  id: string;
  organizationId: string;
  supplierId: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string | null;
  accountType: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierDocument {
  id: string;
  organizationId: string;
  supplierId: string;
  documentType: SupplierDocumentType;
  documentNumber?: string | null;
  fileUrl: string;
  fileName: string;
  fileSizeBytes?: number | null;
  mimeType?: string | null;
  expiryDate?: Date | null;
  verifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierProductMapping {
  id: string;
  organizationId: string;
  supplierId: string;
  productVariantId: string;
  supplierPartCode?: string | null;
  supplierPartName?: string | null;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  unitPrice: number;
  taxRatePercent: number;
  isPreferred: boolean;
  currency: string;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierPriceHistory {
  id: string;
  organizationId: string;
  supplierProductMappingId?: string | null;
  supplierId: string;
  productVariantId: string;
  oldPrice: number;
  newPrice: number;
  currency: string;
  effectiveDate: Date;
  reason?: string | null;
  changedById?: string | null;
  createdAt: Date;
}
