import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';
import { StockService } from './stock.service';
import { ReservationService } from './reservation.service';
import { TransferService } from './transfer.service';
import { AdjustmentService } from './adjustment.service';
import { PickingPackingService } from './picking-packing.service';
import { DispatchService } from './dispatch.service';
import { DispatchController, DeliveryChallanController } from './dispatch.controller';
import { ReturnsService } from './returns.service';
import { InventoryOperationsController } from './inventory-operations.controller';
import { DatabaseModule } from '../../database/database.module';
import { NumberingService } from '../../common/services/numbering.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    InventoryController,
    WarehouseController,
    InventoryOperationsController,
    DispatchController,
    DeliveryChallanController,
  ],
  providers: [
    InventoryService,
    WarehouseService,
    StockService,
    ReservationService,
    TransferService,
    AdjustmentService,
    PickingPackingService,
    DispatchService,
    ReturnsService,
    NumberingService,
  ],
  exports: [
    InventoryService,
    WarehouseService,
    StockService,
    ReservationService,
    TransferService,
    AdjustmentService,
    PickingPackingService,
    DispatchService,
    ReturnsService,
  ],
})
export class InventoryModule {}
