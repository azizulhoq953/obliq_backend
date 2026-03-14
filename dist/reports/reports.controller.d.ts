import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
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
