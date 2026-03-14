import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { AuditLog } from '../database/entities/audit-log.entity';
import { PermissionsModule } from '../permissions/permissions.module';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
	imports: [TypeOrmModule.forFeature([AuditLog]), forwardRef(() => PermissionsModule)],
	controllers: [AuditController],
	providers: [AuditService, JwtAuthGuard, PermissionGuard],
	exports: [AuditService],
})
export class AuditModule {}
