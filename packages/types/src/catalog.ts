import { ProductType, AttributeDataType } from './domain-enums';

export interface IProductCategory {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IManufacturer {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  country?: string | null;
  website?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IProductVariant {
  id: string;
  organizationId: string;
  productId: string;
  sku: string;
  name: string;
  ratedCapacityWatts?: number | null;
  systemVoltage?: number | null;
  costPrice: number;
  sellingPrice: number;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IProductAttributeDefinition {
  id: string;
  organizationId: string;
  categoryId: string;
  name: string;
  code: string;
  dataType: AttributeDataType | string;
  unit?: string | null;
  isRequired: boolean;
  options?: any;
  createdAt: Date | string;
}

export interface IProductAttributeValue {
  id: string;
  organizationId: string;
  productId: string;
  attributeDefinitionId: string;
  valueString?: string | null;
  valueNumber?: number | null;
  valueBoolean?: boolean | null;
}

export interface IProductPriceHistory {
  id: string;
  organizationId: string;
  variantId: string;
  costPrice: number;
  sellingPrice: number;
  effectiveFrom: Date | string;
  effectiveTo?: Date | string | null;
  changedById?: string | null;
  reason?: string | null;
  createdAt: Date | string;
}

export interface IProduct {
  id: string;
  organizationId: string;
  categoryId: string;
  manufacturerId: string;
  code: string;
  name: string;
  modelNumber: string;
  description?: string | null;
  type: ProductType | string;
  warrantyYears: number;
  datasheetUrl?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  category?: IProductCategory;
  manufacturer?: IManufacturer;
  variants?: IProductVariant[];
  attributeValues?: IProductAttributeValue[];
}
