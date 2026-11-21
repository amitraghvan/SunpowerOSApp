import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { PlatformAuthService } from '../services/platform-auth.service';
import { PlatformAdminGuard } from '../guards/platform-admin.guard';
import { CurrentPlatformAdmin } from '../decorators/platform-admin.decorator';
import { PlatformLoginRequest } from '@solaros/contracts';

@Controller('platform-admin/auth')
export class PlatformAuthController {
  constructor(private readonly authService: PlatformAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: PlatformLoginRequest, @Req() req: Request) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || undefined;
    const userAgent = req.headers['user-agent'] || undefined;
    return await this.authService.login(dto, ipAddress, userAgent);
  }

  @Get('me')
  @UseGuards(PlatformAdminGuard)
  async getMe(@CurrentPlatformAdmin() admin: any) {
    return await this.authService.getProfile(admin.id);
  }
}
