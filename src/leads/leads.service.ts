import { Injectable, NotFoundException } from '@nestjs/common';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

type LeadRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  ownerId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type CreateLeadDto = {
  name: string;
  email: string;
  phone?: string;
  status?: LeadStatus;
};

type UpdateLeadDto = {
  name?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
};

@Injectable()
export class LeadsService {
  private readonly leads: LeadRecord[] = [];

  findAll() {
    return this.leads;
  }

  create(actorId: string, dto: CreateLeadDto) {
    const now = new Date().toISOString();
    const lead: LeadRecord = {
      id: crypto.randomUUID(),
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      status: dto.status || 'new',
      ownerId: actorId,
      createdBy: actorId,
      createdAt: now,
      updatedAt: now,
    };
    this.leads.push(lead);
    return lead;
  }

  update(id: string, dto: UpdateLeadDto) {
    const lead = this.leads.find((item) => item.id === id);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    Object.assign(lead, dto, { updatedAt: new Date().toISOString() });
    return lead;
  }

  assign(id: string, assigneeId: string) {
    const lead = this.leads.find((item) => item.id === id);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    lead.ownerId = assigneeId;
    lead.updatedAt = new Date().toISOString();
    return lead;
  }
}