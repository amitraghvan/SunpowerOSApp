import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface LogAuditEventDto {
  actorId: string;
  actorEmail?: string;
  platformRole?: string;
  action: string;
  targetType: string;
  targetId?: string;
  reason?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class PlatformAuditService {
  private readonly logger = new Logger(PlatformAuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logEvent(dto: LogAuditEventDto) {
    try {
      const event = await this.prisma.platformAuditEvent.create({
        data: {
          actorId: dto.actorId,
          actorEmail: dto.actorEmail,
          platformRole: dto.platformRole,
          action: dto.action,
          targetType: dto.targetType,
          targetId: dto.targetId,
          reason: dto.reason,
          metadata: dto.metadata || undefined,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
        },
      });
      this.logger.log(
        `[AUDIT] ${dto.action} on ${dto.targetType}:${dto.targetId || 'N/A'} by ${dto.actorEmail || dto.actorId}`,
      );
      return event;
    } catch (err: any) {
      this.logger.error(`Failed to record platform audit event: ${err.message}`, err.stack);
    }
  }

  async listEvents(query: {
    page?: number;
    limit?: number;
    action?: string;
    targetType?: string;
    actorId?: string;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.action) where.action = query.action;
    if (query.targetType) where.targetType = query.targetType;
    if (query.actorId) where.actorId = query.actorId;

    const [items, total] = await Promise.all([
      this.prisma.platformAuditEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.platformAuditEvent.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
