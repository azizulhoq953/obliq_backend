import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { PermissionsModule } from '../permissions/permissions.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [PermissionsModule],
  controllers: [TasksController],
  providers: [TasksService, JwtAuthGuard, PermissionGuard],
})
export class TasksModule {}