// src/redis/redis.service.ts
import { 
  Injectable, 
  Inject, 
  OnApplicationShutdown, 
  Logger,
  OnModuleInit
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createClient, RedisClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { promisify } from 'util';
import { RedisConfigType } from '../config';

/**
 * Service for interacting with Redis
 * Handles refresh tokens and general Redis operations
 */
@Injectable()
export class RedisService implements OnModuleInit, OnApplicationShutdown {
  private client: RedisClient;
  private readonly logger = new Logger(RedisService.name);
  
  // Promisified Redis functions
  private keysAsync: (pattern: string) => Promise<string[]>;
  private getAsync: (key: string) => Promise<string | null>;
  private setExAsync: (key: string, seconds: number, value: string) => Promise<'OK'>;
  private delAsync: (key: string) => Promise<number>;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    const redisConfig = this.configService.get<RedisConfigType>('redis');
    
    if (!redisConfig) {
      throw new Error('Redis configuration is missing');
    }

    // Create Redis client with config
    this.client = createClient({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password || undefined,
    });

    // Promisify Redis methods
    this.keysAsync = promisify(this.client.keys).bind(this.client);
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setExAsync = promisify(this.client.setex).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  /**
   * Initialize Redis connection when module starts
   */
  onModuleInit() {
    const redisConfig = this.configService.get<RedisConfigType>('redis');
    this.logger.debug(`Redis configuration: ${JSON.stringify(redisConfig)}`);
  
    // Set up event handlers
    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
      this.testConnection(); // Test the Redis connection
    });
  
    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`, err.stack);
    });
  
    this.client.on('reconnecting', () => {
      this.logger.warn('Reconnecting to Redis...');
    });
  }

    // Add this to redis.service.ts
  async debugKeys(pattern: string): Promise<string[]> {
    try {
      const keys = await this.keysAsync(pattern);
      this.logger.debug(`Found ${keys.length} keys matching pattern: ${pattern}`);
      keys.forEach(key => this.logger.debug(`Key: ${key}`));
      return keys;
    } catch (error) {
      this.logger.error(`Error getting keys with pattern ${pattern}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async testConnection(): Promise<void> {
    try {
      await this.set('test-key', 'test-value', 60); // Set a test key with a 60-second TTL
      const value = await this.get('test-key'); // Retrieve the test key
      this.logger.debug(`Test key value: ${value}`);
    } catch (error) {
      this.logger.error(`Redis connection test failed: ${error.message}`, error.stack);
      throw new Error(`Redis connection test failed: ${error.message}`);
    }
  }

  /**
   * Clean up Redis connection when application shuts down
   */
  async onApplicationShutdown(signal?: string) {
    this.logger.log(`Closing Redis connection (signal: ${signal || 'unknown'})`);
    await new Promise<void>((resolve) => {
      this.client.quit(() => {
        this.logger.log('Redis connection closed');
        resolve();
      });
    });
  }

  /**
   * Get the Redis client instance
   */
  getClient(): RedisClient {
    return this.client;
  }

  /**
   * Generate key for refresh token
   */
  private getRefreshTokenKey(userId: string, deviceId: string): string {
    return `auth:refresh:${userId}:${deviceId}`;
  }

  /**
   * Store a refresh token in Redis
   * @param userId User ID
   * @param deviceId Device ID
   * @param token Refresh token
   * @param ttl Time to live in seconds
   */
  // In src/redis/redis.service.ts
  async addRefreshToken(userId: string, deviceId: string, token: string, ttl: number): Promise<void> {
    const key = this.getRefreshTokenKey(userId, deviceId);
    this.logger.debug(
      `Storing refresh token for user ${userId} and device ${deviceId}, TTL: ${ttl} seconds`
    );

    try {
      // Use direct Redis method instead of cache manager
      await this.setExAsync(key, ttl, token);
      this.logger.debug(`Refresh token stored successfully at key: ${key}`);
    } catch (error) {
      this.logger.error(
        `Failed to store refresh token: ${error.message}`, 
        error.stack
      );
      throw new Error(`Failed to store refresh token: ${error.message}`);
    }
  }

  /**
   * Retrieve a refresh token from Redis
   * @param userId User ID
   * @param deviceId Device ID
   * @returns Refresh token or null if not found
   */
  async getRefreshToken(userId: string, deviceId: string): Promise<string | null> {
    const key = this.getRefreshTokenKey(userId, deviceId);
    this.logger.debug(`Retrieving refresh token for user ${userId} and device ${deviceId}`);
    
    try {
      return await this.getAsync(key);
    } catch (error) {
      this.logger.error(
        `Error retrieving refresh token: ${error.message}`, 
        error.stack
      );
      throw new Error(`Failed to retrieve refresh token: ${error.message}`);
    }
  }

  /**
   * Delete a specific refresh token
   * @param userId User ID
   * @param deviceId Device ID
   */
  async deleteRefreshToken(userId: string, deviceId: string): Promise<void> {
    const key = this.getRefreshTokenKey(userId, deviceId);
    this.logger.debug(`Deleting refresh token for user ${userId} and device ${deviceId}`);
    
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Refresh token deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(
        `Error deleting refresh token: ${error.message}`, 
        error.stack
      );
      throw new Error(`Failed to delete refresh token: ${error.message}`);
    }
  }

  /**
   * Delete all refresh tokens for a user
   * @param userId User ID
   */
  async deleteAllRefreshTokens(userId: string): Promise<void> {
    const pattern = `auth:refresh:${userId}:*`;
    this.logger.debug(`Deleting all refresh tokens for user ${userId}`);
    
    try {
      const keys = await this.keysAsync(pattern);
      this.logger.debug(`Found ${keys.length} refresh tokens to delete`);
      
      for (const key of keys) {
        await this.cacheManager.del(key);
      }
      
      this.logger.debug(`Successfully deleted all refresh tokens for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error deleting all refresh tokens: ${error.message}`, 
        error.stack
      );
      throw new Error(`Failed to delete all refresh tokens: ${error.message}`);
    }
  }

  /**
   * Set a value in Redis with expiration
   * @param key Key
   * @param value Value
   * @param ttl Time to live in seconds
   */
  async set(key: string, value: string, ttl: number): Promise<void> {
    try {
      await this.setExAsync(key, ttl, value);
    } catch (error) {
      this.logger.error(`Error setting key ${key}: ${error.message}`, error.stack);
      throw new Error(`Failed to set value in Redis: ${error.message}`);
    }
  }

  /**
   * Get a value from Redis
   * @param key Key
   * @returns Value or null if not found
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.getAsync(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}: ${error.message}`, error.stack);
      throw new Error(`Failed to get value from Redis: ${error.message}`);
    }
  }

  /**
   * Delete a value from Redis
   * @param key Key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.delAsync(key);
    } catch (error) {
      this.logger.error(`Error deleting key ${key}: ${error.message}`, error.stack);
      throw new Error(`Failed to delete value from Redis: ${error.message}`);
    }
  }
}