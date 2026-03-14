import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { PermissionsModule } from '../permissions/permissions.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [PermissionsModule],
  controllers: [DashboardController],
  providers: [DashboardService, JwtAuthGuard, PermissionGuard],
})
export class DashboardModule {}