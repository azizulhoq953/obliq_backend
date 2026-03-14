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
export declare class LeadsService {
    private readonly leads;
    findAll(): LeadRecord[];
    create(actorId: string, dto: CreateLeadDto): LeadRecord;
    update(id: string, dto: UpdateLeadDto): LeadRecord;
    assign(id: string, assigneeId: string): LeadRecord;
}
export {};
