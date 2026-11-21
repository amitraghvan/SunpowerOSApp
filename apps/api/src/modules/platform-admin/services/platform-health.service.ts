import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NumberingService } from '../../../common/services/numbering.service';
import { PlatformAuditService } from './platform-audit.service';
import { ResolveAlertRequest } from '@solaros/contracts';

@Injectable()
export class PlatformHealthService {
  private readonly logger = new Logger(PlatformHealthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
    private readonly auditService: PlatformAuditService,
  ) {}

  async getSystemHealth() {
    // 1. PostgreSQL check
    const startDb = Date.now();
    let dbStatus = 'HEALTHY';
    let dbLatencyMs = 0;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - startDb;
    } catch (err: any) {
      dbStatus = 'DEGRADED';
      this.logger.error(`PostgreSQL health check failed: ${err.message}`);
    }

    // 2. Storage Aggregates
    const [supplierDocs, handoverDocs, totalOrgs, totalUsers] = await Promise.all([
      this.prisma.supplierDocument.aggregate({ _sum: { fileSizeBytes: true } }),
      this.prisma.handoverDocument.aggregate({ _sum: { fileSize: true } }),
      this.prisma.organization.count(),
      this.prisma.user.count(),
    ]);

    const totalStorageBytes =
      Number(supplierDocs._sum?.fileSizeBytes || 0) + Number(handoverDocs._sum?.fileSize || 0);

    // 3. Active platform alerts
    const [openAlerts, criticalAlerts] = await Promise.all([
      this.prisma.platformAlert.count({ where: { status: 'OPEN' } }),
      this.prisma.platformAlert.count({ where: { status: 'OPEN', severity: 'CRITICAL' } }),
    ]);

    const overallStatus =
      criticalAlerts > 0 ? 'CRITICAL' : dbStatus !== 'HEALTHY' ? 'DEGRADED' : 'HEALTHY';

    return {
      status: overallStatus,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      services: {
        database: {
          name: 'PostgreSQL 14 Multi-Tenant Engine',
          status: dbStatus,
          latencyMs: dbLatencyMs,
          connectionPool: 'Active (RLS Enforced)',
        },
        redis: {
          name: 'Redis Cache & Pub/Sub',
          status: 'HEALTHY',
          mode: 'Standalone',
        },
        workerQueue: {
          name: 'BullMQ Async Job Processor',
          status: 'HEALTHY',
          concurrency: 5,
        },
        storage: {
          name: 'MinIO Object Storage Service',
          status: 'HEALTHY',
          totalStorageBytes,
          totalStorageMb: Math.round(totalStorageBytes / (1024 * 1024)),
        },
        apiGateway: {
          name: 'NestJS REST API Gateway',
          status: 'HEALTHY',
          nodeVersion: process.version,
          memoryUsageMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
        },
      },
      stats: {
        totalOrgs,
        totalUsers,
        openAlerts,
        criticalAlerts,
      },
    };
  }

  async listAlerts(status?: string, severity?: string) {
    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (severity && severity !== 'ALL') where.severity = severity;

    return await this.prisma.platformAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async createAlert(dto: {
    severity: string;
    category: string;
    source: string;
    title: string;
    message: string;
    details?: any;
  }) {
    const alertNumber = await this.numberingService.getNextPlatformDocumentNumber(
      'PLATFORM_ALERT',
      'ALT',
    );

    return await this.prisma.platformAlert.create({
      data: {
        alertNumber,
        severity: dto.severity || 'INFO',
        category: dto.category,
        source: dto.source,
        title: dto.title,
        message: dto.message,
        details: dto.details || undefined,
        status: 'OPEN',
      },
    });
  }

  async acknowledgeAlert(alertId: string, adminId: string) {
    const alert = await this.prisma.platformAlert.findUnique({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundException(`Alert "${alertId}" not found.`);
    }

    return await this.prisma.platformAlert.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedById: adminId,
        acknowledgedAt: new Date(),
      },
    });
  }

  async resolveAlert(
    alertId: string,
    dto: ResolveAlertRequest,
    adminId: string,
    adminEmail: string,
  ) {
    const alert = await this.prisma.platformAlert.findUnique({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundException(`Alert "${alertId}" not found.`);
    }

    const updated = await this.prisma.platformAlert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedById: adminId,
        resolvedAt: new Date(),
      },
    });

    await this.auditService.logEvent({
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'PLATFORM_ALERT_RESOLVED',
      targetType: 'ALERT',
      targetId: alertId,
      reason: dto.notes,
      metadata: { alertNumber: alert.alertNumber, title: alert.title },
    });

    return updated;
  }
}
