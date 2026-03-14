import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermissions('settings:read')
  getAll() {
    return this.settingsService.getAll();
  }

  @Patch()
  @UseGuards(PermissionGuard)
  @RequirePermissions('settings:write')
  update(@Body() body: any) {
    return this.settingsService.update(body);
  }
}