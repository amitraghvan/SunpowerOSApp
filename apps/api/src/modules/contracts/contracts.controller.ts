import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GenerateContractDto, SignContractDto } from '@solaros/contracts';

@Controller('contracts')
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @RequirePermissions('contract:contracts:manage')
  async generateContract(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateContractDto,
  ) {
    return await this.contractsService.generateContract(organizationId, dto, userId);
  }

  @Get()
  @RequirePermissions('contract:contracts:read')
  async listContracts(
    @CurrentTenant() organizationId: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    return await this.contractsService.listContracts(organizationId, { customerId, status });
  }

  @Get(':id')
  @RequirePermissions('contract:contracts:read')
  async getContract(
    @CurrentTenant() organizationId: string,
    @Param('id') id: string,
  ) {
    return await this.contractsService.getContract(organizationId, id);
  }

  @Post(':id/sign')
  @RequirePermissions('contract:contracts:sign')
  async signContract(
    @CurrentTenant() organizationId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SignContractDto,
  ) {
    return await this.contractsService.signContract(organizationId, id, dto, userId);
  }
}
