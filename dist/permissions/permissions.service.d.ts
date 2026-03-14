import { Repository } from 'typeorm';
import { Permission } from '../database/entities/permission.entity';
import { User } from '../database/entities/user.entity';
import { UserPermission } from '../database/entities/user-permission.entity';
import { AuditService } from '../audit/audit.service';
export declare class PermissionsService {
    private permRepo;
    private usersRepo;
    private upRepo;
    private auditService;
    constructor(permRepo: Repository<Permission>, usersRepo: Repository<User>, upRepo: Repository<UserPermission>, auditService: AuditService);
    getAllPermissions(): Promise<Permission[]>;
    getResolvedPermissions(userId: string): Promise<string[]>;
    getUserPermissions(actorId: string, userId: string): Promise<{
        role: Permission[];
        extra: Permission[];
    }>;
    grantPermission(actorId: string, targetUserId: string, permissionAtom: string): Promise<UserPermission>;
    revokePermission(actorId: string, targetUserId: string, permissionAtom: string): Promise<void>;
    seedPermissions(): Promise<void>;
    private ensureManageableTarget;
    private getScopedUser;
}
