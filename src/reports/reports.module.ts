import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { PermissionsModule } from '../permissions/permissions.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [PermissionsModule],
  controllers: [ReportsController],
  providers: [ReportsService, JwtAuthGuard, PermissionGuard],
})
export class ReportsModule {}