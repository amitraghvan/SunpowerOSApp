import {
  WarehouseLocationType,
  StockReservationStatus,
  ProjectAllocationStatus,
  StockTransferType,
  StockTransferStatus,
  StockCountType,
  StockCountStatus,
  StockAdjustmentType,
  StockAdjustmentStatus,
  PickingOrderStatus,
  PackingOrderStatus,
  DispatchOrderStatus,
  ProofOfDeliveryStatus,
  CustomerReturnStatus,
  RestockDecision,
  MovementType,
} from './domain-enums';

// -----------------------------------------------------------------------------
// 1. Warehouse & Location Types
// -----------------------------------------------------------------------------
export interface WarehouseRecord {
  id: string;
  organizationId: string;
  branchId?: string | null;
  code: string;
  name: string;
  address?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  managerId?: string | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  locationsCount?: number;
  managerName?: string;
  branchName?: string;
}

export interface InventoryLocationRecord {
  id: string;
  organizationId: string;
  warehouseId?: string | null;
  code: string;
  name: string;
  type: WarehouseLocationType | string;
  zone?: string | null;
  rack?: string | null;
  bin?: string | null;
  parentId?: string | null;
  address?: string | null;
  isDefaultReceiving: boolean;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// -----------------------------------------------------------------------------
// 2. Stock Visibility & Ledger Types
// -----------------------------------------------------------------------------
export interface ProductStockSummary {
  productVariantId: string;
  sku: string;
  productName: string;
  category: string;
  uom: string;
  totalReceived: number;
  onHandStock: number;
  activeReservations: number;
  availableStock: number;
  pickedStock: number;
  dispatchedStock: number;
  quarantinedStock: number;
  damagedStock: number;
  warehouseBreakdown?: {
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
    onHandStock: number;
    availableStock: number;
    reservedStock: number;
  }[];
}

export interface StockLocationDetail {
  locationId: string;
  locationCode: string;
  locationName: string;
  locationType: string;
  warehouseId?: string;
  warehouseName?: string;
  productVariantId: string;
  sku: string;
  productName: string;
  quantity: number;
  serialsCount: number;
}

// -----------------------------------------------------------------------------
// 3. Stock Reservation Types
// -----------------------------------------------------------------------------
export interface StockReservationLineRecord {
  id: string;
  organizationId: string;
  reservationId: string;
  productVariantId: string;
  warehouseId?: string | null;
  locationId?: string | null;
  bomItemId?: string | null;
  quantityRequested: number;
  quantityReserved: number;
  quantityOutstanding: number;
  quantityPicked: number;
  status: string;
  sku?: string;
  productName?: string;
}

export interface StockReservationRecord {
  id: string;
  organizationId: string;
  reservationNumber: string;
  salesOrderId?: string | null;
  projectInitiationId?: string | null;
  warehouseId?: string | null;
  reservationType: string;
  status: StockReservationStatus | string;
  allocationStatus: ProjectAllocationStatus | string;
  notes?: string | null;
  createdById?: string | null;
  releasedById?: string | null;
  releasedAt?: string | Date | null;
  expiresAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lines?: StockReservationLineRecord[];
  projectCode?: string;
  projectName?: string;
  orderNumber?: string;
  warehouseName?: string;
}

export interface ProjectStockAllocationStatus {
  projectInitiationId: string;
  projectCode: string;
  projectName: string;
  salesOrderId: string;
  orderNumber: string;
  allocationStatus: ProjectAllocationStatus;
  totalItems: number;
  allocatedItems: number;
  shortageItems: number;
  readyForPicking: boolean;
  reservationNumber?: string;
}

// -----------------------------------------------------------------------------
// 4. Warehouse Transfers
// -----------------------------------------------------------------------------
export interface StockTransferLineRecord {
  id: string;
  organizationId: string;
  transferId: string;
  productVariantId: string;
  requestedQuantity: number;
  shippedQuantity: number;
  receivedQuantity: number;
  batchNumber?: string | null;
  serialNumbers: string[];
  status: string;
  sku?: string;
  productName?: string;
}

export interface StockTransferRecord {
  id: string;
  organizationId: string;
  transferNumber: string;
  transferType: StockTransferType | string;
  sourceWarehouseId?: string | null;
  sourceLocationId?: string | null;
  destinationWarehouseId?: string | null;
  destinationLocationId?: string | null;
  status: StockTransferStatus | string;
  reason?: string | null;
  notes?: string | null;
  requestedById?: string | null;
  approvedById?: string | null;
  shippedById?: string | null;
  receivedById?: string | null;
  approvedAt?: string | Date | null;
  shippedAt?: string | Date | null;
  receivedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lines?: StockTransferLineRecord[];
  sourceWarehouseName?: string;
  destinationWarehouseName?: string;
}

// -----------------------------------------------------------------------------
// 5. Stock Counting & Adjustments
// -----------------------------------------------------------------------------
export interface StockCountLineRecord {
  id: string;
  organizationId: string;
  stockCountId: string;
  productVariantId: string;
  locationId?: string | null;
  systemQuantity: number;
  countedQuantity: number;
  varianceQuantity: number;
  notes?: string | null;
  sku?: string;
  productName?: string;
}

export interface StockCountRecord {
  id: string;
  organizationId: string;
  countNumber: string;
  warehouseId: string;
  locationId?: string | null;
  countType: StockCountType | string;
  status: StockCountStatus | string;
  countedById?: string | null;
  countedAt?: string | Date | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lines?: StockCountLineRecord[];
  warehouseName?: string;
}

export interface StockAdjustmentRecord {
  id: string;
  organizationId: string;
  adjustmentNumber: string;
  stockCountId?: string | null;
  warehouseId: string;
  locationId?: string | null;
  productVariantId: string;
  adjustmentType: StockAdjustmentType | string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  status: StockAdjustmentStatus | string;
  reason: string;
  notes?: string | null;
  movementId?: string | null;
  createdById?: string | null;
  approvedById?: string | null;
  approvedAt?: string | Date | null;
  postedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  sku?: string;
  productName?: string;
  warehouseName?: string;
}

// -----------------------------------------------------------------------------
// 6. Picking & Packing
// -----------------------------------------------------------------------------
export interface PickingOrderLineRecord {
  id: string;
  organizationId: string;
  pickingOrderId: string;
  reservationLineId?: string | null;
  productVariantId: string;
  locationId?: string | null;
  requiredQuantity: number;
  pickedQuantity: number;
  shortageQuantity: number;
  scannedSerials: string[];
  batchNumber?: string | null;
  status: string;
  sku?: string;
  productName?: string;
  locationCode?: string;
}

export interface PickingOrderRecord {
  id: string;
  organizationId: string;
  pickingNumber: string;
  reservationId?: string | null;
  salesOrderId?: string | null;
  projectInitiationId?: string | null;
  warehouseId: string;
  status: PickingOrderStatus | string;
  pickedById?: string | null;
  completedAt?: string | Date | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lines?: PickingOrderLineRecord[];
  warehouseName?: string;
  projectCode?: string;
  orderNumber?: string;
}

export interface PackingChecklistItem {
  item: string;
  verified: boolean;
  notes?: string;
}

export interface PackingOrderLineRecord {
  id: string;
  organizationId: string;
  packingOrderId: string;
  productVariantId: string;
  packedQuantity: number;
  boxNumber?: string | null;
  scannedSerials: string[];
  batchNumber?: string | null;
  sku?: string;
  productName?: string;
}

export interface PackingOrderRecord {
  id: string;
  organizationId: string;
  packingNumber: string;
  pickingOrderId?: string | null;
  salesOrderId?: string | null;
  projectInitiationId?: string | null;
  warehouseId: string;
  status: PackingOrderStatus | string;
  packageCount: number;
  totalWeightKg?: number | null;
  dimensions?: string | null;
  checklistResults: PackingChecklistItem[];
  notes?: string | null;
  packedById?: string | null;
  verifiedById?: string | null;
  verifiedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lines?: PackingOrderLineRecord[];
  warehouseName?: string;
  projectCode?: string;
}

// -----------------------------------------------------------------------------
// 7. Dispatch, Delivery Challan & POD
// -----------------------------------------------------------------------------
export interface DispatchOrderLineRecord {
  id: string;
  organizationId: string;
  dispatchOrderId: string;
  productVariantId: string;
  dispatchedQuantity: number;
  serialNumbers: string[];
  batchNumber?: string | null;
  sku?: string;
  productName?: string;
}

export interface DispatchOrderRecord {
  id: string;
  organizationId: string;
  dispatchNumber: string;
  salesOrderId: string;
  projectInitiationId?: string | null;
  warehouseId: string;
  customerId: string;
  packingOrderId?: string | null;
  deliveryAddress: string;
  status: DispatchOrderStatus | string;
  dispatchDate?: string | Date | null;
  expectedDeliveryDate?: string | Date | null;
  transporterName?: string | null;
  vehicleNumber?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  shippingNotes?: string | null;
  approvedById?: string | null;
  approvedAt?: string | Date | null;
  dispatchedById?: string | null;
  dispatchedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lines?: DispatchOrderLineRecord[];
  customerName?: string;
  projectCode?: string;
  orderNumber?: string;
  warehouseName?: string;
  challanNumber?: string;
  isDelivered?: boolean;
}

export interface DeliveryChallanRecord {
  id: string;
  organizationId: string;
  challanNumber: string;
  dispatchOrderId: string;
  salesOrderId: string;
  projectInitiationId?: string | null;
  customerId: string;
  challanDate: string | Date;
  transporterName?: string | null;
  vehicleNumber?: string | null;
  receiverName?: string | null;
  receiverPhone?: string | null;
  deliverySite: string;
  termsAndConditions?: string | null;
  createdById?: string | null;
  createdAt: string | Date;
  customerName?: string;
  dispatchNumber?: string;
  orderNumber?: string;
  projectCode?: string;
}

export interface ProofOfDeliveryRecord {
  id: string;
  organizationId: string;
  dispatchOrderId: string;
  deliveryChallanId?: string | null;
  deliveredAt: string | Date;
  receiverName: string;
  receiverPhone?: string | null;
  receiverSignatureUrl?: string | null;
  proofDocumentUrls: string[];
  isDamaged: boolean;
  damageDescription?: string | null;
  shortageQuantity: number;
  notes?: string | null;
  status: ProofOfDeliveryStatus | string;
  recordedById?: string | null;
  createdAt: string | Date;
  dispatchNumber?: string;
}

// -----------------------------------------------------------------------------
// 8. Customer & Project Returns
// -----------------------------------------------------------------------------
export interface CustomerReturnLineRecord {
  id: string;
  organizationId: string;
  customerReturnId: string;
  productVariantId: string;
  returnedQuantity: number;
  inspectedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  serialNumbers: string[];
  status: string;
  notes?: string | null;
  sku?: string;
  productName?: string;
}

export interface CustomerReturnRecord {
  id: string;
  organizationId: string;
  returnNumber: string;
  salesOrderId?: string | null;
  projectInitiationId?: string | null;
  customerId: string;
  warehouseId: string;
  status: CustomerReturnStatus | string;
  returnReason: string;
  inspectionNotes?: string | null;
  restockDecision?: RestockDecision | string | null;
  createdById?: string | null;
  inspectedById?: string | null;
  inspectedAt?: string | Date | null;
  receivedAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lines?: CustomerReturnLineRecord[];
  customerName?: string;
  warehouseName?: string;
  projectCode?: string;
}
