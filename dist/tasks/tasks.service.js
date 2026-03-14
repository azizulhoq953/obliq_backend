"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
let TasksService = class TasksService {
    constructor() {
        this.tasks = [];
    }
    findAll() {
        return this.tasks;
    }
    create(actorId, dto) {
        const now = new Date().toISOString();
        const task = {
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
    update(id, dto) {
        const task = this.tasks.find((item) => item.id === id);
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        Object.assign(task, dto, { updatedAt: new Date().toISOString() });
        return task;
    }
    complete(id) {
        return this.update(id, { done: true });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)()
], TasksService);
//# sourceMappingURL=tasks.service.js.map