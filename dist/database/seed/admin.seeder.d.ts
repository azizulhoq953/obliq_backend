import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
export default class AdminSeeder implements Seeder {
    run(dataSource: DataSource): Promise<void>;
}
