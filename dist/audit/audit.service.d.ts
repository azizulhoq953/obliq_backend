import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';
export declare class AuditService {
    private auditRepo;
    constructor(auditRepo: Repository<AuditLog>);
    log(actorId: string, action: string, metadata?: Record<string, any>, targetUserId?: string, ipAddress?: string): Promise<AuditLog>;
    findAll(page?: number, limit?: number): Promise<{
        logs: AuditLog[];
        total: number;
        page: number;
        limit: number;
    }>;
}
