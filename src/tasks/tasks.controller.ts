import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermissions('tasks:read')
  findAll() {
    return this.tasksService.findAll();
  }

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermissions('tasks:write')
  create(@Req() req: any, @Body() body: any) {
    return this.tasksService.create(req.user.id, body);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @RequirePermissions('tasks:write')
  update(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.update(id, body);
  }

  @Patch(':id/complete')
  @UseGuards(PermissionGuard)
  @RequirePermissions('tasks:write')
  complete(@Param('id') id: string) {
    return this.tasksService.complete(id);
  }
}