"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabaseOptions = exports.databaseEntities = void 0;
const audit_log_entity_1 = require("./entities/audit-log.entity");
const permission_entity_1 = require("./entities/permission.entity");
const role_entity_1 = require("./entities/role.entity");
const user_permission_entity_1 = require("./entities/user-permission.entity");
const user_entity_1 = require("./entities/user.entity");
const DEFAULT_DATABASE_PORT = 5432;
const parsePort = (value) => {
    const port = Number(value);
    return Number.isFinite(port) ? port : DEFAULT_DATABASE_PORT;
};
const parseBoolean = (value, defaultValue) => {
    if (value === undefined) {
        return defaultValue;
    }
    return value.trim().toLowerCase() === 'true';
};
exports.databaseEntities = [
    user_entity_1.User,
    role_entity_1.Role,
    permission_entity_1.Permission,
    user_permission_entity_1.UserPermission,
    audit_log_entity_1.AuditLog,
];
const createDatabaseOptions = (env) => {
    const schema = env.DATABASE_SCHEMA?.trim();
    return {
        type: 'postgres',
        host: env.DATABASE_HOST || 'localhost',
        port: parsePort(env.DATABASE_PORT),
        username: env.DATABASE_USER || 'postgres',
        password: env.DATABASE_PASSWORD || 'postgres',
        database: env.DATABASE_NAME || 'obliq',
        entities: exports.databaseEntities,
        migrations: [`${__dirname}/migrations/*{.ts,.js}`],
        synchronize: parseBoolean(env.DATABASE_SYNCHRONIZE, false),
        migrationsRun: parseBoolean(env.DATABASE_MIGRATIONS_RUN, false),
        ...(schema ? { schema } : {}),
    };
};
exports.createDatabaseOptions = createDatabaseOptions;
//# sourceMappingURL=database-options.js.map