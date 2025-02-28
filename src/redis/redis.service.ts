import { Injectable, Inject, OnApplicationShutdown } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createClient, RedisClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private client: RedisClient;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly config: ConfigService,
  ) {
    this.client = createClient({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: this.config.get<string>('REDIS_PASSWORD'),
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    // No need to call this.client.connect() in redis@3.x or earlier
  }

  async onApplicationShutdown(signal?: string) {
    this.client.quit(); // Use quit() instead of disconnect()
    console.log('Redis connection closed');
  }

  getClient(): RedisClient {
    return this.client;
  }

  private getRefreshTokenKey(userId: string, deviceId: string): string {
    return `auth:refresh:${userId}:${deviceId}`;
  }

  async addRefreshToken(userId: string, deviceId: string, token: string, ttl: number): Promise<void> {
    const key = this.getRefreshTokenKey(userId, deviceId);
    console.log(`Storing refresh token for user ${userId} and device ${deviceId}`);
    console.log(`Key: ${key}, Token: ${token}, TTL: ${ttl}`);

    try {
      await this.cacheManager.set(key, token, ttl);
      console.log('Refresh token stored successfully');
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  async getRefreshToken(userId: string, deviceId: string): Promise<string | null> {
    const key = this.getRefreshTokenKey(userId, deviceId);
    return this.cacheManager.get(key);
  }

  async deleteRefreshToken(userId: string, deviceId: string): Promise<void> {
    const key = this.getRefreshTokenKey(userId, deviceId);
    await this.cacheManager.del(key);
  }

  async deleteAllRefreshTokens(userId: string): Promise<void> {
    // Wrap the callback-based keys method in a Promise
    const keys = await new Promise<string[]>((resolve, reject) => {
      this.client.keys(`auth:refresh:${userId}:*`, (err, keys) => {
        if (err) {
          reject(err);
        } else {
          resolve(keys);
        }
      });
    });

    // Delete all keys
    if (keys && keys.length > 0) {
      for (const key of keys) {
        await this.cacheManager.del(key);
      }
    }
  }
}