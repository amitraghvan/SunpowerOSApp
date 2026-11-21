import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthenticationGuard } from '../../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../../common/guards/tenant-context.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { PlatformSupportService } from '../services/platform-support.service';
import {
  CreateSupportTicketRequest,
  ReplySupportTicketRequest,
  ListSupportTicketsQuery,
} from '@solaros/contracts';

@Controller('support')
@UseGuards(AuthenticationGuard, TenantContextGuard)
export class TenantSupportController {
  constructor(private readonly supportService: PlatformSupportService) {}

  @Post('tickets')
  @HttpCode(HttpStatus.CREATED)
  async createTicket(
    @CurrentTenant('organizationId') organizationId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateSupportTicketRequest,
  ) {
    return await this.supportService.createTenantTicket(organizationId, user.id, dto);
  }

  @Get('tickets')
  async listTickets(
    @CurrentTenant('organizationId') organizationId: string,
    @Query() query: ListSupportTicketsQuery,
  ) {
    return await this.supportService.listTickets(query, false, organizationId);
  }

  @Get('tickets/:id')
  async getTicket(
    @CurrentTenant('organizationId') organizationId: string,
    @Param('id') ticketId: string,
  ) {
    return await this.supportService.getTicketDetail(ticketId, false, organizationId);
  }

  @Post('tickets/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  async replyTicket(
    @CurrentTenant('organizationId') organizationId: string,
    @CurrentUser() user: any,
    @Param('id') ticketId: string,
    @Body() dto: ReplySupportTicketRequest,
  ) {
    return await this.supportService.replyTicket(
      ticketId,
      user.id,
      'TENANT_USER',
      dto,
      organizationId,
    );
  }
}
