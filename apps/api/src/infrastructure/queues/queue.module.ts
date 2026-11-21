import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from '@solaros/config';
import { TestNotificationProcessor } from './processors/test-notification.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          lazyConnect: true,
          maxRetriesPerRequest: null,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.NOTIFICATIONS },
      { name: QUEUE_NAMES.DOCUMENTS },
      { name: QUEUE_NAMES.PDF_GENERATION },
      { name: QUEUE_NAMES.REPORTS },
      { name: QUEUE_NAMES.AI_PROCESSING }
    ),
  ],
  providers: [TestNotificationProcessor],
  exports: [BullModule, TestNotificationProcessor],
})
export class QueueModule {}
