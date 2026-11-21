import {
  InventoryLocationType,
  QualityInspectionType,
  InspectionOutcome,
  InspectionAction,
  ProductSerialStatus,
  SupplierReturnType
} from '@solaros/types';

export interface CreateInventoryLocationDto {
  code: string;
  name: string;
  type: InventoryLocationType;
  address?: string;
  isDefaultReceiving?: boolean;
}

export interface CreateGoodsReceiptNoteDto {
  purchaseOrderId: string;
  supplierId: string;
  supplierInvoiceNumber?: string;
  supplierInvoiceDate?: Date;
  supplierChallanNumber?: string;
  supplierChallanDate?: Date;
  gatePassNumber?: string;
  vehicleNumber?: string;
  transporterName?: string;
  lrNumber?: string;
  receivedLocationId?: string;
  remarks?: string;
  lines: Array<{
    purchaseOrderLineId: string;
    productVariantId: string;
    challanQuantity: number;
    receivedQuantity: number;
    shortageQuantity?: number;
    damagedQuantity?: number;
    excessQuantity?: number;
    unitCost: number;
    notes?: string;
  }>;
}

export interface PerformInspectionDto {
  goodsReceiptNoteId: string;
  goodsReceiptLineId: string;
  productVariantId: string;
  inspectionType: QualityInspectionType;
  totalInspectedQuantity: number;
  passedQuantity: number;
  rejectedQuantity: number;
  conditionalQuantity?: number;
  overallOutcome: InspectionOutcome;
  checklistResults: Array<{
    item: string;
    result: 'PASS' | 'FAIL' | 'NA';
    criteria: string;
    notes?: string;
  }>;
  measurements?: Record<string, any>;
  photoEvidenceUrls?: string[];
  rejectionReasons?: string[];
  actionRecommended: InspectionAction;
  inspectorNotes?: string;
}

export interface RegisterSerialNumbersDto {
  goodsReceiptNoteId: string;
  goodsReceiptLineId?: string;
  inspectionId?: string;
  productVariantId: string;
  serials: Array<{
    manufacturerSerialNumber: string;
    barcode?: string;
    qrCode?: string;
    batchNumber?: string;
    electricalSpecs?: Record<string, any>;
    warrantyPeriodMonths?: number;
  }>;
}

export interface UpdateSerialStatusDto {
  status: ProductSerialStatus;
  storageLocationId?: string;
  notes?: string;
}

export interface CreateSupplierReturnDto {
  supplierId: string;
  goodsReceiptNoteId?: string;
  purchaseOrderId?: string;
  returnType: SupplierReturnType;
  reason: string;
  debitNoteNumber?: string;
  transporterDetails?: Record<string, any>;
  lines: Array<{
    productVariantId: string;
    goodsReceiptLineId?: string;
    returnedQuantity: number;
    unitPrice: number;
    serialNumbers?: string[];
    reason?: string;
  }>;
}
