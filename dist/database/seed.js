"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
const core_1 = require("@nestjs/core");
const typeorm_1 = require("typeorm");
const bcrypt = require("bcryptjs");
const app_module_1 = require("../app.module");
const users_service_1 = require("../users/users.service");
const permissions_service_1 = require("../permissions/permissions.service");
const role_entity_1 = require("./entities/role.entity");
const user_entity_1 = require("./entities/user.entity");
const parseBoolean = (value) => {
    if (!value) {
        return false;
    }
    return value.trim().toLowerCase() === 'true';
};
const getSchemaPrivileges = async (dataSource, schemaName) => {
    const [{ current_user: currentUser, can_create: canCreate }] = await dataSource.query(`SELECT
        current_user,
        has_schema_privilege(current_user, $1, 'CREATE') AS can_create`, [schemaName]);
    return {
        currentUser,
        canCreate: canCreate === true,
    };
};
const ensureSeedSchema = async (dataSource) => {
    const schemaName = (process.env.DATABASE_SCHEMA || 'public').trim();
    const tableName = `${schemaName}.roles`;
    const { currentUser, canCreate } = await getSchemaPrivileges(dataSource, schemaName);
    const [{ exists }] = await dataSource.query('SELECT to_regclass($1) AS exists', [tableName]);
    if (exists) {
        return;
    }
    if (!parseBoolean(process.env.SEED_AUTO_SYNC)) {
        if (!canCreate) {
            throw new Error(`Missing table "${tableName}" and DB user "${currentUser}" lacks CREATE on schema "${schemaName}". ` +
                `Ask DBA to run: GRANT USAGE, CREATE ON SCHEMA ${schemaName} TO ${currentUser}; ` +
                'Then run: SEED_AUTO_SYNC=true npm run seed');
        }
        throw new Error(`Missing table "${tableName}". Create schema first using migrations, ` +
            'or run seeding with SEED_AUTO_SYNC=true to auto-create tables for local development.');
    }
    if (!canCreate) {
        throw new Error(`SEED_AUTO_SYNC=true but DB user "${currentUser}" lacks CREATE on schema "${schemaName}". ` +
            `Ask DBA to run: GRANT USAGE, CREATE ON SCHEMA ${schemaName} TO ${currentUser};`);
    }
    console.log('Tables not found. Running synchronize() because SEED_AUTO_SYNC=true...');
    try {
        await dataSource.synchronize();
    }
    catch (error) {
        if (error?.code === '42501') {
            throw new Error(`Database user does not have CREATE privileges on schema "${schemaName}". ` +
                'Grant schema permissions to the DB user or run migrations with a privileged user first.');
        }
        throw error;
    }
};
const getSeedAdminConfig = () => ({
    email: process.env.SEED_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@obliq.com',
    password: process.env.SEED_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || 'Admin@1234',
    firstName: process.env.SEED_ADMIN_FIRST_NAME || process.env.ADMIN_FIRST_NAME || 'System',
    lastName: process.env.SEED_ADMIN_LAST_NAME || process.env.ADMIN_LAST_NAME || 'Admin',
    updateExistingPassword: parseBoolean(process.env.SEED_UPDATE_ADMIN_PASSWORD),
});
const upsertAdminUser = async (dataSource, usersService) => {
    const { email, password, firstName, lastName, updateExistingPassword, } = getSeedAdminConfig();
    const usersRepo = dataSource.getRepository(user_entity_1.User);
    const existingAdmin = await usersRepo.findOne({ where: { email } });
    if (!existingAdmin) {
        await usersService.create('system', {
            email,
            password,
            firstName,
            lastName,
            roleName: role_entity_1.RoleName.ADMIN,
        });
        console.log(`Admin user created with email: ${email}`);
        return;
    }
    if (!updateExistingPassword) {
        console.log(`Admin user already exists (${email}). Password unchanged. ` +
            'Use SEED_UPDATE_ADMIN_PASSWORD=true to reset it during seed.');
        return;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await usersRepo.update(existingAdmin.id, {
        password: hashedPassword,
        firstName,
        lastName,
        status: user_entity_1.UserStatus.ACTIVE,
    });
    console.log(`Admin password reset for ${email}`);
};
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        const dataSource = app.get(typeorm_1.DataSource);
        await ensureSeedSchema(dataSource);
        const usersService = app.get(users_service_1.UsersService);
        const permissionsService = app.get(permissions_service_1.PermissionsService);
        console.log('Seeding permissions...');
        await permissionsService.seedPermissions();
        console.log('Seeding roles...');
        await usersService.seedRoles();
        console.log('Creating admin user...');
        await upsertAdminUser(dataSource, usersService);
        console.log('Seed complete!');
    }
    finally {
        await app.close();
    }
}
if (require.main === module) {
    seed().catch((error) => {
        console.error('Error during seeding:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed.js.map