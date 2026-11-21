import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL via Prisma ORM.');
    } catch (err: any) {
      this.logger.warn(`Initial database connection attempt failed: ${err.message}. Connection will be retried on request.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL.');
  }

  async checkHealth(): Promise<{ status: 'UP' | 'DOWN'; latencyMs?: number; message?: string }> {
    const start = Date.now();
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: 'UP', latencyMs: Date.now() - start };
    } catch (err: any) {
      return { status: 'DOWN', message: err.message, latencyMs: Date.now() - start };
    }
  }
}
