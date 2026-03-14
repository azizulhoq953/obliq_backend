import { Role } from './role.entity';
import { UserPermission } from './user-permission.entity';
export declare enum UserStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    BANNED = "banned"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    status: UserStatus;
    role: Role;
    managerId: string;
    manager: User;
    subordinates: User[];
    userPermissions: UserPermission[];
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
}
