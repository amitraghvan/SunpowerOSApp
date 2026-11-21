import { Module } from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { SalesOrdersController } from './sales-orders.controller';
import { NumberingService } from '../../common/services/numbering.service';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [AccessControlModule],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService, NumberingService],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}
