import { AcceptanceMethod } from '@solaros/types';

export interface CreateQuotationDto {
  customerId: string;
  siteId: string;
  designId: string;
  bomId: string;
  discountPercent?: number;
  discountAmount?: number;
  validDays?: number;
  scopeOfWork?: string;
  paymentTerms?: Record<string, any>;
  warrantyTerms?: string;
}

export interface RecordQuotationAcceptanceDto {
  acceptanceMethod: AcceptanceMethod;
  acceptanceEvidenceUrl?: string;
  acceptedByCustomerName: string;
  notes?: string;
}
