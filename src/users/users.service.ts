import {
  Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Permission } from '../database/entities/permission.entity';
import { User, UserStatus } from '../database/entities/user.entity';
import { Role, RoleName } from '../database/entities/role.entity';
import { AuditService } from '../audit/audit.service';

type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleName: RoleName;
  managerId?: string;
};

type UpdateUserInput = {
  email?: string;
  firstName?: string;
  lastName?: string;
  roleName?: RoleName;
  managerId?: string | null;
};

type UserAccessRecord = User & {
  role: Role;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(Permission) private permissionsRepo: Repository<Permission>,
    private auditService: AuditService,
  ) {}

  async findById(id: string) {
    return this.getUserWithAccessRelations(id);
  }

  async findAccessibleById(actorId: string, targetId: string) {
    const actor = await this.getActor(actorId);
    const target = await this.getManagedOrOwnTarget(actor, targetId);

    return target;
  }

  async findAll(actorId: string) {
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

  async create(actorId: string, dto: CreateUserInput) {
    const actor = await this.getActor(actorId);
    this.ensureRoleAssignmentAllowed(actor, dto.roleName);

    const exists = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    const role = await this.rolesRepo.findOne({ where: { name: dto.roleName } });
    if (!role) throw new NotFoundException('Role not found');

    const hashed = await bcrypt.hash(dto.password, 12);
    const managerId = this.resolveManagerId(actor, dto.roleName, dto.managerId);

    const user = this.usersRepo.create({
      email: dto.email,
      password: hashed,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role,
      managerId,
      status: UserStatus.ACTIVE,
    });
    const saved = await this.usersRepo.save(user);
    await this.auditService.log(actorId, 'USER_CREATED', {
      email: dto.email,
      role: dto.roleName,
      managerId,
    }, saved.id);
    return saved;
  }

  async update(actorId: string, targetId: string, dto: UpdateUserInput) {
    const actor = await this.getActor(actorId);
    const target = await this.getManagedOrOwnTarget(actor, targetId);
    const isSelfUpdate = actor.id === target.id;

    if (dto.roleName) {
      if (isSelfUpdate) {
        throw new ForbiddenException('You cannot change your own role');
      }
      this.ensureRoleAssignmentAllowed(actor, dto.roleName);
    }

    if (dto.managerId !== undefined) {
      if (!this.isAdmin(actor)) {
        throw new ForbiddenException('Only admins can reassign managers explicitly');
      }
    }

    if (dto.email) {
      const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
      if (existing && existing.id !== target.id) {
        throw new ConflictException('Email already in use');
      }
    }

    if (dto.roleName) {
      const role = await this.rolesRepo.findOne({ where: { name: dto.roleName } });
      if (!role) throw new NotFoundException('Role not found');
      target.role = role;
      target.managerId = this.resolveManagerId(actor, dto.roleName, dto.managerId ?? target.managerId);
    } else if (dto.managerId !== undefined) {
      target.managerId = dto.managerId || null;
    }

    if (dto.email !== undefined) target.email = dto.email;
    if (dto.firstName !== undefined) target.firstName = dto.firstName;
    if (dto.lastName !== undefined) target.lastName = dto.lastName;

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

  async updateStatus(actorId: string, targetId: string, status: UserStatus) {
    if (status === UserStatus.BANNED) {
      throw new BadRequestException('Use the dedicated ban endpoint for banned status');
    }

    return this.setStatus(actorId, targetId, status);
  }

  async setStatus(actorId: string, targetId: string, status: UserStatus) {
    const actor = await this.getActor(actorId);
    const target = await this.getManagedTarget(actor, targetId);

    if (target.id === actor.id) {
      throw new ForbiddenException('You cannot change your own status');
    }

    await this.usersRepo.update(targetId, { status });
    await this.auditService.log(actorId, `USER_${status.toUpperCase()}`, {}, targetId);
    return { success: true };
  }

  async seedRoles() {
    const roles = [
      { name: RoleName.ADMIN, description: 'Full access', defaultAtoms: ['dashboard:read', 'leads:read', 'leads:write', 'opportunities:read', 'tasks:read', 'tasks:write', 'reports:read', 'contacts:read', 'contacts:write', 'messages:read', 'configuration:read', 'configuration:write', 'settings:read', 'settings:write', 'customer-portal:read', 'invoice:read', 'users:read', 'users:write', 'users:suspend', 'users:ban', 'permissions:read', 'permissions:write', 'audit:read'] },
      { name: RoleName.MANAGER, description: 'Team management', defaultAtoms: ['dashboard:read', 'leads:read', 'leads:write', 'opportunities:read', 'tasks:read', 'tasks:write', 'reports:read', 'contacts:read', 'messages:read', 'customer-portal:read', 'users:read', 'users:write', 'users:suspend', 'users:ban', 'permissions:read', 'permissions:write'] },
      { name: RoleName.AGENT, description: 'Operational access', defaultAtoms: ['dashboard:read', 'tasks:read', 'contacts:read', 'messages:read'] },
      { name: RoleName.CUSTOMER, description: 'Customer portal', defaultAtoms: ['dashboard:read', 'customer-portal:read'] },
    ];

    const allAtoms = [...new Set(roles.flatMap((role) => role.defaultAtoms))];
    const permissions = await this.permissionsRepo.find({ where: { atom: In(allAtoms) } });
    const permissionMap = new Map(permissions.map((permission) => [permission.atom, permission]));

    for (const roleSeed of roles) {
      const rolePermissions = roleSeed.defaultAtoms
        .map((atom) => permissionMap.get(atom))
        .filter((permission): permission is Permission => Boolean(permission));

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
      } else {
        role.description = roleSeed.description;
        role.permissions = rolePermissions;
      }

      await this.rolesRepo.save(role);
    }
  }

  private async getUserWithAccessRelations(id: string) {
    return this.usersRepo.findOne({
      where: { id },
      relations: ['role', 'role.permissions', 'userPermissions', 'userPermissions.permission'],
    });
  }

  private async getActor(actorId: string): Promise<UserAccessRecord> {
    const actor = await this.getUserWithAccessRelations(actorId);
    if (!actor) {
      throw new NotFoundException('Actor not found');
    }

    return actor as UserAccessRecord;
  }

  private async getManagedOrOwnTarget(actor: UserAccessRecord, targetId: string) {
    if (actor.id === targetId) {
      const self = await this.getUserWithAccessRelations(targetId);
      if (!self) {
        throw new NotFoundException('User not found');
      }

      return self as UserAccessRecord;
    }

    return this.getManagedTarget(actor, targetId);
  }

  private async getManagedTarget(actor: UserAccessRecord, targetId: string) {
    const target = await this.getUserWithAccessRelations(targetId);
    if (!target) {
      throw new NotFoundException('User not found');
    }

    if (this.isAdmin(actor)) {
      return target as UserAccessRecord;
    }

    if (
      this.isManager(actor)
      && target.managerId === actor.id
      && [RoleName.AGENT, RoleName.CUSTOMER].includes(target.role?.name)
    ) {
      return target as UserAccessRecord;
    }

    throw new ForbiddenException('You cannot manage this user');
  }

  private ensureRoleAssignmentAllowed(actor: UserAccessRecord, roleName: RoleName) {
    if (this.isAdmin(actor)) {
      return;
    }

    if (this.isManager(actor) && [RoleName.AGENT, RoleName.CUSTOMER].includes(roleName)) {
      return;
    }

    throw new ForbiddenException('You cannot assign this role');
  }

  private resolveManagerId(
    actor: UserAccessRecord,
    roleName: RoleName,
    requestedManagerId?: string | null,
  ) {
    if (this.isAdmin(actor)) {
      return requestedManagerId ?? null;
    }

    if (this.isManager(actor) && [RoleName.AGENT, RoleName.CUSTOMER].includes(roleName)) {
      return actor.id;
    }

    return requestedManagerId ?? null;
  }

  private isAdmin(user: UserAccessRecord) {
    return user.role?.name === RoleName.ADMIN;
  }

  private isManager(user: UserAccessRecord) {
    return user.role?.name === RoleName.MANAGER;
  }
}