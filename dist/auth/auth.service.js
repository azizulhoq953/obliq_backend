"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("../database/entities/user.entity");
const audit_service_1 = require("../audit/audit.service");
let AuthService = class AuthService {
    constructor(usersRepo, jwtService, config, auditService) {
        this.usersRepo = usersRepo;
        this.jwtService = jwtService;
        this.config = config;
        this.auditService = auditService;
    }
    async login(email, password, ip) {
        const user = await this.usersRepo.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'status', 'firstName', 'lastName'],
            relations: ['role', 'role.permissions', 'userPermissions', 'userPermissions.permission'],
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== 'active') {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        await this.auditService.log(user.id, 'USER_LOGIN', { email }, null, ip);
        return tokens;
    }
    async logout(userId) {
        await this.usersRepo.update(userId, { refreshToken: null });
    }
    async refreshTokens(userId, refreshToken) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user?.refreshToken)
            throw new common_1.UnauthorizedException();
        const matches = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!matches)
            throw new common_1.UnauthorizedException('Invalid refresh token');
        const tokens = await this.generateTokens(user);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async generateTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.role?.name };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });
        return { accessToken, refreshToken, user: this.sanitizeUser(user) };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.usersRepo.update(userId, { refreshToken: hashed });
    }
    sanitizeUser(user) {
        const { password, refreshToken, ...rest } = user;
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        audit_service_1.AuditService])
], AuthService);
//# sourceMappingURL=auth.service.js.map