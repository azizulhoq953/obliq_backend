import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../database/entities/permission.entity';
import { RoleName } from '../database/entities/role.entity';
import { User } from '../database/entities/user.entity';
import { UserPermission } from '../database/entities/user-permission.entity';
import { AuditService } from '../audit/audit.service';

type ScopedUser = User & {
  role?: {
    name: RoleName;
    permissions?: Permission[];
  };
};

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission) private permRepo: Repository<Permission>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(UserPermission) private upRepo: Repository<UserPermission>,
    private auditService: AuditService,
  ) {}

  async getAllPermissions(): Promise<Permission[]> {
    return this.permRepo.find({ order: { module: 'ASC', action: 'ASC' } });
  }

  // Resolve permissions: role defaults + user overrides
  async getResolvedPermissions(userId: string): Promise<string[]> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions', 'userPermissions', 'userPermissions.permission'],
    });
    if (!user) return [];

    const roleAtoms = user.role?.permissions?.map((p) => p.atom) || [];
    const userAtoms = user.userPermissions?.map((up) => up.permission.atom) || [];

    return [...new Set([...roleAtoms, ...userAtoms])];
  }

  async getUserPermissions(actorId: string, userId: string) {
    if (actorId !== userId) {
      await this.ensureManageableTarget(actorId, userId);
    }

    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions', 'userPermissions', 'userPermissions.permission'],
    });
    if (!user) return { role: [], extra: [] };

    const rolePerms = user.role?.permissions || [];
    const extraPerms = user.userPermissions?.map((up) => up.permission) || [];

    return { role: rolePerms, extra: extraPerms };
  }

  async grantPermission(actorId: string, targetUserId: string, permissionAtom: string) {
    // Grant ceiling check: actor must have the permission themselves
    const actorPerms = await this.getResolvedPermissions(actorId);
    if (!actorPerms.includes(permissionAtom)) {
      throw new ForbiddenException('You cannot grant a permission you do not hold');
    }

    await this.ensureManageableTarget(actorId, targetUserId);

    const permission = await this.permRepo.findOne({ where: { atom: permissionAtom } });
    if (!permission) throw new ForbiddenException('Permission not found');

    // Check not already granted
    const existing = await this.upRepo.findOne({
      where: {
        user: { id: targetUserId },
        permission: { id: permission.id },
      },
      relations: ['user', 'permission'],
    });
    if (existing) return existing;

    const up = this.upRepo.create({
      user: { id: targetUserId } as User,
      permission,
      grantedBy: { id: actorId } as User,
    });
    await this.upRepo.save(up);

    await this.auditService.log(actorId, 'PERMISSION_GRANTED', {
      permissionAtom,
      targetUserId,
    });

    return up;
  }

  async revokePermission(actorId: string, targetUserId: string, permissionAtom: string) {
    const actorPerms = await this.getResolvedPermissions(actorId);
    if (!actorPerms.includes(permissionAtom)) {
      throw new ForbiddenException('You cannot revoke a permission you do not hold');
    }

    await this.ensureManageableTarget(actorId, targetUserId);

    const permission = await this.permRepo.findOne({ where: { atom: permissionAtom } });
    if (!permission) return;

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
      if (!exists) await this.permRepo.save(this.permRepo.create(atom));
    }
  }

  private async ensureManageableTarget(actorId: string, targetUserId: string) {
    const [actor, target] = await Promise.all([
      this.getScopedUser(actorId),
      this.getScopedUser(targetUserId),
    ]);

    if (!target) {
      throw new NotFoundException('Target user not found');
    }

    if (actor.role?.name === RoleName.ADMIN) {
      return;
    }

    if (
      actor.role?.name === RoleName.MANAGER
      && target.managerId === actor.id
      && [RoleName.AGENT, RoleName.CUSTOMER].includes(target.role?.name)
    ) {
      return;
    }

    throw new ForbiddenException('You cannot manage permissions for this user');
  }

  private async getScopedUser(userId: string): Promise<ScopedUser> {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: ['role', 'role.permissions', 'userPermissions', 'userPermissions.permission'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user as ScopedUser;
  }
}