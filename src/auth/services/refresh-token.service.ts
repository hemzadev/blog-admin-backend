import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenService {
  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async storeRefreshToken(userId: string, deviceId: string, token: string): Promise<void> {
    const refreshExpiration = this.configService.get<number>('JWT_REFRESH_EXPIRATION');
    if (!refreshExpiration) {
      throw new Error('JWT_REFRESH_EXPIRATION is not defined in the configuration');
    }

    await this.redisService.addRefreshToken(userId, deviceId, token, refreshExpiration);
  }

  async validateRefreshToken(userId: string, deviceId: string, token: string): Promise<boolean> {
    const storedToken = await this.redisService.getRefreshToken(userId, deviceId);
    return storedToken === token;
  }

  async deleteRefreshToken(userId: string, deviceId: string): Promise<void> {
    await this.redisService.deleteRefreshToken(userId, deviceId);
  }
}