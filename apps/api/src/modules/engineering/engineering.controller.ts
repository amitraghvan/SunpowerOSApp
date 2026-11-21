import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { EngineeringService } from './engineering.service';
import { BomService } from './bom/bom.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  CreateDesignDto,
  ConfigureDesignRevisionDto,
  RunCalculationDto,
} from '@solaros/contracts';

@Controller('engineering')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class EngineeringController {
  constructor(
    private readonly engineeringService: EngineeringService,
    private readonly bomService: BomService,
  ) {}

  @Post('designs')
  @RequirePermissions('engineering:designs:manage')
  async createDesign(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDesignDto,
  ) {
    return await this.engineeringService.createDesign(organizationId, dto, userId);
  }

  @Get('designs')
  @RequirePermissions('engineering:designs:read')
  async listDesigns(
    @CurrentTenant() organizationId: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    return await this.engineeringService.listDesigns(organizationId, { customerId, status });
  }

  @Get('designs/:id')
  @RequirePermissions('engineering:designs:read')
  async getDesign(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.engineeringService.getDesign(organizationId, id);
  }

  @Post('designs/:id/revisions/:revNum/configure')
  @RequirePermissions('engineering:designs:manage')
  async configureRevision(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('revNum', ParseIntPipe) revNum: number,
    @Body() dto: ConfigureDesignRevisionDto,
  ) {
    return await this.engineeringService.configureRevision(
      organizationId,
      id,
      revNum,
      dto,
      userId,
    );
  }

  @Post('designs/:id/revisions/:revNum/calculate')
  @RequirePermissions('engineering:calculations:run')
  async runCalculations(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('revNum', ParseIntPipe) revNum: number,
    @Body() dto: RunCalculationDto,
  ) {
    return await this.engineeringService.runCalculations(
      organizationId,
      id,
      revNum,
      dto,
      userId,
    );
  }

  @Post('designs/:id/approve')
  @RequirePermissions('engineering:designs:approve')
  async approveDesign(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.engineeringService.approveDesign(organizationId, id, userId);
  }

  @Post('designs/:id/revisions/:revNum/generate-bom')
  @RequirePermissions('bom:boms:manage')
  async generateBom(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Param('revNum', ParseIntPipe) revNum: number,
  ) {
    return await this.bomService.generateBomForDesignRevision(
      organizationId,
      id,
      revNum,
      userId,
    );
  }

  @Get('boms/:id')
  @RequirePermissions('bom:boms:read')
  async getBom(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.bomService.getBomById(organizationId, id);
  }

  @Post('boms/:id/approve')
  @RequirePermissions('bom:boms:approve')
  async approveBom(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return await this.bomService.approveBom(organizationId, id, userId);
  }
}
