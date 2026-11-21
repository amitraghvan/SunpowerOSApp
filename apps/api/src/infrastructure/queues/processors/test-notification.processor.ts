import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from '@solaros/config';

@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class TestNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(TestNotificationProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing BullMQ job #${job.id} [${job.name}] with payload: ${JSON.stringify(job.data)}`);

    return {
      success: true,
      jobId: job.id,
      name: job.name,
      processedAt: new Date().toISOString(),
      payload: job.data,
    };
  }
}
