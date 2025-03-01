// src/config/redis.config.ts
import { registerAs } from '@nestjs/config';
import { createConfigFactory } from './utils/config-factory';
import { RedisConfig } from './config.interface';

export default registerAs(
  'redis',
  createConfigFactory<RedisConfig>(
    'redis',
    ['REDIS_HOST', 'REDIS_PORT', 'REDIS_TTL'],
    ['REDIS_PASSWORD', 'REDIS_URL'],
    (env) => ({
      host: env.REDIS_HOST!,
      port: parseInt(env.REDIS_PORT!, 10),
      password: env.REDIS_PASSWORD,
      ttl: parseInt(env.REDIS_TTL!, 10),
      url: env.REDIS_URL,
    }),
  ),
);