import {
  MaterialRequirementStatus,
  RequisitionStatus,
  RequisitionPriority,
  RequisitionPurpose,
  RFQStatus,
  RFQSupplierStatus,
  SupplierQuotationStatus,
  PurchaseOrderStatus,
  POApprovalStatus,
  DeliveryScheduleStatus
} from './domain-enums';

export interface MaterialRequirement {
  id: string;
  organizationId: string;
  requirementNumber: string;
  title: string;
  projectInitiationId?: string | null;
  salesOrderId?: string | null;
  bomId?: string | null;
  status: MaterialRequirementStatus;
  totalItems: number;
  estimatedTotalAmount: number;
  plannedDate?: Date | null;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaterialRequirementLine {
  id: string;
  organizationId: string;
  materialRequirementId: string;
  productVariantId: string;
  category?: string | null;
  requiredQuantity: number;
  existingStockQuantity: number;
  allocatedStockQuantity: number;
  netProcurementQuantity: number;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  unitOfMeasure: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseRequisition {
  id: string;
  organizationId: string;
  requisitionNumber: string;
  title: string;
  purpose: RequisitionPurpose;
  status: RequisitionStatus;
  priority: RequisitionPriority;
  requiredByDate?: Date | null;
  projectInitiationId?: string | null;
  salesOrderId?: string | null;
  materialRequirementId?: string | null;
  requestedById?: string | null;
  approvedById?: string | null;
  approvedAt?: Date | null;
  rejectionReason?: string | null;
  totalEstimatedAmount: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseRequisitionLine {
  id: string;
  organizationId: string;
  purchaseRequisitionId: string;
  productVariantId: string;
  requestedQuantity: number;
  approvedQuantity: number;
  orderedQuantity: number;
  estimatedUnitCost: number;
  estimatedTotalCost: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RFQ {
  id: string;
  organizationId: string;
  rfqNumber: string;
  title: string;
  requisitionId?: string | null;
  status: RFQStatus;
  issueDate: Date;
  dueDate: Date;
  awardedSupplierId?: string | null;
  termsAndConditions?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RFQLine {
  id: string;
  organizationId: string;
  rfqId: string;
  productVariantId: string;
  targetQuantity: number;
  targetUnitPrice?: number | null;
  targetDeliveryDate?: Date | null;
  specifications?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RFQSupplier {
  id: string;
  organizationId: string;
  rfqId: string;
  supplierId: string;
  invitationStatus: RFQSupplierStatus;
  invitedAt: Date;
  respondedAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
}

export interface SupplierQuotation {
  id: string;
  organizationId: string;
  quotationNumber: string;
  rfqId?: string | null;
  supplierId: string;
  supplierQuoteReference?: string | null;
  quotationDate: Date;
  validUntilDate: Date;
  currency: string;
  subtotalAmount: number;
  taxAmount: number;
  freightCharges: number;
  otherCharges: number;
  totalAmount: number;
  deliveryLeadTimeDays: number;
  paymentTerms: string;
  warrantyTerms?: string | null;
  status: SupplierQuotationStatus;
  comparisonRank?: number | null;
  isWinning: boolean;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierQuotationLine {
  id: string;
  organizationId: string;
  supplierQuotationId: string;
  rfqLineId?: string | null;
  productVariantId: string;
  quotedQuantity: number;
  unitPrice: number;
  taxRatePercent: number;
  taxAmount: number;
  totalPrice: number;
  deliveryLeadTimeDays?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  organizationId: string;
  poNumber: string;
  version: number;
  originalPoId?: string | null;
  requisitionId?: string | null;
  quotationId?: string | null;
  supplierId: string;
  projectInitiationId?: string | null;
  salesOrderId?: string | null;
  status: PurchaseOrderStatus;
  approvalStatus: POApprovalStatus;
  orderDate: Date;
  expectedDeliveryDate: Date;
  billingAddress?: any;
  shippingAddress?: any;
  currency: string;
  subtotalAmount: number;
  taxAmount: number;
  freightAmount: number;
  roundOff: number;
  totalAmount: number;
  paymentTerms: string;
  termsAndConditions?: string | null;
  notes?: string | null;
  versionComments?: string | null;
  createdById?: string | null;
  approvedById?: string | null;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderLine {
  id: string;
  organizationId: string;
  purchaseOrderId: string;
  productVariantId: string;
  itemDescription?: string | null;
  hsnCode?: string | null;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRatePercent: number;
  taxAmount: number;
  totalAmount: number;
  expectedDate?: Date | null;
  isFullyReceived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseDeliverySchedule {
  id: string;
  organizationId: string;
  purchaseOrderId: string;
  purchaseOrderLineId: string;
  scheduledQuantity: number;
  scheduledDate: Date;
  receivedQuantity: number;
  status: DeliveryScheduleStatus;
  trackingReference?: string | null;
  courierTransporter?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
