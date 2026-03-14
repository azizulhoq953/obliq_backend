import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { PermissionsModule } from '../permissions/permissions.module';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [PermissionsModule],
  controllers: [LeadsController],
  providers: [LeadsService, JwtAuthGuard, PermissionGuard],
})
export class LeadsModule {}