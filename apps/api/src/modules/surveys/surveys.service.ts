import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { TenantContext, SurveyStatus } from '@solaros/types';
import { STORAGE_BUCKETS } from '@solaros/config';
import {
  CreateSurveyDto,
  ScheduleSurveyDto,
  SubmitSurveyAssessmentDto,
  ReviewSurveyDto,
  PresignedUploadRequestDto,
  ConfirmPhotoUploadDto,
  SurveyFilterQueryDto,
} from '@solaros/contracts';

@Injectable()
export class SurveysService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {}

  async createSurvey(tenant: TenantContext, dto: CreateSurveyDto) {
    const orgId = tenant.organizationId;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const surveyNumber = `SURV-${dateStr}-${randomSuffix}`;

    return this.prisma.forTenant(orgId, async (tx) => {
      return tx.survey.create({
        data: {
          organizationId: orgId,
          surveyNumber,
          customerId: dto.customerId,
          siteId: dto.siteId,
          leadId: dto.leadId || null,
          assignedTechnicianId: dto.assignedTechnicianId || null,
          scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : null,
          status: dto.scheduledDate ? SurveyStatus.SCHEDULED : SurveyStatus.REQUESTED,
        },
      });
    });
  }

  async getSurveys(tenant: TenantContext, filter: SurveyFilterQueryDto) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      organizationId: tenant.organizationId,
    };

    if (filter.status) where.status = filter.status;
    if (filter.customerId) where.customerId = filter.customerId;
    if (filter.assignedTechnicianId) where.assignedTechnicianId = filter.assignedTechnicianId;

    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [
        { surveyNumber: { contains: q, mode: 'insensitive' } },
        { customer: { name: { contains: q, mode: 'insensitive' } } },
        { site: { siteName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const [data, total] = await Promise.all([
        tx.survey.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { id: true, name: true, phone: true } },
            site: { select: { id: true, siteName: true, city: true, roofType: true } },
            assignedTechnician: { select: { id: true, firstName: true, lastName: true } },
            _count: { select: { photos: true, revisions: true } },
          },
        }),
        tx.survey.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    });
  }

  async getSurveyById(tenant: TenantContext, id: string) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const survey = await tx.survey.findFirst({
        where: {
          id,
          organizationId: tenant.organizationId,
        },
        include: {
          customer: true,
          site: true,
          assignedTechnician: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          revisions: { orderBy: { revisionNumber: 'desc' } },
          photos: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!survey) {
        throw new NotFoundException(`Survey with id '${id}' not found`);
      }

      return survey;
    });
  }

  async scheduleSurvey(tenant: TenantContext, id: string, dto: ScheduleSurveyDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const survey = await tx.survey.findFirst({
        where: { id, organizationId: tenant.organizationId },
      });

      if (!survey) {
        throw new NotFoundException(`Survey with id '${id}' not found`);
      }

      return tx.survey.update({
        where: { id: survey.id },
        data: {
          assignedTechnicianId: dto.assignedTechnicianId,
          scheduledDate: new Date(dto.scheduledDate),
          status: SurveyStatus.SCHEDULED,
        },
      });
    });
  }

  async submitTechnicalAssessment(tenant: TenantContext, id: string, dto: SubmitSurveyAssessmentDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const survey = await tx.survey.findFirst({
        where: { id, organizationId: tenant.organizationId },
      });

      if (!survey) {
        throw new NotFoundException(`Survey with id '${id}' not found`);
      }

      const updated = await tx.survey.update({
        where: { id: survey.id },
        data: {
          ...dto,
          status: SurveyStatus.COMPLETED,
          completedDate: new Date(),
        } as any,
      });

      // Save a revision snapshot
      await tx.surveyRevision.create({
        data: {
          organizationId: tenant.organizationId,
          surveyId: survey.id,
          revisionNumber: survey.currentRevisionNumber,
          changesSummary: `Technical assessment submitted (Revision ${survey.currentRevisionNumber})`,
          dataSnapshot: dto as any,
          createdById: tenant.userId !== 'anonymous' ? tenant.userId : null,
        },
      });

      return updated;
    });
  }

  async reviewSurvey(tenant: TenantContext, id: string, dto: ReviewSurveyDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const survey = await tx.survey.findFirst({
        where: { id, organizationId: tenant.organizationId },
      });

      if (!survey) {
        throw new NotFoundException(`Survey with id '${id}' not found`);
      }

      if (dto.action === 'APPROVE') {
        return tx.survey.update({
          where: { id: survey.id },
          data: {
            status: SurveyStatus.APPROVED,
            rejectionReason: null,
          },
        });
      } else if (dto.action === 'REQUEST_REVISION') {
        if (!dto.rejectionReason) {
          throw new BadRequestException('A reason is required when requesting a survey revision');
        }

        return tx.survey.update({
          where: { id: survey.id },
          data: {
            status: SurveyStatus.REVISION_REQUESTED,
            rejectionReason: dto.rejectionReason,
            currentRevisionNumber: survey.currentRevisionNumber + 1,
          },
        });
      } else {
        throw new BadRequestException(`Unknown review action: ${dto.action}`);
      }
    });
  }

  async requestPhotoUploadUrl(tenant: TenantContext, id: string, dto: PresignedUploadRequestDto) {
    const survey = await this.getSurveyById(tenant, id);
    const sanitizedFileName = dto.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `surveys/${tenant.organizationId}/${survey.id}/${Date.now()}-${sanitizedFileName}`;

    const uploadUrl = await this.storage.getPresignedUploadUrl(
      STORAGE_BUCKETS.SURVEYS,
      objectKey,
      900 // 15 min
    );

    return {
      uploadUrl,
      objectKey,
      category: dto.category,
      fileName: dto.fileName,
      bucket: STORAGE_BUCKETS.SURVEYS,
    };
  }

  async confirmPhotoUpload(tenant: TenantContext, id: string, dto: ConfirmPhotoUploadDto) {
    return this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const survey = await tx.survey.findFirst({
        where: { id, organizationId: tenant.organizationId },
      });

      if (!survey) {
        throw new NotFoundException(`Survey with id '${id}' not found`);
      }

      return tx.surveyPhoto.create({
        data: {
          organizationId: tenant.organizationId,
          surveyId: survey.id,
          category: dto.category,
          objectKey: dto.objectKey,
          originalFileName: dto.originalFileName,
          mimeType: dto.mimeType,
          fileSize: dto.fileSize,
          caption: dto.caption || null,
          uploadedById: tenant.userId !== 'anonymous' ? tenant.userId : null,
        },
      });
    });
  }

  async getSurveyPhotos(tenant: TenantContext, id: string) {
    const photos = await this.prisma.forTenant(tenant.organizationId, async (tx) => {
      const survey = await tx.survey.findFirst({
        where: { id, organizationId: tenant.organizationId },
      });

      if (!survey) {
        throw new NotFoundException(`Survey with id '${id}' not found`);
      }

      return tx.surveyPhoto.findMany({
        where: {
          surveyId: survey.id,
          organizationId: tenant.organizationId,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    // Generate signed download URLs
    const photosWithUrls = await Promise.all(
      photos.map(async (photo) => {
        let downloadUrl = '';
        try {
          downloadUrl = await this.storage.getPresignedDownloadUrl(
            STORAGE_BUCKETS.SURVEYS,
            photo.objectKey,
            3600 // 1 hour
          );
        } catch {
          downloadUrl = `/api/v1/storage/${STORAGE_BUCKETS.SURVEYS}/${photo.objectKey}`;
        }

        return {
          ...photo,
          downloadUrl,
        };
      })
    );

    return photosWithUrls;
  }

  async generateSurveyReport(tenant: TenantContext, id: string) {
    const survey = await this.getSurveyById(tenant, id);
    const photos = await this.getSurveyPhotos(tenant, id);

    return {
      reportTitle: `Site Survey & Feasibility Assessment Report - ${survey.surveyNumber}`,
      generatedAt: new Date().toISOString(),
      organizationId: tenant.organizationId,
      survey: {
        id: survey.id,
        surveyNumber: survey.surveyNumber,
        status: survey.status,
        scheduledDate: survey.scheduledDate,
        completedDate: survey.completedDate,
        technician: survey.assignedTechnician,
      },
      customer: {
        name: survey.customer.name,
        phone: survey.customer.phone,
        email: survey.customer.email,
        customerNumber: survey.customer.customerNumber,
      },
      site: {
        siteName: survey.site.siteName,
        address: `${survey.site.addressLine1}, ${survey.site.city}, ${survey.site.state} - ${survey.site.postalCode}`,
        sanctionedLoadKw: survey.site.sanctionedLoadKw,
        discomName: survey.site.discomName,
      },
      roofAssessment: {
        roofType: survey.roofType,
        roofAgeYears: survey.roofAgeYears,
        roofPitchDegrees: survey.roofPitchDegrees,
        roofAzimuthDegrees: survey.roofAzimuthDegrees,
        roofCondition: survey.roofCondition,
        usableAreaSqFt: survey.usableAreaSqFt,
        shadowObstacles: survey.shadowObstacles,
        recommendedCapacityKw: survey.recommendedCapacityKw,
      },
      electricalAssessment: {
        sanctionedLoadKw: survey.sanctionedLoadKw,
        currentVoltage: survey.currentVoltage,
        phaseType: survey.phaseType,
        incomingCableCapacitySqMm: survey.incomingCableCapacitySqMm,
        cableLengthMeters: survey.cableLengthMeters,
        earthingRequired: survey.earthingRequired,
        earthResistanceOhms: survey.earthResistanceOhms,
        lightningArresterRequired: survey.lightningArresterRequired,
        mainSwitchboardCondition: survey.mainSwitchboardCondition,
        inverterLocation: survey.inverterLocation,
        distanceToMainPanelMeters: survey.distanceToMainPanelMeters,
      },
      logisticsAndStructure: {
        accessibilityNotes: survey.accessibilityNotes,
        craneRequired: survey.craneRequired,
        ladderRequired: survey.ladderRequired,
        storageAvailableOnSite: survey.storageAvailableOnSite,
        canSupportStructure: survey.canSupportStructure,
        reinforcementRequired: survey.reinforcementRequired,
        remarks: survey.remarks,
      },
      photos: photos.map((p) => ({
        id: p.id,
        category: p.category,
        caption: p.caption,
        downloadUrl: p.downloadUrl,
      })),
      revisions: survey.revisions,
    };
  }
}
