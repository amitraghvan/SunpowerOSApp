import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { StorageService } from '../storage/storage.service';
import { HealthCheckResponse } from '@solaros/contracts';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'System & Dependency Health Check' })
  @ApiResponse({ status: 200, description: 'Real status of DB, Redis, and Object Storage' })
  async checkHealth(): Promise<HealthCheckResponse> {
    const timestamp = new Date().toISOString();
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    const [dbResult, redisResult, storageResult] = await Promise.all([
      this.prisma.checkHealth(),
      this.redis.checkHealth(),
      this.storage.checkHealth(),
    ]);

    const dependencies = {
      database: {
        status: dbResult.status,
        latencyMs: dbResult.latencyMs,
        message: dbResult.message,
        timestamp,
      },
      redis: {
        status: redisResult.status,
        latencyMs: redisResult.latencyMs,
        message: redisResult.message,
        timestamp,
      },
      storage: {
        status: storageResult.status,
        latencyMs: storageResult.latencyMs,
        message: storageResult.message,
        timestamp,
      },
    };

    const isHealthy =
      dbResult.status === 'UP' &&
      redisResult.status === 'UP' &&
      storageResult.status === 'UP';

    const isDegraded =
      !isHealthy &&
      (dbResult.status === 'UP' || redisResult.status === 'UP' || storageResult.status === 'UP');

    const overallStatus = isHealthy ? 'healthy' : isDegraded ? 'degraded' : 'unhealthy';

    return {
      status: overallStatus,
      timestamp,
      uptimeSeconds,
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      dependencies,
    };
  }
}
