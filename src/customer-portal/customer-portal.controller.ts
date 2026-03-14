import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { CustomerPortalService } from './customer-portal.service';

@Controller('customer-portal')
@UseGuards(JwtAuthGuard)
export class CustomerPortalController {
  constructor(private readonly customerPortalService: CustomerPortalService) {}

  @Get('overview')
  @UseGuards(PermissionGuard)
  @RequirePermissions('customer-portal:read')
  getOverview(@Req() req: any) {
    return this.customerPortalService.getOverview(req.user.id);
  }

  @Get('tickets')
  @UseGuards(PermissionGuard)
  @RequirePermissions('customer-portal:read')
  getTickets(@Req() req: any) {
    return this.customerPortalService.getTickets(req.user.id);
  }
}