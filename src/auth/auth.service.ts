import {
  Injectable, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../database/entities/user.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private config: ConfigService,
    private auditService: AuditService,
  ) {}
async login(email: string, password: string, ip?: string) {
    const user = await this.usersRepo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'status', 'firstName', 'lastName'],
      relations: ['role', 'role.permissions', 'userPermissions', 'userPermissions.permission'],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    await this.auditService.log(user.id, 'USER_LOGIN', { email }, null, ip);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersRepo.update(userId, { refreshToken: null });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user?.refreshToken) throw new UnauthorizedException();

    const matches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!matches) throw new UnauthorizedException('Invalid refresh token');

    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  private async generateTokens(user: User) {
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

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersRepo.update(userId, { refreshToken: hashed });
  }

  private sanitizeUser(user: User) {
    const { password, refreshToken, ...rest } = user as any;
    return rest;
  }
}