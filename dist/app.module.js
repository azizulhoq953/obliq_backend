"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const permissions_module_1 = require("./permissions/permissions.module");
const audit_module_1 = require("./audit/audit.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const leads_module_1 = require("./leads/leads.module");
const tasks_module_1 = require("./tasks/tasks.module");
const reports_module_1 = require("./reports/reports.module");
const customer_portal_module_1 = require("./customer-portal/customer-portal.module");
const settings_module_1 = require("./settings/settings.module");
const audit_interceptor_1 = require("./common/interceptors/audit.interceptor");
const database_options_1 = require("./database/database-options");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => (0, database_options_1.createDatabaseOptions)(process.env),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            permissions_module_1.PermissionsModule,
            audit_module_1.AuditModule,
            dashboard_module_1.DashboardModule,
            leads_module_1.LeadsModule,
            tasks_module_1.TasksModule,
            reports_module_1.ReportsModule,
            customer_portal_module_1.CustomerPortalModule,
            settings_module_1.SettingsModule,
        ],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map