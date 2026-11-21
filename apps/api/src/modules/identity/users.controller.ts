import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { TenantContext } from '@solaros/types';
import { API_CONSTANTS } from '@solaros/config';
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  AssignRolesRequestDto,
} from '@solaros/contracts';

@ApiTags('User Administration & Membership')
@ApiBearerAuth()
@ApiHeader({ name: API_CONSTANTS.TENANT_ID_HEADER, required: false })
@UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('iam:users:read')
  @ApiOperation({ summary: 'List team members in current organization' })
  async listUsers(@CurrentTenant() tenant: TenantContext) {
    return this.usersService.listUsers(tenant.organizationId);
  }

  @Get(':id')
  @RequirePermissions('iam:users:read')
  @ApiOperation({ summary: 'Get user profile and role details' })
  async getUserById(@Param('id') id: string, @CurrentTenant() tenant: TenantContext) {
    return this.usersService.getUserById(id, tenant.organizationId);
  }

  @Post()
  @RequirePermissions('iam:users:create')
  @ApiOperation({ summary: 'Add or invite new user to organization' })
  async createUser(
    @Body() dto: CreateUserRequestDto,
    @CurrentTenant() tenant: TenantContext
  ) {
    return this.usersService.createUser(tenant.organizationId, dto);
  }

  @Patch(':id')
  @RequirePermissions('iam:users:update')
  @ApiOperation({ summary: 'Update user profile and status' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserRequestDto,
    @CurrentTenant() tenant: TenantContext
  ) {
    return this.usersService.updateUser(id, tenant.organizationId, dto);
  }

  @Put(':id/roles')
  @RequirePermissions('iam:roles:manage')
  @ApiOperation({ summary: 'Assign roles to user in organization' })
  async assignRoles(
    @Param('id') id: string,
    @Body() dto: AssignRolesRequestDto,
    @CurrentTenant() tenant: TenantContext
  ) {
    return this.usersService.assignRoles(id, tenant.organizationId, dto);
  }
}
