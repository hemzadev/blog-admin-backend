// src/config/app.config.ts
import { registerAs } from '@nestjs/config';
import { createConfigFactory } from './utils/config-factory';
import { AppConfig } from './config.interface';

export default registerAs(
  'app',
  createConfigFactory<AppConfig>(
    'app',
    [],
    ['NODE_ENV', 'PORT', 'DEBUG'],
    (env) => ({
      environment: env.NODE_ENV || 'development',
      port: env.PORT ? parseInt(env.PORT, 10) : 3000,
      debug: env.DEBUG === 'true',
    }),
  ),
);