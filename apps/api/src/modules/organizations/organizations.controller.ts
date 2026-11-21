import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { OrganizationsService } from './organizations.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserProfile, TenantContext } from '@solaros/types';
import { API_CONSTANTS } from '@solaros/config';
import {
  SwitchOrganizationRequestDto,
  CreateInvitationRequestDto,
  AcceptInvitationRequestDto,
} from '@solaros/contracts';

@ApiTags('Organizations & Branches')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'List all organizations the authenticated user belongs to' })
  async listUserOrganizations(@CurrentUser() user: UserProfile) {
    return this.organizationsService.listUserOrganizations(user.id);
  }

  @Post(':id/switch')
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard)
  @ApiOperation({ summary: 'Switch active organization context and receive new session' })
  async switchOrganization(
    @Param('id') organizationId: string,
    @Body() dto: { branchId?: string },
    @CurrentUser() user: UserProfile,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'];

    const result = await this.organizationsService.switchOrganization(
      user.id,
      organizationId,
      dto.branchId,
      ipAddress,
      userAgent
    );

    if (result.sessionToken) {
      res.cookie('solaros_session', result.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: result.expiresIn * 1000,
      });
    }

    return result;
  }

  @Get(':id/branches')
  @ApiBearerAuth()
  @ApiHeader({ name: API_CONSTANTS.TENANT_ID_HEADER, required: false })
  @UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
  @RequirePermissions('org:branches:read')
  @ApiOperation({ summary: 'List operating branches for organization' })
  async listBranches(@Param('id') organizationId: string) {
    return this.organizationsService.listBranches(organizationId);
  }

  @Post(':id/branches')
  @ApiBearerAuth()
  @ApiHeader({ name: API_CONSTANTS.TENANT_ID_HEADER, required: false })
  @UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
  @RequirePermissions('org:branches:manage')
  @ApiOperation({ summary: 'Create new branch in organization' })
  async createBranch(
    @Param('id') organizationId: string,
    @Body()
    dto: {
      code: string;
      name: string;
      city: string;
      state: string;
      address?: string;
      postalCode?: string;
    }
  ) {
    return this.organizationsService.createBranch(organizationId, dto);
  }

  @Get(':id/invitations')
  @ApiBearerAuth()
  @ApiHeader({ name: API_CONSTANTS.TENANT_ID_HEADER, required: false })
  @UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
  @RequirePermissions('org:invitations:manage')
  @ApiOperation({ summary: 'List pending and historical invitations' })
  async listInvitations(@Param('id') organizationId: string) {
    return this.organizationsService.listInvitations(organizationId);
  }

  @Post(':id/invitations')
  @ApiBearerAuth()
  @ApiHeader({ name: API_CONSTANTS.TENANT_ID_HEADER, required: false })
  @UseGuards(AuthenticationGuard, TenantContextGuard, PermissionsGuard)
  @RequirePermissions('org:invitations:manage')
  @ApiOperation({ summary: 'Invite new employee to organization' })
  async createInvitation(
    @Param('id') organizationId: string,
    @CurrentUser() user: UserProfile,
    @Body() dto: CreateInvitationRequestDto
  ) {
    return this.organizationsService.createInvitation(organizationId, user.id, dto);
  }

  @Public()
  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept invitation and register or join organization' })
  async acceptInvitation(@Body() dto: AcceptInvitationRequestDto) {
    return this.organizationsService.acceptInvitation(dto);
  }
}
