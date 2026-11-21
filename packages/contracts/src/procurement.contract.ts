import {
  RequisitionPurpose,
  RequisitionPriority,
  RequisitionStatus,
  RFQStatus,
  SupplierQuotationStatus,
  PurchaseOrderStatus,
  POApprovalStatus
} from '@solaros/types';

export interface GenerateMRPFromProjectDto {
  projectInitiationId: string;
  plannedDate?: Date;
  notes?: string;
}

export interface CreatePurchaseRequisitionDto {
  title: string;
  purpose?: RequisitionPurpose;
  priority?: RequisitionPriority;
  requiredByDate?: Date;
  projectInitiationId?: string;
  salesOrderId?: string;
  materialRequirementId?: string;
  notes?: string;
  lines: Array<{
    productVariantId: string;
    requestedQuantity: number;
    estimatedUnitCost: number;
    notes?: string;
  }>;
}

export interface ApproveRequisitionDto {
  lines?: Array<{
    lineId: string;
    approvedQuantity: number;
  }>;
  notes?: string;
}

export interface RejectRequisitionDto {
  rejectionReason: string;
}

export interface CreateRFQDto {
  title: string;
  requisitionId?: string;
  dueDate: Date;
  supplierIds: string[];
  termsAndConditions?: string;
  notes?: string;
  lines: Array<{
    productVariantId: string;
    targetQuantity: number;
    targetUnitPrice?: number;
    targetDeliveryDate?: Date;
    specifications?: string;
  }>;
}

export interface SubmitSupplierQuotationDto {
  rfqId?: string;
  supplierId: string;
  supplierQuoteReference?: string;
  validUntilDate: Date;
  currency?: string;
  deliveryLeadTimeDays: number;
  paymentTerms: string;
  warrantyTerms?: string;
  freightCharges?: number;
  otherCharges?: number;
  notes?: string;
  lines: Array<{
    rfqLineId?: string;
    productVariantId: string;
    quotedQuantity: number;
    unitPrice: number;
    taxRatePercent?: number;
    deliveryLeadTimeDays?: number;
    notes?: string;
  }>;
}

export interface AwardRFQDto {
  winningSupplierId: string;
  winningQuotationId: string;
  awardJustification?: string;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  requisitionId?: string;
  quotationId?: string;
  projectInitiationId?: string;
  salesOrderId?: string;
  expectedDeliveryDate: Date;
  billingAddress?: any;
  shippingAddress?: any;
  currency?: string;
  paymentTerms?: string;
  termsAndConditions?: string;
  freightAmount?: number;
  notes?: string;
  lines: Array<{
    productVariantId: string;
    itemDescription?: string;
    hsnCode?: string;
    orderedQuantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxRatePercent?: number;
    expectedDate?: Date;
  }>;
}

export interface CreatePORevisionDto {
  versionComments: string;
  expectedDeliveryDate?: Date;
  termsAndConditions?: string;
  notes?: string;
  lines: Array<{
    productVariantId: string;
    itemDescription?: string;
    hsnCode?: string;
    orderedQuantity: number;
    unitPrice: number;
    discountPercent?: number;
    taxRatePercent?: number;
  }>;
}

export interface ApprovePurchaseOrderDto {
  decision: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
  notes?: string;
}

export interface CreateDeliveryScheduleDto {
  purchaseOrderLineId: string;
  scheduledQuantity: number;
  scheduledDate: Date;
  courierTransporter?: string;
  trackingReference?: string;
  notes?: string;
}
