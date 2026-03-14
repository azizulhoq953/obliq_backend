import {
  Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn,
  CreateDateColumn, Column,
} from 'typeorm';
import { User } from './user.entity';
import { Permission } from './permission.entity';

@Entity('user_permissions')
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.userPermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Permission, { eager: true })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column({ nullable: true })
  grantedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'granted_by_id' })
  grantedBy: User;

  @CreateDateColumn()
  grantedAt: Date;
}