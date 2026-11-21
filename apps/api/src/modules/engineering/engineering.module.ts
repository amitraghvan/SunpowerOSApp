import { Module } from '@nestjs/common';
import { EngineeringService } from './engineering.service';
import { EngineeringController } from './engineering.controller';
import { CompatibilityService } from './compatibility/compatibility.service';
import { BomService } from './bom/bom.service';
import { NumberingService } from '../../common/services/numbering.service';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [AccessControlModule],
  controllers: [EngineeringController],
  providers: [
    EngineeringService,
    CompatibilityService,
    BomService,
    NumberingService,
  ],
  exports: [EngineeringService, BomService, CompatibilityService],
})
export class EngineeringModule {}
