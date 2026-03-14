export declare class ReportsService {
    getOverview(): {
        generatedAt: string;
        kpis: {
            conversionRate: number;
            tasksCompleted: number;
            activeAgents: number;
        };
        charts: any[];
    };
}
