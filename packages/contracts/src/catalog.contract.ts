import { PaginationQueryDto } from './pagination.contract';
import { ProductType, AttributeDataType } from '@solaros/types';

export interface CreateCategoryDto {
  code: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface CreateManufacturerDto {
  code: string;
  name: string;
  country?: string;
  website?: string;
  supportEmail?: string;
  supportPhone?: string;
}

export interface CreateProductDto {
  categoryId: string;
  manufacturerId: string;
  code: string;
  name: string;
  modelNumber: string;
  description?: string;
  type: ProductType | string;
  warrantyYears?: number;
  datasheetUrl?: string;
}

export interface CreateVariantDto {
  productId: string;
  sku: string;
  name: string;
  ratedCapacityWatts?: number;
  systemVoltage?: number;
  costPrice: number;
  sellingPrice: number;
  currency?: string;
  isDefault?: boolean;
}

export interface CreateAttributeDefinitionDto {
  categoryId: string;
  name: string;
  code: string;
  dataType: AttributeDataType | string;
  unit?: string;
  isRequired?: boolean;
  options?: any;
}

export interface SetAttributeValuesDto {
  attributes: Array<{
    attributeDefinitionId: string;
    valueString?: string;
    valueNumber?: number;
    valueBoolean?: boolean;
  }>;
}

export interface UpdatePriceDto {
  costPrice: number;
  sellingPrice: number;
  reason?: string;
}

export interface CatalogFilterQueryDto extends PaginationQueryDto {
  categoryId?: string;
  manufacturerId?: string;
  type?: string;
  isActive?: boolean;
}
