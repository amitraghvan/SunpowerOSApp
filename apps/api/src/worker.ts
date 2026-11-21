import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * SolarOS Background Worker Entrypoint
 * Executes BullMQ queue processors, scheduled syncs, and transactional outbox poller.
 * Shares the exact same backend service modules and database connections.
 */
async function bootstrapWorker() {
  const logger = new Logger('SolarOS-Worker');
  logger.log('Starting SolarOS Background Queue Worker...');

  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();

  logger.log('SolarOS Background Queue Worker is running and listening for jobs.');
}

bootstrapWorker().catch((err) => {
  console.error('Fatal error during SolarOS Worker bootstrap:', err);
  process.exit(1);
});
