import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { NumberingService } from '../../common/services/numbering.service';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [AccessControlModule],
  controllers: [ContractsController],
  providers: [ContractsService, NumberingService],
  exports: [ContractsService],
})
export class ContractsModule {}
