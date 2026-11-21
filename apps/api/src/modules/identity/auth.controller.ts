import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import {
  LoginRequestDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
} from '@solaros/contracts';
import { UserProfile, TenantContext } from '@solaros/types';

@ApiTags('Authentication & Identity')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and obtain session token with HttpOnly cookie' })
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'];

    const result = await this.authService.login(dto, ipAddress, userAgent);

    // Set secure HttpOnly session cookie
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

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate active session and clear session cookie' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawToken =
      req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
      req.cookies?.['solaros_session'];

    if (rawToken) {
      await this.authService.logout(rawToken);
    }

    res.clearCookie('solaros_session', { path: '/' });
    return { message: 'Successfully logged out.' };
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AuthenticationGuard, TenantContextGuard)
  @ApiOperation({ summary: 'Get current authenticated user identity and effective permissions' })
  async getMe(
    @CurrentUser() user: UserProfile,
    @CurrentTenant() tenant: TenantContext
  ) {
    return this.authService.getMe(user.id, tenant.organizationId);
  }

  @Public()
  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate password reset request' })
  async forgotPassword(@Body() dto: ForgotPasswordRequestDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete password reset using reset token' })
  async resetPassword(@Body() dto: ResetPasswordRequestDto) {
    return this.authService.resetPassword(dto);
  }
}
