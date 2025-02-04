// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SocialLoginResponseDto } from './dto/social-login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async validateAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) return null;

    const valid = await bcrypt.compare(password, admin.password);
    return valid ? admin : null;
  }

  async generateTokens(user: any): Promise<SocialLoginResponseDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: user.id, email: user.email },
        { secret: this.config.get('JWT_ACCESS_SECRET'), expiresIn: '15m' },
      ),
      this.jwt.signAsync(
        { sub: user.id },
        { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: '7d' },
      ),
    ]);
  
    return {
      accessToken,
      refreshToken,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      avatar: user.avatar
    };
  }

  async handleSocialUser(profile: any): Promise<SocialLoginResponseDto> {
    const user = await this.prisma.user.upsert({
      where: { email: profile.email },
      update: {
        lastSeen: new Date(),
        avatar: profile.picture
      },
      create: {
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`,
        avatar: profile.picture,
        socialProvider: profile.provider,
        socialProviderId: profile.providerId
      }
    });
  
    return this.generateTokens(user);
  }
}