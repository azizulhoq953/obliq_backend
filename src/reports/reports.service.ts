import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportsService {
  getOverview() {
    return {
      generatedAt: new Date().toISOString(),
      kpis: {
        conversionRate: 0,
        tasksCompleted: 0,
        activeAgents: 0,
      },
      charts: [],
    };
  }
}