import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { UsersService } from './users.service';
import { RoleName } from '../database/entities/role.entity';
import { UserStatus } from '../database/entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermissions('users:read')
  findAll(@Req() req: any) {
    return this.usersService.findAll(req.user.id);
  }

  @Get(':id')
  @UseGuards(PermissionGuard)
  @RequirePermissions('users:read')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.usersService.findAccessibleById(req.user.id, id);
  }

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermissions('users:write')
  create(@Req() req: any, @Body() body: any) {
    return this.usersService.create(req.user.id, body);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @RequirePermissions('users:write')
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.usersService.update(req.user.id, id, body);
  }

  @Patch(':id/status')
  @UseGuards(PermissionGuard)
  @RequirePermissions('users:suspend')
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: UserStatus },
  ) {
    return this.usersService.updateStatus(req.user.id, id, body.status);
  }

  @Patch(':id/ban')
  @UseGuards(PermissionGuard)
  @RequirePermissions('users:ban')
  ban(@Req() req: any, @Param('id') id: string) {
    return this.usersService.setStatus(req.user.id, id, UserStatus.BANNED);
  }
}