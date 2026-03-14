import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  atom: string; // e.g. "dashboard:read", "users:write", "reports:read"

  @Column()
  module: string; // e.g. "dashboard", "users", "reports"

  @Column()
  action: string; // e.g. "read", "write", "delete"

  @Column({ nullable: true })
  description: string;
}