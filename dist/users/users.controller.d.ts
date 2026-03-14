import { UsersService } from './users.service';
import { UserStatus } from '../database/entities/user.entity';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(req: any): Promise<import("../database/entities/user.entity").User[]>;
    findOne(req: any, id: string): Promise<import("../database/entities/user.entity").User & {
        role: import("../database/entities/role.entity").Role;
    }>;
    create(req: any, body: any): Promise<import("../database/entities/user.entity").User>;
    update(req: any, id: string, body: any): Promise<import("../database/entities/user.entity").User & {
        role: import("../database/entities/role.entity").Role;
    }>;
    updateStatus(req: any, id: string, body: {
        status: UserStatus;
    }): Promise<{
        success: boolean;
    }>;
    ban(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
