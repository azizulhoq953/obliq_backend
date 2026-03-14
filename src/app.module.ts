import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuditModule } from './audit/audit.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LeadsModule } from './leads/leads.module';
import { TasksModule } from './tasks/tasks.module';
import { ReportsModule } from './reports/reports.module';
import { CustomerPortalModule } from './customer-portal/customer-portal.module';
import { SettingsModule } from './settings/settings.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { createDatabaseOptions } from './database/database-options';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    TypeOrmModule.forRootAsync({
      useFactory: () => createDatabaseOptions(process.env),
    }),
    AuthModule,
    UsersModule,
    PermissionsModule,
    AuditModule,
    DashboardModule,
    LeadsModule,
    TasksModule,
    ReportsModule,
    CustomerPortalModule,
    SettingsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}