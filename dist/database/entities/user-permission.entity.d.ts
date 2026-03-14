import { User } from './user.entity';
import { Permission } from './permission.entity';
export declare class UserPermission {
    id: string;
    user: User;
    permission: Permission;
    grantedById: string;
    grantedBy: User;
    grantedAt: Date;
}
