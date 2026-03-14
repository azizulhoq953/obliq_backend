"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerPortalService = void 0;
const common_1 = require("@nestjs/common");
let CustomerPortalService = class CustomerPortalService {
    getOverview(userId) {
        return {
            userId,
            generatedAt: new Date().toISOString(),
            tickets: 0,
            orders: 0,
            updates: [],
        };
    }
    getTickets(userId) {
        return {
            userId,
            items: [],
        };
    }
};
exports.CustomerPortalService = CustomerPortalService;
exports.CustomerPortalService = CustomerPortalService = __decorate([
    (0, common_1.Injectable)()
], CustomerPortalService);
//# sourceMappingURL=customer-portal.service.js.map