// src/redis/redis.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { RedisService } from './redis.service';
import { RedisConfigType } from '../config';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = configService.get<RedisConfigType>('redis');
        
        if (!redisConfig) {
          throw new Error('Redis configuration is missing');
        }
        
        return {
          store: redisStore,
          host: redisConfig.host,
          port: redisConfig.port,
          password: redisConfig.password || undefined,
          ttl: redisConfig.ttl, // Use the TTL from config
          // If Redis URL is provided, use it instead of host/port/password
          ...(redisConfig.url ? { url: redisConfig.url } : {}),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisService],
  exports: [RedisService, CacheModule],
})
export class RedisModule {}