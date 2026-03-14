export declare class CustomerPortalService {
    getOverview(userId: string): {
        userId: string;
        generatedAt: string;
        tickets: number;
        orders: number;
        updates: any[];
    };
    getTickets(userId: string): {
        userId: string;
        items: any[];
    };
}
