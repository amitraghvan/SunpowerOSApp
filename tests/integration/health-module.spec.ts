import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../apps/api/src/infrastructure/health/health.controller';
import { PrismaService } from '../../apps/api/src/database/prisma.service';
import { RedisService } from '../../apps/api/src/infrastructure/redis/redis.service';
import { StorageService } from '../../apps/api/src/infrastructure/storage/storage.service';

describe('HealthController Integration', () => {
  let healthController: HealthController;
  let prismaService: jest.Mocked<Partial<PrismaService>>;
  let redisService: jest.Mocked<Partial<RedisService>>;
  let storageService: jest.Mocked<Partial<StorageService>>;

  beforeEach(async () => {
    prismaService = {
      checkHealth: jest.fn().mockResolvedValue({ status: 'UP', latencyMs: 3 }),
    };

    redisService = {
      checkHealth: jest.fn().mockResolvedValue({ status: 'UP', latencyMs: 1 }),
    };

    storageService = {
      checkHealth: jest.fn().mockResolvedValue({ status: 'UP', latencyMs: 5 }),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: prismaService },
        { provide: RedisService, useValue: redisService },
        { provide: StorageService, useValue: storageService },
      ],
    }).compile();

    healthController = moduleRef.get<HealthController>(HealthController);
  });

  it('should report overall "healthy" status when all dependencies are UP', async () => {
    const health = await healthController.checkHealth();

    expect(health.status).toBe('healthy');
    expect(health.dependencies.database.status).toBe('UP');
    expect(health.dependencies.redis.status).toBe('UP');
    expect(health.dependencies.storage.status).toBe('UP');
    expect(health.version).toBe('0.1.0');
    expect(health.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('should report "degraded" status when database is UP but storage is DOWN', async () => {
    (storageService.checkHealth as jest.Mock).mockResolvedValueOnce({
      status: 'DOWN',
      message: 'Connection refused',
    });

    const health = await healthController.checkHealth();

    expect(health.status).toBe('degraded');
    expect(health.dependencies.storage.status).toBe('DOWN');
    expect(health.dependencies.storage.message).toBe('Connection refused');
  });

  it('should report "unhealthy" status when all dependencies are DOWN', async () => {
    (prismaService.checkHealth as jest.Mock).mockResolvedValueOnce({ status: 'DOWN', message: 'DB down' });
    (redisService.checkHealth as jest.Mock).mockResolvedValueOnce({ status: 'DOWN', message: 'Redis down' });
    (storageService.checkHealth as jest.Mock).mockResolvedValueOnce({ status: 'DOWN', message: 'Storage down' });

    const health = await healthController.checkHealth();

    expect(health.status).toBe('unhealthy');
  });
});
