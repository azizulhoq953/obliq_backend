import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { LeadsService } from './leads.service';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermissions('leads:read')
  findAll() {
    return this.leadsService.findAll();
  }

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermissions('leads:write')
  create(@Req() req: any, @Body() body: any) {
    return this.leadsService.create(req.user.id, body);
  }

  @Patch(':id')
  @UseGuards(PermissionGuard)
  @RequirePermissions('leads:write')
  update(@Param('id') id: string, @Body() body: any) {
    return this.leadsService.update(id, body);
  }

  @Patch(':id/assign')
  @UseGuards(PermissionGuard)
  @RequirePermissions('leads:write')
  assign(@Param('id') id: string, @Body() body: { assigneeId: string }) {
    return this.leadsService.assign(id, body.assigneeId);
  }
}