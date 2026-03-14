import { CustomerPortalService } from './customer-portal.service';
export declare class CustomerPortalController {
    private readonly customerPortalService;
    constructor(customerPortalService: CustomerPortalService);
    getOverview(req: any): {
        userId: string;
        generatedAt: string;
        tickets: number;
        orders: number;
        updates: any[];
    };
    getTickets(req: any): {
        userId: string;
        items: any[];
    };
}
