import {
  WarehouseLocationType,
  StockTransferType,
  StockCountType,
  StockAdjustmentType,
  RestockDecision,
} from '@solaros/types';

// =============================================================================
// 1. Warehouse & Location DTO Interfaces
// =============================================================================

export interface CreateWarehouseDto {
  code: string;
  name: string;
  branchId?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  managerId?: string;
}

export interface UpdateWarehouseDto {
  name?: string;
  branchId?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  managerId?: string;
  isActive?: boolean;
}

export interface CreateWarehouseLocationDto {
  code: string;
  name: string;
  type?: WarehouseLocationType | string;
  zone?: string;
  rack?: string;
  bin?: string;
  parentId?: string;
  address?: string;
  isDefaultReceiving?: boolean;
}

// =============================================================================
// 2. Stock Reservation DTO Interfaces
// =============================================================================

export interface StockReservationLineDto {
  productVariantId: string;
  quantityRequested: number;
  bomItemId?: string;
  warehouseId?: string;
}

export interface CreateStockReservationDto {
  salesOrderId?: string;
  projectInitiationId?: string;
  warehouseId?: string;
  notes?: string;
  lines?: StockReservationLineDto[];
}

export interface ReleaseStockReservationDto {
  reason?: string;
}

// =============================================================================
// 3. Warehouse Transfers
// =============================================================================

export interface StockTransferLineDto {
  productVariantId: string;
  requestedQuantity: number;
  batchNumber?: string;
  serialNumbers?: string[];
}

export interface CreateStockTransferDto {
  transferType?: StockTransferType | string;
  sourceWarehouseId?: string;
  sourceLocationId?: string;
  destinationWarehouseId?: string;
  destinationLocationId?: string;
  reason?: string;
  notes?: string;
  lines: StockTransferLineDto[];
}

export interface ShipStockTransferDto {
  notes?: string;
}

export interface ReceiveStockTransferDto {
  notes?: string;
}

// =============================================================================
// 4. Stock Count & Adjustments
// =============================================================================

export interface StockCountLineDto {
  productVariantId: string;
  countedQuantity: number;
  locationId?: string;
  notes?: string;
}

export interface CreateStockCountDto {
  warehouseId: string;
  locationId?: string;
  countType?: StockCountType | string;
  notes?: string;
  lines?: StockCountLineDto[];
}

export interface SubmitStockCountDto {
  lines: StockCountLineDto[];
  notes?: string;
}

export interface CreateStockAdjustmentDto {
  warehouseId: string;
  productVariantId: string;
  locationId?: string;
  adjustmentType: StockAdjustmentType | string;
  quantity: number;
  unitCost?: number;
  reason: string;
  notes?: string;
  stockCountId?: string;
}

export interface ApproveStockAdjustmentDto {
  notes?: string;
}

// =============================================================================
// 5. Picking & Packing DTO Interfaces
// =============================================================================

export interface PickingLineConfirmDto {
  pickingOrderLineId: string;
  pickedQuantity: number;
  scannedSerials?: string[];
  batchNumber?: string;
}

export interface CreatePickingOrderDto {
  warehouseId: string;
  reservationId?: string;
  salesOrderId?: string;
  projectInitiationId?: string;
  notes?: string;
}

export interface ConfirmPickingOrderDto {
  lines: PickingLineConfirmDto[];
  notes?: string;
}

export interface PackingChecklistItemDto {
  item: string;
  verified: boolean;
  notes?: string;
}

export interface CreatePackingOrderDto {
  warehouseId: string;
  pickingOrderId?: string;
  salesOrderId?: string;
  projectInitiationId?: string;
  packageCount?: number;
  totalWeightKg?: number;
  dimensions?: string;
  checklistResults?: PackingChecklistItemDto[];
  notes?: string;
}

export interface ConfirmPackingOrderDto {
  packageCount?: number;
  totalWeightKg?: number;
  dimensions?: string;
  checklistResults?: PackingChecklistItemDto[];
  notes?: string;
}

// =============================================================================
// 6. Dispatch, Delivery Challan & POD DTO Interfaces
// =============================================================================

export interface DispatchOrderLineDto {
  productVariantId: string;
  dispatchedQuantity: number;
  serialNumbers?: string[];
  batchNumber?: string;
}

export interface CreateDispatchOrderDto {
  salesOrderId: string;
  warehouseId: string;
  customerId: string;
  deliveryAddress: string;
  projectInitiationId?: string;
  packingOrderId?: string;
  transporterName?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  shippingNotes?: string;
  lines?: DispatchOrderLineDto[];
}

export interface CreateDeliveryChallanDto {
  dispatchOrderId: string;
  transporterName?: string;
  vehicleNumber?: string;
  receiverName?: string;
  receiverPhone?: string;
  deliverySite?: string;
  termsAndConditions?: string;
}

export interface ConfirmDeliveryDto {
  receiverName: string;
  receiverPhone?: string;
  receiverSignatureUrl?: string;
  proofDocumentUrls?: string[];
  isDamaged?: boolean;
  damageDescription?: string;
  shortageQuantity?: number;
  notes?: string;
}

// =============================================================================
// 7. Customer Returns DTO Interfaces
// =============================================================================

export interface CustomerReturnLineDto {
  productVariantId: string;
  returnedQuantity: number;
  serialNumbers?: string[];
  notes?: string;
}

export interface CreateCustomerReturnDto {
  customerId: string;
  warehouseId: string;
  returnReason: string;
  salesOrderId?: string;
  projectInitiationId?: string;
  lines: CustomerReturnLineDto[];
}

export interface InspectCustomerReturnDto {
  restockDecision: RestockDecision | string;
  inspectionNotes?: string;
  acceptedQuantity?: number;
  rejectedQuantity?: number;
}
