import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    try {
      this.client = new Redis({
        host,
        port,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });

      this.client.on('error', (err) => {
        this.logger.debug(`Redis client status: ${err.message}`);
      });

      this.client.connect().catch((err) => {
        this.logger.warn(`Redis connection deferred: ${err.message}`);
      });
    } catch (err: any) {
      this.logger.warn(`Redis initialization warning: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis client disconnected.');
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  async checkHealth(): Promise<{ status: 'UP' | 'DOWN'; latencyMs?: number; message?: string }> {
    const start = Date.now();
    if (!this.client) {
      return { status: 'DOWN', message: 'Redis client not initialized' };
    }
    try {
      const pong = await this.client.ping();
      if (pong === 'PONG') {
        return { status: 'UP', latencyMs: Date.now() - start };
      }
      return { status: 'DOWN', message: `Unexpected response: ${pong}`, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { status: 'DOWN', message: err.message, latencyMs: Date.now() - start };
    }
  }
}
