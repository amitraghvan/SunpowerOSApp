import {
  InventoryLocationType,
  GRNStatus,
  LineInspectionStatus,
  QualityInspectionType,
  InspectionOutcome,
  InspectionAction,
  ProductSerialStatus,
  MovementType,
  SupplierReturnStatus,
  SupplierReturnType
} from './domain-enums';

export interface InventoryLocation {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  type: InventoryLocationType;
  address?: string | null;
  isDefaultReceiving: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoodsReceiptNote {
  id: string;
  organizationId: string;
  grnNumber: string;
  purchaseOrderId: string;
  supplierId: string;
  supplierInvoiceNumber?: string | null;
  supplierInvoiceDate?: Date | null;
  supplierChallanNumber?: string | null;
  supplierChallanDate?: Date | null;
  gatePassNumber?: string | null;
  vehicleNumber?: string | null;
  transporterName?: string | null;
  lrNumber?: string | null;
  receivedDate: Date;
  status: GRNStatus;
  receivedById?: string | null;
  receivedLocationId?: string | null;
  remarks?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoodsReceiptLine {
  id: string;
  organizationId: string;
  goodsReceiptNoteId: string;
  purchaseOrderLineId: string;
  productVariantId: string;
  challanQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  shortageQuantity: number;
  damagedQuantity: number;
  excessQuantity: number;
  unitCost: number;
  inspectionStatus: LineInspectionStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualityInspection {
  id: string;
  organizationId: string;
  inspectionNumber: string;
  goodsReceiptNoteId: string;
  goodsReceiptLineId: string;
  productVariantId: string;
  inspectionType: QualityInspectionType;
  totalInspectedQuantity: number;
  passedQuantity: number;
  rejectedQuantity: number;
  conditionalQuantity: number;
  overallOutcome: InspectionOutcome;
  checklistResults: Array<{ item: string; result: 'PASS' | 'FAIL' | 'NA'; criteria: string; notes?: string }>;
  measurements?: Record<string, any> | null;
  photoEvidenceUrls: string[];
  rejectionReasons: string[];
  actionRecommended: InspectionAction;
  inspectedById?: string | null;
  inspectedAt: Date;
  inspectorNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSerial {
  id: string;
  organizationId: string;
  productVariantId: string;
  goodsReceiptNoteId: string;
  goodsReceiptLineId?: string | null;
  inspectionId?: string | null;
  manufacturerSerialNumber: string;
  internalAssetCode: string;
  barcode?: string | null;
  qrCode?: string | null;
  batchNumber?: string | null;
  status: ProductSerialStatus;
  storageLocationId?: string | null;
  electricalSpecs?: Record<string, any> | null;
  warrantyPeriodMonths: number;
  warrantyExpiresAt?: Date | null;
  commissionedAt?: Date | null;
  registeredById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryReceiptMovement {
  id: string;
  organizationId: string;
  movementNumber: string;
  movementType: MovementType;
  productVariantId: string;
  fromLocationId?: string | null;
  toLocationId?: string | null;
  quantity: number;
  unitCost: number;
  totalValue: number;
  referenceType: string;
  referenceId: string;
  batchNumber?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: Date;
}

export interface SupplierReturn {
  id: string;
  organizationId: string;
  returnNumber: string;
  supplierId: string;
  goodsReceiptNoteId?: string | null;
  purchaseOrderId?: string | null;
  status: SupplierReturnStatus;
  returnType: SupplierReturnType;
  totalReturnAmount: number;
  dispatchDate?: Date | null;
  transporterDetails?: Record<string, any> | null;
  debitNoteNumber?: string | null;
  creditNoteNumber?: string | null;
  reason: string;
  createdById?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupplierReturnLine {
  id: string;
  organizationId: string;
  supplierReturnId: string;
  productVariantId: string;
  goodsReceiptLineId?: string | null;
  returnedQuantity: number;
  unitPrice: number;
  totalAmount: number;
  serialNumbers: string[];
  reason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
