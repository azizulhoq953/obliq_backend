import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permission } from '../database/entities/permission.entity';
import { UserPermission } from '../database/entities/user-permission.entity';
import { User } from '../database/entities/user.entity';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';

@Module({
	imports: [TypeOrmModule.forFeature([Permission, User, UserPermission]), forwardRef(() => AuditModule)],
	controllers: [PermissionsController],
	providers: [PermissionsService, JwtAuthGuard, PermissionGuard],
	exports: [PermissionsService],
})
export class PermissionsModule {}
