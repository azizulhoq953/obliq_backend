"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permission_entity_1 = require("../database/entities/permission.entity");
const role_entity_1 = require("../database/entities/role.entity");
const user_entity_1 = require("../database/entities/user.entity");
const user_permission_entity_1 = require("../database/entities/user-permission.entity");
const audit_service_1 = require("../audit/audit.service");
let PermissionsService = class PermissionsService {
    constructor(permRepo, usersRepo, upRepo, auditService) {
        this.permRepo = permRepo;
        this.usersRepo = usersRepo;
        this.upRepo = upRepo;
        this.auditService = auditService;
    }
    async getAllPermissions() {
        return this.permRepo.find({ order: { module: 'ASC', action: 'ASC' } });
    }
    async getResolvedPermissions(userId) {
        const user = await this.usersRepo.findOne({
            where: { id: userId },
            relations: ['role', 'role.permissions', 'userPermissions', 'userPermissions.permission'],
        });
        if (!user)
            return [];
        const roleAtoms = user.role?.permissions?.map((p) => p.atom) || [];
        const userAtoms = user.userPermissions?.map((up) => up.permission.atom) || [];
        return [...new Set([...roleAtoms, ...userAtoms])];
    }
    async getUserPermissions(actorId, userId) {
        if (actorId !== userId) {
            await this.ensureManageableTarget(actorId, userId);
        }
        const user = await this.usersRepo.findOne({
            where: { id: userId },
            relations: ['role', 'role.permissions', 'userPermissions', 'userPermissions.permission'],
        });
        if (!user)
            return { role: [], extra: [] };
        const rolePerms = user.role?.permissions || [];
        const extraPerms = user.userPermissions?.map((up) => up.permission) || [];
        return { role: rolePerms, extra: extraPerms };
    }
    async grantPermission(actorId, targetUserId, permissionAtom) {
        const actorPerms = await this.getResolvedPermissions(actorId);
        if (!actorPerms.includes(permissionAtom)) {
            throw new common_1.ForbiddenException('You cannot grant a permission you do not hold');
        }
        await this.ensureManageableTarget(actorId, targetUserId);
        const permission = await this.permRepo.findOne({ where: { atom: permissionAtom } });
        if (!permission)
            throw new common_1.ForbiddenException('Permission not found');
        const existing = await this.upRepo.findOne({
            where: {
                user: { id: targetUserId },
                permission: { id: permission.id },
            },
            relations: ['user', 'permission'],
        });
        if (existing)
            return existing;
        const up = this.upRepo.create({
            user: { id: targetUserId },
            permission,
            grantedBy: { id: actorId },
        });
        await this.upRepo.save(up);
        await this.auditService.log(actorId, 'PERMISSION_GRANTED', {
            permissionAtom,
            targetUserId,
        });
        return up;
    }
    async revokePermission(actorId, targetUserId, permissionAtom) {
        const actorPerms = await this.getResolvedPermissions(actorId);
        if (!actorPerms.includes(permissionAtom)) {
            throw new common_1.ForbiddenException('You cannot revoke a permission you do not hold');
        }
        await this.ensureManageableTarget(actorId, targetUserId);
        const permission = await this.permRepo.findOne({ where: { atom: permissionAtom } });
        if (!permission)
            return;
        await this.upRepo.delete({
            user: { id: targetUserId },
            permission: { id: permission.id },
        });
        await this.auditService.log(actorId, 'PERMISSION_REVOKED', {
            permissionAtom,
            targetUserId,
        });
    }
    async seedPermissions() {
        const atoms = [
            { atom: 'dashboard:read', module: 'dashboard', action: 'read', description: 'View dashboard' },
            { atom: 'leads:read', module: 'leads', action: 'read', description: 'View leads' },
            { atom: 'leads:write', module: 'leads', action: 'write', description: 'Create/edit leads' },
            { atom: 'opportunities:read', module: 'opportunities', action: 'read', description: 'View opportunities' },
            { atom: 'tasks:read', module: 'tasks', action: 'read', description: 'View tasks' },
            { atom: 'tasks:write', module: 'tasks', action: 'write', description: 'Create/edit tasks' },
            { atom: 'reports:read', module: 'reports', action: 'read', description: 'View reports' },
            { atom: 'contacts:read', module: 'contacts', action: 'read', description: 'View contacts' },
            { atom: 'contacts:write', module: 'contacts', action: 'write', description: 'Create/edit contacts' },
            { atom: 'messages:read', module: 'messages', action: 'read', description: 'View messages' },
            { atom: 'configuration:read', module: 'configuration', action: 'read', description: 'View config' },
            { atom: 'configuration:write', module: 'configuration', action: 'write', description: 'Edit config' },
            { atom: 'settings:read', module: 'settings', action: 'read', description: 'View settings' },
            { atom: 'settings:write', module: 'settings', action: 'write', description: 'Edit settings' },
            { atom: 'customer-portal:read', module: 'customer-portal', action: 'read', description: 'Access customer portal' },
            { atom: 'invoice:read', module: 'invoice', action: 'read', description: 'View invoices' },
            { atom: 'users:read', module: 'users', action: 'read', description: 'View users' },
            { atom: 'users:write', module: 'users', action: 'write', description: 'Create/edit users' },
            { atom: 'users:suspend', module: 'users', action: 'suspend', description: 'Suspend users' },
            { atom: 'users:ban', module: 'users', action: 'ban', description: 'Ban users' },
            { atom: 'permissions:read', module: 'permissions', action: 'read', description: 'View permissions' },
            { atom: 'permissions:write', module: 'permissions', action: 'write', description: 'Edit permissions' },
            { atom: 'audit:read', module: 'audit', action: 'read', description: 'View audit log' },
        ];
        for (const atom of atoms) {
            const exists = await this.permRepo.findOne({ where: { atom: atom.atom } });
            if (!exists)
                await this.permRepo.save(this.permRepo.create(atom));
        }
    }
    async ensureManageableTarget(actorId, targetUserId) {
        const [actor, target] = await Promise.all([
            this.getScopedUser(actorId),
            this.getScopedUser(targetUserId),
        ]);
        if (!target) {
            throw new common_1.NotFoundException('Target user not found');
        }
        if (actor.role?.name === role_entity_1.RoleName.ADMIN) {
            return;
        }
        if (actor.role?.name === role_entity_1.RoleName.MANAGER
            && target.managerId === actor.id
            && [role_entity_1.RoleName.AGENT, role_entity_1.RoleName.CUSTOMER].includes(target.role?.name)) {
            return;
        }
        throw new common_1.ForbiddenException('You cannot manage permissions for this user');
    }
    async getScopedUser(userId) {
        const user = await this.usersRepo.findOne({
            where: { id: userId },
            relations: ['role', 'role.permissions', 'userPermissions', 'userPermissions.permission'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(user_permission_entity_1.UserPermission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map