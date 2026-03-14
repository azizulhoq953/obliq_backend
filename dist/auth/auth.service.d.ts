import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { AuditService } from '../audit/audit.service';
export declare class AuthService {
    private usersRepo;
    private jwtService;
    private config;
    private auditService;
    constructor(usersRepo: Repository<User>, jwtService: JwtService, config: ConfigService, auditService: AuditService);
    login(email: string, password: string, ip?: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    logout(userId: string): Promise<void>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    private generateTokens;
    private updateRefreshToken;
    private sanitizeUser;
}
