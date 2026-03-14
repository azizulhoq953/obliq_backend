type TaskPriority = 'low' | 'medium' | 'high';
type TaskRecord = {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    assigneeId?: string;
    done: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};
type CreateTaskDto = {
    title: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string;
};
type UpdateTaskDto = {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    assigneeId?: string;
    done?: boolean;
};
export declare class TasksService {
    private readonly tasks;
    findAll(): TaskRecord[];
    create(actorId: string, dto: CreateTaskDto): TaskRecord;
    update(id: string, dto: UpdateTaskDto): TaskRecord;
    complete(id: string): TaskRecord;
}
export {};
