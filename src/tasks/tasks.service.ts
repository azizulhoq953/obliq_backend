import { Injectable, NotFoundException } from '@nestjs/common';

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

@Injectable()
export class TasksService {
  private readonly tasks: TaskRecord[] = [];

  findAll() {
    return this.tasks;
  }

  create(actorId: string, dto: CreateTaskDto) {
    const now = new Date().toISOString();
    const task: TaskRecord = {
      id: crypto.randomUUID(),
      title: dto.title,
      description: dto.description,
      priority: dto.priority || 'medium',
      assigneeId: dto.assigneeId,
      done: false,
      createdBy: actorId,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.push(task);
    return task;
  }

  update(id: string, dto: UpdateTaskDto) {
    const task = this.tasks.find((item) => item.id === id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    Object.assign(task, dto, { updatedAt: new Date().toISOString() });
    return task;
  }

  complete(id: string) {
    return this.update(id, { done: true });
  }
}