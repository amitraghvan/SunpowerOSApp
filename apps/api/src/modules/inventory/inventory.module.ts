import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { DatabaseModule } from '../../database/database.module';
import { NumberingService } from '../../common/services/numbering.service';

@Module({
  imports: [DatabaseModule],
  controllers: [InventoryController],
  providers: [InventoryService, NumberingService],
  exports: [InventoryService],
})
export class InventoryModule {}
