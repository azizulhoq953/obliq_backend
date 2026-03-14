import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(): {
        id: string;
        title: string;
        description?: string;
        priority: "low" | "medium" | "high";
        assigneeId?: string;
        done: boolean;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
    }[];
    create(req: any, body: any): {
        id: string;
        title: string;
        description?: string;
        priority: "low" | "medium" | "high";
        assigneeId?: string;
        done: boolean;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
    };
    update(id: string, body: any): {
        id: string;
        title: string;
        description?: string;
        priority: "low" | "medium" | "high";
        assigneeId?: string;
        done: boolean;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
    };
    complete(id: string): {
        id: string;
        title: string;
        description?: string;
        priority: "low" | "medium" | "high";
        assigneeId?: string;
        done: boolean;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
    };
}
