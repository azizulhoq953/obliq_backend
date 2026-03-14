import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permission } from '../database/entities/permission.entity';
import { Role } from '../database/entities/role.entity';
import { User } from '../database/entities/user.entity';
import { PermissionsModule } from '../permissions/permissions.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, Role, Permission]), AuditModule, PermissionsModule],
	controllers: [UsersController],
	providers: [UsersService, JwtAuthGuard, PermissionGuard],
	exports: [UsersService],
})
export class UsersModule {}
