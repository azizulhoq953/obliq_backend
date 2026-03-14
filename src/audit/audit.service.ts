import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../database/entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(@InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>) {}

  async log(
    actorId: string,
    action: string,
    metadata: Record<string, any> = {},
    targetUserId?: string,
    ipAddress?: string,
  ) {
    const log = this.auditRepo.create({
      actorId,
      action,
      metadata,
      targetUserId,
      ipAddress,
    });
    return this.auditRepo.save(log);
  }

  async findAll(page = 1, limit = 50) {
    const [logs, total] = await this.auditRepo.findAndCount({
      relations: ['actor'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { logs, total, page, limit };
  }
}