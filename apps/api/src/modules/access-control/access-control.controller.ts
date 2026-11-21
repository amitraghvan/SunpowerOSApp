import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { AccessControlService } from './access-control.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantContext } from '@solaros/types';
import { API_CONSTANTS } from '@solaros/config';
import { CreateRoleRequestDto, UpdateRoleRequestDto } from '@solaros/contracts';

@ApiTags('Access Control & RBAC')
@ApiBearerAuth()
@ApiHeader({ name: API_CONSTANTS.TENANT_ID_HEADER, required: false })
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
@Controller('access-control')
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @Get('permissions')
  @RequirePermissions('iam:permissions:read')
  @ApiOperation({ summary: 'List all permission definitions in system' })
  async listPermissions() {
    return this.accessControlService.listPermissions();
  }

  @Get('roles')
  @RequirePermissions('iam:roles:read')
  @ApiOperation({ summary: 'List roles (system + organization custom)' })
  async listRoles(@CurrentTenant() tenant: TenantContext) {
    return this.accessControlService.listRoles(tenant.organizationId);
  }

  @Get('roles/:id')
  @RequirePermissions('iam:roles:read')
  @ApiOperation({ summary: 'Get role details and assigned permissions' })
  async getRoleById(@Param('id') id: string, @CurrentTenant() tenant: TenantContext) {
    return this.accessControlService.getRoleById(id, tenant.organizationId);
  }

  @Post('roles')
  @RequirePermissions('iam:roles:manage')
  @ApiOperation({ summary: 'Create custom role for organization' })
  async createRole(
    @Body() dto: CreateRoleRequestDto,
    @CurrentTenant() tenant: TenantContext
  ) {
    return this.accessControlService.createRole(tenant.organizationId, dto);
  }

  @Patch('roles/:id')
  @RequirePermissions('iam:roles:manage')
  @ApiOperation({ summary: 'Update custom role' })
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleRequestDto,
    @CurrentTenant() tenant: TenantContext
  ) {
    return this.accessControlService.updateRole(id, tenant.organizationId, dto);
  }

  @Delete('roles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('iam:roles:manage')
  @ApiOperation({ summary: 'Delete custom role' })
  async deleteRole(@Param('id') id: string, @CurrentTenant() tenant: TenantContext) {
    await this.accessControlService.deleteRole(id, tenant.organizationId);
  }
}
