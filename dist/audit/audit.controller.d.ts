import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getLogs(page?: string, limit?: string): Promise<{
        logs: import("../database/entities/audit-log.entity").AuditLog[];
        total: number;
        page: number;
        limit: number;
    }>;
}
