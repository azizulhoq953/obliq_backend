import { User } from './user.entity';
export declare class AuditLog {
    id: string;
    actor: User;
    actorId: string;
    action: string;
    metadata: Record<string, any>;
    targetUserId: string;
    ipAddress: string;
    createdAt: Date;
}
