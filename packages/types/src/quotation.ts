import { QuotationStatus, AcceptanceMethod } from './domain-enums';
import { CostEstimateDto } from './pricing';

export interface QuotationItemDto {
  id?: string;
  itemCategory: string;
  description: string;
  quantity: number;
  uom: string;
  unitPrice: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  sortOrder?: number;
}

export interface QuotationResponseDto {
  id: string;
  quotationNumber: string;
  customerId: string;
  siteId: string;
  designId: string;
  bomId: string;
  activeVersionNumber: number;
  status: QuotationStatus;
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  subsidyAmount: number;
  netCustomerPayable: number;
  validUntil: string;
  scopeOfWork: string;
  paymentTerms: Record<string, any>;
  warrantyTerms?: string;
  acceptanceDate?: string;
  acceptanceMethod?: AcceptanceMethod;
  acceptanceEvidenceUrl?: string;
  items: QuotationItemDto[];
  costEstimate?: CostEstimateDto;
  createdAt: string;
  updatedAt: string;
}
