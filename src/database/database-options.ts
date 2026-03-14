import { DataSourceOptions } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { UserPermission } from './entities/user-permission.entity';
import { User } from './entities/user.entity';

const DEFAULT_DATABASE_PORT = 5432;

const parsePort = (value: string | undefined): number => {
  const port = Number(value);

  return Number.isFinite(port) ? port : DEFAULT_DATABASE_PORT;
};

const parseBoolean = (
  value: string | undefined,
  defaultValue: boolean,
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  return value.trim().toLowerCase() === 'true';
};

export const databaseEntities = [
  User,
  Role,
  Permission,
  UserPermission,
  AuditLog,
];

export const createDatabaseOptions = (
  env: NodeJS.ProcessEnv,
): DataSourceOptions => {
  const schema = env.DATABASE_SCHEMA?.trim();

  return {
    type: 'postgres',
    host: env.DATABASE_HOST || 'localhost',
    port: parsePort(env.DATABASE_PORT),
    username: env.DATABASE_USER || 'postgres',
    password: env.DATABASE_PASSWORD || 'postgres',
    database: env.DATABASE_NAME || 'obliq',
    entities: databaseEntities,
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
    synchronize: parseBoolean(env.DATABASE_SYNCHRONIZE, false),
    migrationsRun: parseBoolean(env.DATABASE_MIGRATIONS_RUN, false),
    ...(schema ? { schema } : {}),
  };
};