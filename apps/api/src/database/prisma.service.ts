import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(@Optional() configOrOptions?: any) {
    let dbUrl: string | undefined;

    if (configOrOptions && typeof configOrOptions.get === 'function') {
      dbUrl = configOrOptions.get('DATABASE_URL');
    } else if (configOrOptions && configOrOptions.datasources?.db?.url) {
      dbUrl = configOrOptions.datasources.db.url;
    }

    if (!dbUrl) {
      dbUrl = process.env.DATABASE_URL ||
        'postgresql://solaros_app:solaros_secret_app_pw@localhost:5432/solaros_dev?schema=public';
    }

    super(
      configOrOptions && !configOrOptions.get
        ? configOrOptions
        : {
            datasources: {
              db: {
                url: dbUrl,
              },
            },
          }
    );
  }

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

  /**
   * Executes a callback within a database transaction scoped to a specific tenant context.
   * Sets PostgreSQL session variable `app.current_organization_id` to enforce Row Level Security (RLS).
   */
  async forTenant<T>(tenantId: string | { organizationId: string }, fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    const orgId =
      typeof tenantId === 'object' && tenantId !== null && 'organizationId' in tenantId
        ? (tenantId as any).organizationId
        : tenantId;
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.current_organization_id = '${orgId}'`);
      return fn(tx);
    });
  }

  /**
   * Executes a callback within a database transaction scoped with super admin bypass.
   * Sets PostgreSQL session variable `app.is_super_admin = 'true'`.
   */
  async asSuperAdmin<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`SET LOCAL app.is_super_admin = 'true'`);
      return fn(tx);
    });
  }
}
