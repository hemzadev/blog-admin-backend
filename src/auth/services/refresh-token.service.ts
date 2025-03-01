// src/auth/services/refresh-token.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import { IRefreshTokenService } from '../interfaces/refresh-token.interface';
import { AUTH_CONFIG } from '../constants/config.constants';

@Injectable()
export class RefreshTokenService implements IRefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);// We'll use dependency injection
  
  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async storeRefreshToken(userId: string, deviceId: string, token: string): Promise<void> {
    try {
      const refreshExpiration = this.configService.get<number>(AUTH_CONFIG.JWT_REFRESH_EXPIRATION);
      
      if (!refreshExpiration) {
        this.logger.error('JWT_REFRESH_EXPIRATION is not defined in the configuration');
        throw new Error('JWT configuration is incomplete');
      }
      
      await this.redisService.addRefreshToken(userId, deviceId, token, refreshExpiration);
      this.logger.debug(`Refresh token stored for user ${userId} on device ${deviceId}`);
    } catch (error) {
      this.logger.error(`Error storing refresh token: ${error.message}`, error.stack);
      throw error;
    }
  }

  async validateRefreshToken(userId: string, deviceId: string, token: string): Promise<boolean> {
    try {
      const storedToken = await this.redisService.getRefreshToken(userId, deviceId);
      const isValid = storedToken === token;
      
      this.logger.debug(`Refresh token validation for user ${userId}: ${isValid}`);
      return isValid;
    } catch (error) {
      this.logger.error(`Error validating refresh token: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteRefreshToken(userId: string, deviceId: string): Promise<void> {
    try {
      await this.redisService.deleteRefreshToken(userId, deviceId);
      this.logger.debug(`Refresh token deleted for user ${userId} on device ${deviceId}`);
    } catch (error) {
      this.logger.error(`Error deleting refresh token: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    try {
      await this.redisService.deleteAllRefreshTokens(userId);
      this.logger.debug(`All refresh tokens deleted for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error deleting all refresh tokens: ${error.message}`, error.stack);
      throw error;
    }
  }
}