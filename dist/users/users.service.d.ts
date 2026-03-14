import { Repository } from 'typeorm';
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
export declare class UsersService {
    private usersRepo;
    private rolesRepo;
    private permissionsRepo;
    private auditService;
    constructor(usersRepo: Repository<User>, rolesRepo: Repository<Role>, permissionsRepo: Repository<Permission>, auditService: AuditService);
    findById(id: string): Promise<User>;
    findAccessibleById(actorId: string, targetId: string): Promise<UserAccessRecord>;
    findAll(actorId: string): Promise<User[]>;
    create(actorId: string, dto: CreateUserInput): Promise<User>;
    update(actorId: string, targetId: string, dto: UpdateUserInput): Promise<User & {
        role: Role;
    }>;
    updateStatus(actorId: string, targetId: string, status: UserStatus): Promise<{
        success: boolean;
    }>;
    setStatus(actorId: string, targetId: string, status: UserStatus): Promise<{
        success: boolean;
    }>;
    seedRoles(): Promise<void>;
    private getUserWithAccessRelations;
    private getActor;
    private getManagedOrOwnTarget;
    private getManagedTarget;
    private ensureRoleAssignmentAllowed;
    private resolveManagerId;
    private isAdmin;
    private isManager;
}
export {};
