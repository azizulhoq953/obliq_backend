export declare class DashboardService {
    getSummary(userId: string): {
        userId: string;
        generatedAt: string;
        cards: {
            totalLeads: number;
            openTasks: number;
            completedToday: number;
        };
        note: string;
    };
}
