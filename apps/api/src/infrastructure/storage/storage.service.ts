import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { STORAGE_BUCKETS } from '@solaros/config';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const endPoint = this.configService.get<string>('STORAGE_ENDPOINT', 'localhost');
    const port = Number(this.configService.get<number>('STORAGE_PORT', 9000));
    const useSSL = this.configService.get<string>('STORAGE_USE_SSL', 'false') === 'true';
    const accessKey = this.configService.get<string>('STORAGE_ACCESS_KEY', 'minioadmin');
    const secretKey = this.configService.get<string>('STORAGE_SECRET_KEY', 'minioadmin');

    try {
      this.client = new Minio.Client({
        endPoint,
        port,
        useSSL,
        accessKey,
        secretKey,
      });
      this.logger.log(`Object Storage client configured for endpoint: ${endPoint}:${port}`);
    } catch (err: any) {
      this.logger.warn(`Storage client init warning: ${err.message}`);
    }
  }

  async checkHealth(): Promise<{ status: 'UP' | 'DOWN'; latencyMs?: number; message?: string }> {
    const start = Date.now();
    if (!this.client) {
      return { status: 'DOWN', message: 'Storage client not initialized' };
    }
    try {
      // Check list buckets to verify connectivity and credentials
      await this.client.listBuckets();
      return { status: 'UP', latencyMs: Date.now() - start };
    } catch (err: any) {
      return { status: 'DOWN', message: err.message, latencyMs: Date.now() - start };
    }
  }
}
