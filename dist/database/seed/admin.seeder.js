"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require("bcryptjs");
const role_entity_1 = require("../entities/role.entity");
const user_entity_1 = require("../entities/user.entity");
class AdminSeeder {
    async run(dataSource) {
        const roleRepository = dataSource.getRepository(role_entity_1.Role);
        const userRepository = dataSource.getRepository(user_entity_1.User);
        await roleRepository.upsert({ name: role_entity_1.RoleName.ADMIN, description: 'Super Administrator' }, ['name']);
        const adminRole = await roleRepository.findOneBy({ name: role_entity_1.RoleName.ADMIN });
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@obliq.com';
        const rawPassword = process.env.ADMIN_PASSWORD || 'SuperSecretPassword123!';
        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        const newAdmin = userRepository.create({
            email: adminEmail,
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Admin',
            status: user_entity_1.UserStatus.ACTIVE,
            role: adminRole,
        });
        await userRepository.save(newAdmin);
        console.log('--- SEED SUCCESS ---');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${rawPassword}`);
        console.log('--------------------');
    }
}
exports.default = AdminSeeder;
//# sourceMappingURL=admin.seeder.js.map