"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const audit_module_1 = require("../audit/audit.module");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const permission_guard_1 = require("../auth/guards/permission.guard");
const permission_entity_1 = require("../database/entities/permission.entity");
const user_permission_entity_1 = require("../database/entities/user-permission.entity");
const user_entity_1 = require("../database/entities/user.entity");
const permissions_controller_1 = require("./permissions.controller");
const permissions_service_1 = require("./permissions.service");
let PermissionsModule = class PermissionsModule {
};
exports.PermissionsModule = PermissionsModule;
exports.PermissionsModule = PermissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([permission_entity_1.Permission, user_entity_1.User, user_permission_entity_1.UserPermission]), (0, common_1.forwardRef)(() => audit_module_1.AuditModule)],
        controllers: [permissions_controller_1.PermissionsController],
        providers: [permissions_service_1.PermissionsService, jwt_auth_guard_1.JwtAuthGuard, permission_guard_1.PermissionGuard],
        exports: [permissions_service_1.PermissionsService],
    })
], PermissionsModule);
//# sourceMappingURL=permissions.module.js.map