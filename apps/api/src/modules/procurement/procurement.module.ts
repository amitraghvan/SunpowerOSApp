import { Module } from '@nestjs/common';
import { ProcurementController } from './procurement.controller';
import { ProcurementService } from './procurement.service';
import { DatabaseModule } from '../../database/database.module';
import { NumberingService } from '../../common/services/numbering.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ProcurementController],
  providers: [ProcurementService, NumberingService],
  exports: [ProcurementService],
})
export class ProcurementModule {}
