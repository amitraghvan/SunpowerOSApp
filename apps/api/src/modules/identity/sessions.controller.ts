import {
  Controller,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { SessionService } from './session.service';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserProfile } from '@solaros/types';

@ApiTags('Sessions & Device Security')
@ApiBearerAuth()
@UseGuards(AuthenticationGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'List all active login sessions for current user' })
  async listSessions(@CurrentUser() user: UserProfile, @Req() req: Request & { session?: any }) {
    const currentSessionId = req.session?.id;
    return this.sessionService.listUserSessions(user.id, currentSessionId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a specific session by ID' })
  async revokeSession(@Param('id') sessionId: string, @CurrentUser() user: UserProfile) {
    await this.sessionService.revokeSessionById(sessionId, user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all sessions except the current active session' })
  async revokeOtherSessions(@CurrentUser() user: UserProfile, @Req() req: Request & { session?: any }) {
    const currentSessionId = req.session?.id;
    const count = await this.sessionService.revokeAllUserSessions(user.id, currentSessionId);
    return { revokedCount: count, message: 'All other sessions have been terminated.' };
  }
}
