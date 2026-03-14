import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  @UseGuards(PermissionGuard)
  @RequirePermissions('permissions:read')
  getAll() {
    return this.permissionsService.getAllPermissions();
  }

  @Get('my')
  async getMyPermissions(@Req() req: any) {
    return this.permissionsService.getResolvedPermissions(req.user.id);
  }

  @Get('user/:userId')
  @UseGuards(PermissionGuard)
  @RequirePermissions('permissions:read')
  getUserPermissions(@Req() req: any, @Param('userId') userId: string) {
    return this.permissionsService.getUserPermissions(req.user.id, userId);
  }

  @Post('grant')
  @UseGuards(PermissionGuard)
  @RequirePermissions('permissions:write')
  grant(
    @Req() req: any,
    @Body() body: { targetUserId: string; permissionAtom: string },
  ) {
    return this.permissionsService.grantPermission(
      req.user.id,
      body.targetUserId,
      body.permissionAtom,
    );
  }

  @Delete('revoke')
  @UseGuards(PermissionGuard)
  @RequirePermissions('permissions:write')
  revoke(
    @Req() req: any,
    @Body() body: { targetUserId: string; permissionAtom: string },
  ) {
    return this.permissionsService.revokePermission(
      req.user.id,
      body.targetUserId,
      body.permissionAtom,
    );
  }
}