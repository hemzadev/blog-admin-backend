// src/config/redis.config.ts
import { registerAs } from '@nestjs/config';
import { RedisConfig } from './config.interface';

export default registerAs('redis', (): RedisConfig => {
    if (!process.env.REDIS_HOST) {
      throw new Error('REDIS_HOST environment variable is required');
    }
    if (!process.env.REDIS_PORT) {
      throw new Error('REDIS_PORT environment variable is required');
    }
    if (!process.env.REDIS_TTL) {
      throw new Error('REDIS_TTL environment variable is required');
    }
  
    return {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10),
      password: process.env.REDIS_PASSWORD, // Optional, no error thrown
      ttl: parseInt(process.env.REDIS_TTL, 10),
    };
  });