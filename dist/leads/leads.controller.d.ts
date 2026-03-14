import { LeadsService } from './leads.service';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    findAll(): {
        id: string;
        name: string;
        email: string;
        phone?: string;
        status: "new" | "contacted" | "qualified" | "won" | "lost";
        ownerId?: string;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
    }[];
    create(req: any, body: any): {
        id: string;
        name: string;
        email: string;
        phone?: string;
        status: "new" | "contacted" | "qualified" | "won" | "lost";
        ownerId?: string;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
    };
    update(id: string, body: any): {
        id: string;
        name: string;
        email: string;
        phone?: string;
        status: "new" | "contacted" | "qualified" | "won" | "lost";
        ownerId?: string;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
    };
    assign(id: string, body: {
        assigneeId: string;
    }): {
        id: string;
        name: string;
        email: string;
        phone?: string;
        status: "new" | "contacted" | "qualified" | "won" | "lost";
        ownerId?: string;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
    };
}
