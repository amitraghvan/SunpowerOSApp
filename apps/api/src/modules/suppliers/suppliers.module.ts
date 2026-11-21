import { Module } from '@nestjs/common';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { DatabaseModule } from '../../database/database.module';
import { NumberingService } from '../../common/services/numbering.service';

@Module({
  imports: [DatabaseModule],
  controllers: [SuppliersController],
  providers: [SuppliersService, NumberingService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
