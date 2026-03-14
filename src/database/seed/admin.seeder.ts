import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs'; 
import { Role, RoleName } from '../entities/role.entity';
import { User, UserStatus } from '../entities/user.entity';

export default class AdminSeeder implements Seeder {
  public async run(dataSource: DataSource): Promise<void> {
    const roleRepository = dataSource.getRepository(Role);
    const userRepository = dataSource.getRepository(User);

    await roleRepository.upsert(
      { name: RoleName.ADMIN, description: 'Super Administrator' },
      ['name']
    );
    const adminRole = await roleRepository.findOneBy({ name: RoleName.ADMIN });

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@obliq.com';
    const rawPassword = process.env.ADMIN_PASSWORD || 'SuperSecretPassword123!';


    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newAdmin = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      status: UserStatus.ACTIVE,
      role: adminRole,
    });

    await userRepository.save(newAdmin);
    
    console.log('--- SEED SUCCESS ---');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${rawPassword}`);
    console.log('--------------------');
  }
}

// npm run seed