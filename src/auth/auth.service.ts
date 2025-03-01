// src/auth/auth.service.ts
import { Injectable, Logger, UnauthorizedException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SocialLoginResponseDto } from './dto/social-login-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '@prisma/client';
import { ITokenService } from './interfaces/token.interface';
import { IRefreshTokenService } from './interfaces/refresh-token.interface';
import { ISessionService } from './interfaces/session.interface';
import { TOKEN_SERVICE, REFRESH_TOKEN_SERVICE, SESSION_SERVICE } from './constants/provider.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    @Inject(TOKEN_SERVICE) private tokenService: ITokenService,
    @Inject(REFRESH_TOKEN_SERVICE) private refreshTokenService: IRefreshTokenService,
    @Inject(SESSION_SERVICE) private sessionService: ISessionService,
  ) {}

  async validateAdmin(email: string, password: string) {
    try {
      this.logger.debug(`Validating admin with email: ${email}`);
      const admin = await this.prisma.admin.findUnique({ where: { email } });
      
      if (!admin) {
        this.logger.debug(`Admin not found: ${email}`);
        return null;
      }

      const valid = await bcrypt.compare(password, admin.password);
      
      if (valid) {
        this.logger.debug(`Admin validated successfully: ${email}`);
        return admin;
      } else {
        this.logger.debug(`Invalid password for admin: ${email}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error validating admin: ${error.message}`, error.stack);
      throw error;
    }
  }

  async generateTokens(user: User, deviceId: string): Promise<SocialLoginResponseDto> {
    try {
      this.logger.debug(`Generating tokens for user ${user.id} on device ${deviceId}`);
      
      const [accessToken, refreshToken] = await Promise.all([
        this.tokenService.createAccessToken(user),
        this.tokenService.createRefreshToken(user, deviceId),
      ]);

      // Store the refresh token
      await this.refreshTokenService.storeRefreshToken(
        user.id.toString(), 
        deviceId, 
        refreshToken
      );

      // Update session metrics if metrics are enabled
      if (this.configService.get<boolean>('SESSION_METRICS')) {
        await this.sessionService.getActiveSessionCount()
          .then(count => {
            this.logger.debug(`Active session count: ${count}`);
          })
          .catch(error => {
            this.logger.warn(`Failed to get active session count: ${error.message}`);
          });
      }

      return {
        accessToken,
        refreshToken,
        email: user.email,
      };
    } catch (error) {
      this.logger.error(`Error generating tokens: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createAdminAccessToken(admin: any): Promise<string> {
    return this.tokenService.createAccessToken(admin);
  }
  
  // In auth.service.ts
async handleSocialUser(profile: any): Promise<SocialLoginResponseDto> {
  try {
    // Enhanced logging
    this.logger.debug(`Handling social user login: ${profile.email} (${profile.provider})`);
    this.logger.debug(`Full profile data: ${JSON.stringify(profile)}`);
    
    if (!profile.email) {
      this.logger.error(`Missing email in ${profile.provider} profile`);
      throw new Error(`Missing email in ${profile.provider} profile`);
    }
    
    const user = await this.prisma.user.upsert({
      where: { email: profile.email },
      update: { 
        lastSeen: new Date(), 
        avatar: profile.picture,
        socialProvider: profile.provider,
        socialProviderId: profile.providerId,
      },
      create: {
        email: profile.email,
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        avatar: profile.picture,
        socialProvider: profile.provider,
        socialProviderId: profile.providerId,
      },
    });

    // Generate a default device ID if none provided
    const deviceId = profile.deviceId || `${profile.provider}-${Date.now()}`;
    
    return this.generateTokens(user, deviceId);
  } catch (error) {
    this.logger.error(`Error handling social user: ${error.message}`, error.stack);
    throw error;
  }
}

  async register(createUserDto: CreateUserDto, deviceId: string): Promise<SocialLoginResponseDto> {
    try {
      this.logger.debug(`Registering new user: ${createUserDto.email}`);
      
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        this.logger.debug(`Registration failed: email already exists ${createUserDto.email}`);
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
      
      this.logger.debug(`User registered successfully: ${user.id}`);
      return this.generateTokens(user, deviceId);
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      this.logger.debug(`Validating user with email: ${email}`);
      
      const user = await this.prisma.user.findUnique({ where: { email } });
      
      if (!user || !user.password) {
        this.logger.debug(`User not found or no password set: ${email}`);
        return null;
      }
      
      const isValid = await bcrypt.compare(password, user.password);
      
      if (isValid) {
        this.logger.debug(`User validated successfully: ${email}`);
        const { password: _, ...result } = user;
        return result as User;
      } else {
        this.logger.debug(`Invalid password for user: ${email}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Error validating user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    try {
      this.logger.debug(`Logging out user ${userId} from device ${deviceId}`);
      await this.refreshTokenService.deleteRefreshToken(userId, deviceId);
    } catch (error) {
      this.logger.error(`Error during logout: ${error.message}`, error.stack);
      throw error;
    }
  }

  async logoutAll(userId: string): Promise<void> {
    try {
      this.logger.debug(`Logging out user ${userId} from all devices`);
      await this.refreshTokenService.deleteAllRefreshTokens(userId);
    } catch (error) {
      this.logger.error(`Error during logout from all devices: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshTokens(userId: string, deviceId: string, refreshToken: string): Promise<SocialLoginResponseDto> {
    try {
      this.logger.debug(`Refreshing tokens for user ${userId} on device ${deviceId}`);
      
      const isValid = await this.refreshTokenService.validateRefreshToken(
        userId, 
        deviceId, 
        refreshToken
      );
      
      if (!isValid) {
        this.logger.warn(`Invalid refresh token for user ${userId} on device ${deviceId}`);
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prisma.user.findUnique({ where: { id: parseInt(userId) } });
      
      if (!user) {
        this.logger.warn(`User not found during token refresh: ${userId}`);
        throw new UnauthorizedException('User not found');
      }
      
      return this.generateTokens(user, deviceId);
    } catch (error) {
      this.logger.error(`Error refreshing tokens: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Health check method
  async checkHealth(): Promise<{ status: string; details: any }> {
    try {
      const storeAvailable = await this.sessionService.checkStoreAvailability();
      const storeType = this.sessionService.getStoreType();
      
      return {
        status: storeAvailable ? 'healthy' : 'unhealthy',
        details: {
          sessionStore: {
            type: storeType,
            available: storeAvailable,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`, error.stack);
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
        },
      };
    }
  }
}