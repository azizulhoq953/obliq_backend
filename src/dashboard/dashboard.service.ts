import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  getSummary(userId: string) {
    return {
      userId,
      generatedAt: new Date().toISOString(),
      cards: {
        totalLeads: 0,
        openTasks: 0,
        completedToday: 0,
      },
      note: 'Replace placeholder metrics with database aggregates as modules mature.',
    };
  }
}