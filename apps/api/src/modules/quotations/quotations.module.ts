import { Module } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import { PricingService } from './pricing.service';
import { NumberingService } from '../../common/services/numbering.service';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [AccessControlModule],
  controllers: [QuotationsController],
  providers: [QuotationsService, PricingService, NumberingService],
  exports: [QuotationsService, PricingService],
})
export class QuotationsModule {}
