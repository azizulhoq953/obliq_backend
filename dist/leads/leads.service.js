"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
let LeadsService = class LeadsService {
    constructor() {
        this.leads = [];
    }
    findAll() {
        return this.leads;
    }
    create(actorId, dto) {
        const now = new Date().toISOString();
        const lead = {
            id: crypto.randomUUID(),
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            status: dto.status || 'new',
            ownerId: actorId,
            createdBy: actorId,
            createdAt: now,
            updatedAt: now,
        };
        this.leads.push(lead);
        return lead;
    }
    update(id, dto) {
        const lead = this.leads.find((item) => item.id === id);
        if (!lead) {
            throw new common_1.NotFoundException('Lead not found');
        }
        Object.assign(lead, dto, { updatedAt: new Date().toISOString() });
        return lead;
    }
    assign(id, assigneeId) {
        const lead = this.leads.find((item) => item.id === id);
        if (!lead) {
            throw new common_1.NotFoundException('Lead not found');
        }
        lead.ownerId = assigneeId;
        lead.updatedAt = new Date().toISOString();
        return lead;
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)()
], LeadsService);
//# sourceMappingURL=leads.service.js.map