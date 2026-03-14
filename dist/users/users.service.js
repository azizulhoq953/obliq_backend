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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const permission_entity_1 = require("../database/entities/permission.entity");
const user_entity_1 = require("../database/entities/user.entity");
const role_entity_1 = require("../database/entities/role.entity");
const audit_service_1 = require("../audit/audit.service");
let UsersService = class UsersService {
    constructor(usersRepo, rolesRepo, permissionsRepo, auditService) {
        this.usersRepo = usersRepo;
        this.rolesRepo = rolesRepo;
        this.permissionsRepo = permissionsRepo;
        this.auditService = auditService;
    }
    async findById(id) {
        return this.getUserWithAccessRelations(id);
    }
    async findAccessibleById(actorId, targetId) {
        const actor = await this.getActor(actorId);
        const target = await this.getManagedOrOwnTarget(actor, targetId);
        return target;
    }
    async findAll(actorId) {
        const actor = await this.getActor(actorId);
        if (this.isAdmin(actor)) {
            return this.usersRepo.find({ relations: ['role'] });
        }
        if (this.isManager(actor)) {
            return this.usersRepo.find({
                where: [{ id: actor.id }, { managerId: actor.id }],
                relations: ['role'],
            });
        }
        return this.usersRepo.find({ where: { id: actor.id }, relations: ['role'] });
    }
    async create(actorId, dto) {
        const actor = await this.getActor(actorId);
        this.ensureRoleAssignmentAllowed(actor, dto.roleName);
        const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email already in use');
        const role = await this.rolesRepo.findOne({ where: { name: dto.roleName } });
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        const hashed = await bcrypt.hash(dto.password, 12);
        const managerId = this.resolveManagerId(actor, dto.roleName, dto.managerId);
        const user = this.usersRepo.create({
            email: dto.email,
            password: hashed,
            firstName: dto.firstName,
            lastName: dto.lastName,
            role,
            managerId,
            status: user_entity_1.UserStatus.ACTIVE,
        });
        const saved = await this.usersRepo.save(user);
        await this.auditService.log(actorId, 'USER_CREATED', {
            email: dto.email,
            role: dto.roleName,
            managerId,
        }, saved.id);
        return saved;
    }
    async update(actorId, targetId, dto) {
        const actor = await this.getActor(actorId);
        const target = await this.getManagedOrOwnTarget(actor, targetId);
        const isSelfUpdate = actor.id === target.id;
        if (dto.roleName) {
            if (isSelfUpdate) {
                throw new common_1.ForbiddenException('You cannot change your own role');
            }
            this.ensureRoleAssignmentAllowed(actor, dto.roleName);
        }
        if (dto.managerId !== undefined) {
            if (!this.isAdmin(actor)) {
                throw new common_1.ForbiddenException('Only admins can reassign managers explicitly');
            }
        }
        if (dto.email) {
            const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
            if (existing && existing.id !== target.id) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        if (dto.roleName) {
            const role = await this.rolesRepo.findOne({ where: { name: dto.roleName } });
            if (!role)
                throw new common_1.NotFoundException('Role not found');
            target.role = role;
            target.managerId = this.resolveManagerId(actor, dto.roleName, dto.managerId ?? target.managerId);
        }
        else if (dto.managerId !== undefined) {
            target.managerId = dto.managerId || null;
        }
        if (dto.email !== undefined)
            target.email = dto.email;
        if (dto.firstName !== undefined)
            target.firstName = dto.firstName;
        if (dto.lastName !== undefined)
            target.lastName = dto.lastName;
        const saved = await this.usersRepo.save(target);
        await this.auditService.log(actorId, 'USER_UPDATED', {
            targetId,
            changes: {
                email: dto.email,
                firstName: dto.firstName,
                lastName: dto.lastName,
                roleName: dto.roleName,
                managerId: dto.managerId,
            },
        }, targetId);
        return saved;
    }
    async updateStatus(actorId, targetId, status) {
        if (status === user_entity_1.UserStatus.BANNED) {
            throw new common_1.BadRequestException('Use the dedicated ban endpoint for banned status');
        }
        return this.setStatus(actorId, targetId, status);
    }
    async setStatus(actorId, targetId, status) {
        const actor = await this.getActor(actorId);
        const target = await this.getManagedTarget(actor, targetId);
        if (target.id === actor.id) {
            throw new common_1.ForbiddenException('You cannot change your own status');
        }
        await this.usersRepo.update(targetId, { status });
        await this.auditService.log(actorId, `USER_${status.toUpperCase()}`, {}, targetId);
        return { success: true };
    }
    async seedRoles() {
        const roles = [
            { name: role_entity_1.RoleName.ADMIN, description: 'Full access', defaultAtoms: ['dashboard:read', 'leads:read', 'leads:write', 'opportunities:read', 'tasks:read', 'tasks:write', 'reports:read', 'contacts:read', 'contacts:write', 'messages:read', 'configuration:read', 'configuration:write', 'settings:read', 'settings:write', 'customer-portal:read', 'invoice:read', 'users:read', 'users:write', 'users:suspend', 'users:ban', 'permissions:read', 'permissions:write', 'audit:read'] },
            { name: role_entity_1.RoleName.MANAGER, description: 'Team management', defaultAtoms: ['dashboard:read', 'leads:read', 'leads:write', 'opportunities:read', 'tasks:read', 'tasks:write', 'reports:read', 'contacts:read', 'messages:read', 'customer-portal:read', 'users:read', 'users:write', 'users:suspend', 'users:ban', 'permissions:read', 'permissions:write'] },
            { name: role_entity_1.RoleName.AGENT, description: 'Operational access', defaultAtoms: ['dashboard:read', 'tasks:read', 'contacts:read', 'messages:read'] },
            { name: role_entity_1.RoleName.CUSTOMER, description: 'Customer portal', defaultAtoms: ['dashboard:read', 'customer-portal:read'] },
        ];
        const allAtoms = [...new Set(roles.flatMap((role) => role.defaultAtoms))];
        const permissions = await this.permissionsRepo.find({ where: { atom: (0, typeorm_2.In)(allAtoms) } });
        const permissionMap = new Map(permissions.map((permission) => [permission.atom, permission]));
        for (const roleSeed of roles) {
            const rolePermissions = roleSeed.defaultAtoms
                .map((atom) => permissionMap.get(atom))
                .filter((permission) => Boolean(permission));
            let role = await this.rolesRepo.findOne({
                where: { name: roleSeed.name },
                relations: ['permissions'],
            });
            if (!role) {
                role = this.rolesRepo.create({
                    name: roleSeed.name,
                    description: roleSeed.description,
                    permissions: rolePermissions,
                });
            }
            else {
                role.description = roleSeed.description;
                role.permissions = rolePermissions;
            }
            await this.rolesRepo.save(role);
        }
    }
    async getUserWithAccessRelations(id) {
        return this.usersRepo.findOne({
            where: { id },
            relations: ['role', 'role.permissions', 'userPermissions', 'userPermissions.permission'],
        });
    }
    async getActor(actorId) {
        const actor = await this.getUserWithAccessRelations(actorId);
        if (!actor) {
            throw new common_1.NotFoundException('Actor not found');
        }
        return actor;
    }
    async getManagedOrOwnTarget(actor, targetId) {
        if (actor.id === targetId) {
            const self = await this.getUserWithAccessRelations(targetId);
            if (!self) {
                throw new common_1.NotFoundException('User not found');
            }
            return self;
        }
        return this.getManagedTarget(actor, targetId);
    }
    async getManagedTarget(actor, targetId) {
        const target = await this.getUserWithAccessRelations(targetId);
        if (!target) {
            throw new common_1.NotFoundException('User not found');
        }
        if (this.isAdmin(actor)) {
            return target;
        }
        if (this.isManager(actor)
            && target.managerId === actor.id
            && [role_entity_1.RoleName.AGENT, role_entity_1.RoleName.CUSTOMER].includes(target.role?.name)) {
            return target;
        }
        throw new common_1.ForbiddenException('You cannot manage this user');
    }
    ensureRoleAssignmentAllowed(actor, roleName) {
        if (this.isAdmin(actor)) {
            return;
        }
        if (this.isManager(actor) && [role_entity_1.RoleName.AGENT, role_entity_1.RoleName.CUSTOMER].includes(roleName)) {
            return;
        }
        throw new common_1.ForbiddenException('You cannot assign this role');
    }
    resolveManagerId(actor, roleName, requestedManagerId) {
        if (this.isAdmin(actor)) {
            return requestedManagerId ?? null;
        }
        if (this.isManager(actor) && [role_entity_1.RoleName.AGENT, role_entity_1.RoleName.CUSTOMER].includes(roleName)) {
            return actor.id;
        }
        return requestedManagerId ?? null;
    }
    isAdmin(user) {
        return user.role?.name === role_entity_1.RoleName.ADMIN;
    }
    isManager(user) {
        return user.role?.name === role_entity_1.RoleName.MANAGER;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(2, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], UsersService);
//# sourceMappingURL=users.service.js.map