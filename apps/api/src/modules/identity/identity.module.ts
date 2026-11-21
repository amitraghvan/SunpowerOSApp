import { Module, Global } from '@nestjs/common';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { SessionsController } from './sessions.controller';
import { AuthenticationGuard } from '../../common/guards/authentication.guard';
import { TenantContextGuard } from '../../common/guards/tenant-context.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Global()
@Module({
  controllers: [AuthController, UsersController, SessionsController],
  providers: [
    PasswordService,
    SessionService,
    AuthService,
    UsersService,
    AuthenticationGuard,
    TenantContextGuard,
    PermissionsGuard,
  ],
  exports: [
    PasswordService,
    SessionService,
    AuthService,
    UsersService,
    AuthenticationGuard,
    TenantContextGuard,
    PermissionsGuard,
  ],
})
export class IdentityModule {}
