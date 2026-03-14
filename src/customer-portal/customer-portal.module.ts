import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { PermissionsModule } from '../permissions/permissions.module';
import { CustomerPortalController } from './customer-portal.controller';
import { CustomerPortalService } from './customer-portal.service';

@Module({
  imports: [PermissionsModule],
  controllers: [CustomerPortalController],
  providers: [CustomerPortalService, JwtAuthGuard, PermissionGuard],
})
export class CustomerPortalModule {}