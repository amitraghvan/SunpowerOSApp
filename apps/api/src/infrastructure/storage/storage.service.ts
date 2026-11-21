import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { STORAGE_BUCKETS } from '@solaros/config';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
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

      // Ensure default buckets exist
      await this.ensureBuckets();
    } catch (err: any) {
      this.logger.warn(`Storage client init warning: ${err.message}`);
    }
  }

  private async ensureBuckets() {
    if (!this.client) return;
    const buckets = [STORAGE_BUCKETS.DOCUMENTS, STORAGE_BUCKETS.SURVEYS, STORAGE_BUCKETS.ASSETS];
    for (const bucket of buckets) {
      try {
        const exists = await this.client.bucketExists(bucket);
        if (!exists) {
          await this.client.makeBucket(bucket, 'us-east-1');
          this.logger.log(`Created storage bucket: ${bucket}`);
        }
      } catch (e: any) {
        this.logger.warn(`Could not verify or create bucket ${bucket}: ${e.message}`);
      }
    }
  }

  async getPresignedUploadUrl(bucket: string, objectKey: string, expirySeconds = 900): Promise<string> {
    if (!this.client) {
      throw new Error('Storage client not initialized');
    }
    return this.client.presignedPutObject(bucket, objectKey, expirySeconds);
  }

  async getPresignedDownloadUrl(bucket: string, objectKey: string, expirySeconds = 3600): Promise<string> {
    if (!this.client) {
      throw new Error('Storage client not initialized');
    }
    return this.client.presignedGetObject(bucket, objectKey, expirySeconds);
  }

  async putObject(
    bucket: string,
    objectKey: string,
    data: Buffer | string,
    metaData?: Record<string, string>
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Storage client not initialized');
    }
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    await this.client.putObject(bucket, objectKey, buffer, buffer.length, metaData);
  }

  async getObject(bucket: string, objectKey: string): Promise<NodeJS.ReadableStream> {
    if (!this.client) {
      throw new Error('Storage client not initialized');
    }
    return this.client.getObject(bucket, objectKey);
  }

  getClient(): Minio.Client | null {
    return this.client;
  }

  async checkHealth(): Promise<{ status: 'UP' | 'DOWN'; latencyMs?: number; message?: string }> {
    const start = Date.now();
    if (!this.client) {
      return { status: 'DOWN', message: 'Storage client not initialized' };
    }
    try {
      await this.client.listBuckets();
      return { status: 'UP', latencyMs: Date.now() - start };
    } catch (err: any) {
      return { status: 'DOWN', message: err.message, latencyMs: Date.now() - start };
    }
  }
}
