import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';
import { SocialLoginResponseDto } from './dto/social-login-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redisService: RedisService,
  ) {}

  async validateAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) return null;

    const valid = await bcrypt.compare(password, admin.password);
    return valid ? admin : null;
  }

  async generateTokens(user: User, deviceId: string): Promise<SocialLoginResponseDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user, deviceId),
    ]);

    // Store the refresh token in Redis
    await this.redisService.addRefreshToken(user.id.toString(), deviceId, refreshToken, 86400);

    return {
      accessToken,
      refreshToken,
      email: user.email,
    };
  }

  async handleSocialUser(profile: any): Promise<SocialLoginResponseDto> {
    const user = await this.prisma.user.upsert({
      where: { email: profile.email },
      update: { lastSeen: new Date(), avatar: profile.picture },
      create: {
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`,
        avatar: profile.picture,
        socialProvider: profile.provider,
        socialProviderId: profile.id,
      },
    });

    return this.generateTokens(user, 'default-device-id');
  }

  async register(createUserDto: CreateUserDto, deviceId: string): Promise<SocialLoginResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
      },
    });
    return this.generateTokens(user, deviceId);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.password && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result as User;
    }
    return null;
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    await this.redisService.deleteRefreshToken(userId, deviceId);
  }

  async refreshTokens(userId: string, deviceId: string, refreshToken: string): Promise<SocialLoginResponseDto> {
    const isValid = await this.redisService.getRefreshToken(userId, deviceId) === refreshToken;
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateTokens(user, deviceId);
  }

  private async createAccessToken(user: User): Promise<string> {
    return this.jwt.signAsync(
      { sub: user.id.toString(), email: user.email },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRATION'),
      },
    );
  }

  private async createRefreshToken(user: User, deviceId: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: user.id.toString(), email: user.email, deviceId },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRATION'),
      },
    );
  }
}