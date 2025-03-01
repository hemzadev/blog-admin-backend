// src/redis/redis.health.ts
import { Injectable } from '@nestjs/common';
import { 
  HealthIndicator, 
  HealthIndicatorResult, 
  HealthCheckError 
} from '@nestjs/terminus';
import { RedisService } from './redis.service';

/**
 * Health indicator for Redis
 * Used with @nestjs/terminus for health checks
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  /**
   * Check Redis connection health
   * @param key Name for the health check
   * @returns Health check result
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    // Use a unique health check key
    const healthCheckKey = `health:check:${Date.now()}`;
    const testValue = 'health';
    
    try {
      // Write to Redis
      await this.redisService.set(healthCheckKey, testValue, 10);
      
      // Read from Redis
      const result = await this.redisService.get(healthCheckKey);
      
      // Clean up
      await this.redisService.delete(healthCheckKey);
      
      // Check if the value is correct
      const isHealthy = result === testValue;
      
      if (isHealthy) {
        return this.getStatus(key, true);
      }
      
      throw new Error('Redis health check failed: value mismatch');
    } catch (error) {
      throw new HealthCheckError(
        'Redis health check failed', 
        this.getStatus(key, false, { message: error.message })
      );
    }
  }
}