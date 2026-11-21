import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NumberingService } from '../../../common/services/numbering.service';
import { PlatformAuditService } from './platform-audit.service';
import {
  CreatePublicEnquiryRequest,
  ListPlatformEnquiriesQuery,
  UpdatePlatformEnquiryStatusRequest,
  AssignPlatformEnquiryRequest,
  AddPlatformEnquiryNoteRequest,
} from '@solaros/contracts';

@Injectable()
export class PlatformEnquiriesService {
  private readonly logger = new Logger(PlatformEnquiriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly numberingService: NumberingService,
    private readonly auditService: PlatformAuditService,
  ) {}

  async submitPublicEnquiry(dto: CreatePublicEnquiryRequest, ipAddress?: string) {
    if (!dto.name || !dto.email || !dto.message) {
      throw new BadRequestException('Name, email, and message are required.');
    }

    const referenceNumber = await this.numberingService.getNextPlatformDocumentNumber(
      'PLATFORM_ENQUIRY',
      'ENQ',
    );

    const enquiry = await this.prisma.platformEnquiry.create({
      data: {
        referenceNumber,
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        company: dto.company?.trim(),
        phone: dto.phone?.trim(),
        category: dto.category || 'GENERAL_INQUIRY',
        projectCapacity: dto.projectCapacity?.trim(),
        message: dto.message.trim(),
        sourceUrl: dto.sourceUrl,
        ipAddress,
        status: 'NEW',
        activities: {
          create: {
            activityType: 'ENQUIRY_CREATED',
            details: {
              ipAddress,
              category: dto.category || 'GENERAL_INQUIRY',
              sourceUrl: dto.sourceUrl,
            },
          },
        },
      },
    });

    this.logger.log(`New public website enquiry received: ${referenceNumber} from ${enquiry.email}`);

    return {
      success: true,
      referenceNumber: enquiry.referenceNumber,
      message:
        'Thank you for contacting SunPower Solutions. Our enterprise solar team will get in touch shortly.',
    };
  }

  async listEnquiries(query: ListPlatformEnquiriesQuery) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.category && query.category !== 'ALL') {
      where.category = query.category;
    }

    if (query.assignedToId) {
      where.assignedToId = query.assignedToId;
    }

    if (query.search) {
      const term = query.search.trim();
      where.OR = [
        { referenceNumber: { contains: term, mode: 'insensitive' } },
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.platformEnquiry.findMany({
        where,
        include: {
          assignedTo: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, email: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.platformEnquiry.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getEnquiryDetail(id: string) {
    const enquiry = await this.prisma.platformEnquiry.findUnique({
      where: { id },
      include: {
        assignedTo: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!enquiry) {
      throw new NotFoundException(`Enquiry with id "${id}" not found.`);
    }

    return enquiry;
  }

  async updateStatus(
    id: string,
    dto: UpdatePlatformEnquiryStatusRequest,
    adminId: string,
    adminEmail: string,
  ) {
    const enquiry = await this.prisma.platformEnquiry.findUnique({ where: { id } });
    if (!enquiry) {
      throw new NotFoundException(`Enquiry with id "${id}" not found.`);
    }

    const updated = await this.prisma.platformEnquiry.update({
      where: { id },
      data: {
        status: dto.status,
        internalNotes: dto.notes ? `${enquiry.internalNotes || ''}\n[${new Date().toISOString()}] ${dto.notes}`.trim() : enquiry.internalNotes,
        activities: {
          create: {
            actorId: adminId,
            activityType: 'STATUS_CHANGE',
            details: {
              previousStatus: enquiry.status,
              newStatus: dto.status,
              notes: dto.notes,
              adminEmail,
            },
          },
        },
      },
      include: {
        assignedTo: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    await this.auditService.logEvent({
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'ENQUIRY_STATUS_UPDATED',
      targetType: 'ENQUIRY',
      targetId: id,
      metadata: { referenceNumber: enquiry.referenceNumber, newStatus: dto.status },
    });

    return updated;
  }

  async assignEnquiry(
    id: string,
    dto: AssignPlatformEnquiryRequest,
    adminId: string,
    adminEmail: string,
  ) {
    const enquiry = await this.prisma.platformEnquiry.findUnique({ where: { id } });
    if (!enquiry) {
      throw new NotFoundException(`Enquiry with id "${id}" not found.`);
    }

    const assignedAdmin = await this.prisma.platformAdministrator.findUnique({
      where: { id: dto.assignedToId },
      include: { user: true },
    });
    if (!assignedAdmin) {
      throw new NotFoundException(`Platform Administrator "${dto.assignedToId}" not found.`);
    }

    const updated = await this.prisma.platformEnquiry.update({
      where: { id },
      data: {
        assignedToId: dto.assignedToId,
        activities: {
          create: {
            actorId: adminId,
            activityType: 'ASSIGNMENT',
            details: {
              assignedToEmail: assignedAdmin.user.email,
              assignedToName: `${assignedAdmin.user.firstName} ${assignedAdmin.user.lastName}`,
              assignedBy: adminEmail,
            },
          },
        },
      },
      include: {
        assignedTo: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    await this.auditService.logEvent({
      actorId: adminId,
      actorEmail: adminEmail,
      action: 'ENQUIRY_ASSIGNED',
      targetType: 'ENQUIRY',
      targetId: id,
      metadata: {
        referenceNumber: enquiry.referenceNumber,
        assignedToEmail: assignedAdmin.user.email,
      },
    });

    return updated;
  }

  async addNote(
    id: string,
    dto: AddPlatformEnquiryNoteRequest,
    adminId: string,
    adminEmail: string,
  ) {
    const enquiry = await this.prisma.platformEnquiry.findUnique({ where: { id } });
    if (!enquiry) {
      throw new NotFoundException(`Enquiry with id "${id}" not found.`);
    }

    const timestamp = new Date().toLocaleString('en-US');
    const noteEntry = `[${timestamp} by ${adminEmail}]: ${dto.notes}`;
    const newNotes = enquiry.internalNotes
      ? `${enquiry.internalNotes}\n${noteEntry}`
      : noteEntry;

    const updated = await this.prisma.platformEnquiry.update({
      where: { id },
      data: {
        internalNotes: newNotes,
        activities: {
          create: {
            actorId: adminId,
            activityType: 'NOTE_ADDED',
            details: { note: dto.notes, adminEmail },
          },
        },
      },
      include: {
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });

    return updated;
  }
}
