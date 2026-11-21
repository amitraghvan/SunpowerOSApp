import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateQuotationDto, RecordQuotationAcceptanceDto } from '@solaros/contracts';

@Controller('quotations')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @RequirePermissions('quotation:quotations:manage')
  async createQuotation(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateQuotationDto,
  ) {
    return await this.quotationsService.createQuotation(organizationId, dto, userId);
  }

  @Get()
  @RequirePermissions('quotation:quotations:read')
  async listQuotations(
    @CurrentTenant() organizationId: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    return await this.quotationsService.listQuotations(organizationId, { customerId, status });
  }

  @Get(':id')
  @RequirePermissions('quotation:quotations:read')
  async getQuotation(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.quotationsService.getQuotation(organizationId, id);
  }

  @Post(':id/approve')
  @RequirePermissions('quotation:quotations:approve')
  async approveQuotation(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.quotationsService.approveQuotation(organizationId, id, userId);
  }

  @Post(':id/accept')
  @RequirePermissions('quotation:quotations:manage')
  async recordAcceptance(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RecordQuotationAcceptanceDto,
  ) {
    return await this.quotationsService.recordCustomerAcceptance(
      organizationId,
      id,
      dto,
      userId,
    );
  }
}
