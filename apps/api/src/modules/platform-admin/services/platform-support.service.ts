import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NumberingService } from '../../../common/services/numbering.service';
import { PlatformAuditService } from './platform-audit.service';
import {
  CreateSupportTicketRequest,
  ReplySupportTicketRequest,
  UpdateSupportTicketStatusRequest,
  AssignSupportTicketRequest,
  ListSupportTicketsQuery,
} from '@solaros/contracts';

@Injectable()
export class PlatformSupportService {
  private readonly logger = new Logger(PlatformSupportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
    private readonly auditService: PlatformAuditService,
  ) {}

  async createTenantTicket(
    orgId: string,
    userId: string,
    dto: CreateSupportTicketRequest,
  ) {
    if (!dto.subject || !dto.message) {
      throw new BadRequestException('Subject and message are required.');
    }

    const ticketNumber = await this.numberingService.getNextPlatformDocumentNumber(
      'SUPPORT_TICKET',
      'TCK',
    );

    return await this.prisma.forTenant(orgId, async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          ticketNumber,
          organizationId: orgId,
          submittedById: userId,
          subject: dto.subject.trim(),
          category: dto.category || 'GENERAL',
          priority: dto.priority || 'MEDIUM',
          status: 'OPEN',
          messages: {
            create: {
              senderId: userId,
              senderType: 'TENANT_USER',
              message: dto.message.trim(),
              attachments: dto.attachments || [],
              isInternalOnly: false,
            },
          },
        },
        include: {
          organization: { select: { id: true, name: true, slug: true } },
          submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          messages: {
            include: {
              sender: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      });

      this.logger.log(`Created support ticket ${ticketNumber} for organization ${orgId}`);
      return ticket;
    });
  }

  async listTickets(
    query: ListSupportTicketsQuery,
    isPlatformAdmin: boolean,
    tenantOrgId?: string,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (!isPlatformAdmin) {
      if (!tenantOrgId) {
        throw new ForbiddenException('Tenant organization context missing.');
      }
      where.organizationId = tenantOrgId;
    } else {
      if (query.organizationId) {
        where.organizationId = query.organizationId;
      }
      if (query.assignedToId) {
        where.assignedToId = query.assignedToId;
      }
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.priority && query.priority !== 'ALL') {
      where.priority = query.priority;
    }

    if (query.category && query.category !== 'ALL') {
      where.category = query.category;
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { ticketNumber: { contains: term, mode: 'insensitive' } },
        { subject: { contains: term, mode: 'insensitive' } },
      ];
    }

    const runner = isPlatformAdmin
      ? (cb: any) => this.prisma.asSuperAdmin(cb)
      : (cb: any) => this.prisma.forTenant(tenantOrgId!, cb);

    return await runner(async (tx: any) => {
      const [items, total] = await Promise.all([
        tx.supportTicket.findMany({
          where,
          include: {
            organization: { select: { id: true, name: true, slug: true } },
            submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
            assignedTo: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
              },
            },
            _count: {
              select: { messages: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        tx.supportTicket.count({ where }),
      ]);

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  async getTicketDetail(
    ticketId: string,
    isPlatformAdmin: boolean,
    tenantOrgId?: string,
  ) {
    const runner = isPlatformAdmin
      ? (cb: any) => this.prisma.asSuperAdmin(cb)
      : (cb: any) => this.prisma.forTenant(tenantOrgId!, cb);

    return await runner(async (tx: any) => {
      const ticket = await tx.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          organization: { select: { id: true, name: true, slug: true } },
          submittedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedTo: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
          messages: {
            include: {
              sender: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!ticket) {
        throw new NotFoundException(`Support ticket "${ticketId}" not found.`);
      }

      if (!isPlatformAdmin && ticket.organizationId !== tenantOrgId) {
        throw new ForbiddenException('Access denied to this ticket.');
      }

      // Tenant users cannot see internal-only messages
      if (!isPlatformAdmin) {
        ticket.messages = ticket.messages.filter((m: any) => !m.isInternalOnly);
      }

      return ticket;
    });
  }

  async replyTicket(
    ticketId: string,
    senderId: string,
    senderType: 'TENANT_USER' | 'PLATFORM_ADMIN',
    dto: ReplySupportTicketRequest,
    tenantOrgId?: string,
  ) {
    if (!dto.message || !dto.message.trim()) {
      throw new BadRequestException('Message cannot be empty.');
    }

    const runner = senderType === 'PLATFORM_ADMIN'
      ? (cb: any) => this.prisma.asSuperAdmin(cb)
      : (cb: any) => this.prisma.forTenant(tenantOrgId!, cb);

    return await runner(async (tx: any) => {
      const ticket = await tx.supportTicket.findUnique({
        where: { id: ticketId },
      });

      if (!ticket) {
        throw new NotFoundException(`Support ticket "${ticketId}" not found.`);
      }

      if (senderType === 'TENANT_USER') {
        if (ticket.organizationId !== tenantOrgId) {
          throw new ForbiddenException('Access denied to reply to this ticket.');
        }
      }

      const isInternalOnly = senderType === 'PLATFORM_ADMIN' ? Boolean(dto.isInternalOnly) : false;

      const messageRecord = await tx.supportTicketMessage.create({
        data: {
          ticketId,
          senderId,
          senderType,
          message: dto.message.trim(),
          isInternalOnly,
          attachments: dto.attachments || [],
        },
        include: {
          sender: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      });

      // Update ticket status automatically based on who replied
      let newStatus = ticket.status;
      if (senderType === 'PLATFORM_ADMIN' && !isInternalOnly) {
        newStatus = 'WAITING_ON_CUSTOMER';
      } else if (senderType === 'TENANT_USER' && ticket.status === 'WAITING_ON_CUSTOMER') {
        newStatus = 'IN_PROGRESS';
      }

      if (newStatus !== ticket.status) {
        await tx.supportTicket.update({
          where: { id: ticketId },
          data: { status: newStatus },
        });
      }

      return messageRecord;
    });
  }

  async updateTicketStatus(
    ticketId: string,
    dto: UpdateSupportTicketStatusRequest,
    adminId: string,
    adminEmail: string,
  ) {
    return await this.prisma.asSuperAdmin(async (tx) => {
      const ticket = await tx.supportTicket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        throw new NotFoundException(`Support ticket "${ticketId}" not found.`);
      }

      const isResolved = dto.status === 'RESOLVED' || dto.status === 'CLOSED';
      const updated = await tx.supportTicket.update({
        where: { id: ticketId },
        data: {
          status: dto.status,
          resolutionNotes: dto.resolutionNotes || ticket.resolutionNotes,
          resolvedAt: isResolved ? new Date() : null,
        },
        include: {
          organization: { select: { id: true, name: true, slug: true } },
          assignedTo: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      });

      await this.auditService.logEvent({
        actorId: adminId,
        actorEmail: adminEmail,
        action: 'TICKET_STATUS_UPDATED',
        targetType: 'SUPPORT_TICKET',
        targetId: ticketId,
        metadata: { ticketNumber: ticket.ticketNumber, newStatus: dto.status },
      });

      return updated;
    });
  }

  async assignTicket(
    ticketId: string,
    dto: AssignSupportTicketRequest,
    adminId: string,
    adminEmail: string,
  ) {
    return await this.prisma.asSuperAdmin(async (tx) => {
      const ticket = await tx.supportTicket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        throw new NotFoundException(`Support ticket "${ticketId}" not found.`);
      }

      const assignedAdmin = await tx.platformAdministrator.findUnique({
        where: { id: dto.assignedToId },
        include: { user: true },
      });
      if (!assignedAdmin) {
        throw new NotFoundException(`Platform Administrator "${dto.assignedToId}" not found.`);
      }

      const updated = await tx.supportTicket.update({
        where: { id: ticketId },
        data: {
          assignedToId: dto.assignedToId,
          status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
        },
        include: {
          assignedTo: {
            include: {
              user: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
          },
        },
      });

      await this.auditService.logEvent({
        actorId: adminId,
        actorEmail: adminEmail,
        action: 'TICKET_ASSIGNED',
        targetType: 'SUPPORT_TICKET',
        targetId: ticketId,
        metadata: {
          ticketNumber: ticket.ticketNumber,
          assignedToEmail: assignedAdmin.user.email,
        },
      });

      return updated;
    });
  }
}
