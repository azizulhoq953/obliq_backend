import { DataSourceOptions } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { UserPermission } from './entities/user-permission.entity';
import { User } from './entities/user.entity';
export declare const databaseEntities: (typeof Permission | typeof Role | typeof User | typeof UserPermission | typeof AuditLog)[];
export declare const createDatabaseOptions: (env: NodeJS.ProcessEnv) => DataSourceOptions;
