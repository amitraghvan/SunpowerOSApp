import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { SurveysService } from './surveys.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantContext } from '@solaros/types';
import { API_CONSTANTS } from '@solaros/config';
import {
  CreateSurveyDto,
  ScheduleSurveyDto,
  SubmitSurveyAssessmentDto,
  ReviewSurveyDto,
  PresignedUploadRequestDto,
  ConfirmPhotoUploadDto,
  SurveyFilterQueryDto,
} from '@solaros/contracts';

@ApiTags('Site Surveys & Technical Assessment')
@ApiBearerAuth()
@ApiHeader({ name: API_CONSTANTS.TENANT_ID_HEADER, required: false })
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @RequirePermissions('survey:surveys:create')
  @ApiOperation({ summary: 'Initiate new site survey' })
  async createSurvey(@CurrentTenant() tenant: TenantContext, @Body() dto: CreateSurveyDto) {
    return this.surveysService.createSurvey(tenant, dto);
  }

  @Get()
  @RequirePermissions('survey:surveys:read')
  @ApiOperation({ summary: 'List and filter site surveys' })
  async getSurveys(@CurrentTenant() tenant: TenantContext, @Query() filter: SurveyFilterQueryDto) {
    return this.surveysService.getSurveys(tenant, filter);
  }

  @Get(':id')
  @RequirePermissions('survey:surveys:read')
  @ApiOperation({ summary: 'Get full survey assessment details' })
  async getSurveyById(@CurrentTenant() tenant: TenantContext, @Param('id') id: string) {
    return this.surveysService.getSurveyById(tenant, id);
  }

  @Post(':id/schedule')
  @RequirePermissions('survey:surveys:assign')
  @ApiOperation({ summary: 'Schedule survey date and assign technician' })
  async scheduleSurvey(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: ScheduleSurveyDto
  ) {
    return this.surveysService.scheduleSurvey(tenant, id, dto);
  }

  @Post(':id/assessment')
  @RequirePermissions('survey:surveys:update')
  @ApiOperation({ summary: 'Submit field measurements, roof tilt, and electrical panel specs' })
  async submitTechnicalAssessment(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: SubmitSurveyAssessmentDto
  ) {
    return this.surveysService.submitTechnicalAssessment(tenant, id, dto);
  }

  @Post(':id/review')
  @RequirePermissions('survey:surveys:review')
  @ApiOperation({ summary: 'Review survey: approve, reject, or request revisions' })
  async reviewSurvey(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: ReviewSurveyDto
  ) {
    return this.surveysService.reviewSurvey(tenant, id, dto);
  }

  @Post(':id/photos/presigned-url')
  @RequirePermissions('survey:surveys:update')
  @ApiOperation({ summary: 'Generate S3 presigned URL for direct photo upload' })
  async generatePresignedUrl(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: PresignedUploadRequestDto
  ) {
    return this.surveysService.requestPhotoUploadUrl(tenant, id, dto);
  }

  @Post(':id/photos/confirm')
  @RequirePermissions('survey:surveys:update')
  @ApiOperation({ summary: 'Confirm completed photo upload' })
  async confirmPhotoUpload(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string,
    @Body() dto: ConfirmPhotoUploadDto
  ) {
    return this.surveysService.confirmPhotoUpload(tenant, id, dto);
  }

  @Get(':id/photos')
  @RequirePermissions('survey:surveys:read')
  @ApiOperation({ summary: 'Get survey photos with download URLs' })
  async getSurveyPhotos(
    @CurrentTenant() tenant: TenantContext,
    @Param('id') id: string
  ) {
    return this.surveysService.getSurveyPhotos(tenant, id);
  }
}
