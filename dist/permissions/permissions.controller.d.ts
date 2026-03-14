import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private permissionsService;
    constructor(permissionsService: PermissionsService);
    getAll(): Promise<import("../database/entities/permission.entity").Permission[]>;
    getMyPermissions(req: any): Promise<string[]>;
    getUserPermissions(req: any, userId: string): Promise<{
        role: import("../database/entities/permission.entity").Permission[];
        extra: import("../database/entities/permission.entity").Permission[];
    }>;
    grant(req: any, body: {
        targetUserId: string;
        permissionAtom: string;
    }): Promise<import("../database/entities/user-permission.entity").UserPermission>;
    revoke(req: any, body: {
        targetUserId: string;
        permissionAtom: string;
    }): Promise<void>;
}
