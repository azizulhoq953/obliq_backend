import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { PermissionsModule } from '../permissions/permissions.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [PermissionsModule],
  controllers: [SettingsController],
  providers: [SettingsService, JwtAuthGuard, PermissionGuard],
})
export class SettingsModule {}