import { User } from './user.entity';
import { Permission } from './permission.entity';
export declare enum RoleName {
    ADMIN = "admin",
    MANAGER = "manager",
    AGENT = "agent",
    CUSTOMER = "customer"
}
export declare class Role {
    id: string;
    name: RoleName;
    description: string;
    permissions: Permission[];
    users: User[];
}
