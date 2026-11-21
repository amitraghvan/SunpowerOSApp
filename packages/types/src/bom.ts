import { BOMStatus, BOMCategory } from './domain-enums';

export interface BOMItemDto {
  id?: string;
  category: BOMCategory;
  variantId?: string;
  itemCode: string;
  description: string;
  quantity: number;
  uom: string;
  wastageAllowancePercent: number;
  effectiveQuantity: number;
  unitCost: number;
  totalCost: number;
  isOptional?: boolean;
  specifications?: Record<string, any>;
}

export interface BOMResponseDto {
  id: string;
  bomNumber: string;
  designId: string;
  revisionNumber: number;
  version: number;
  status: BOMStatus;
  totalMaterialCost: number;
  currency: string;
  notes?: string;
  items: BOMItemDto[];
  createdAt: string;
  updatedAt: string;
}
