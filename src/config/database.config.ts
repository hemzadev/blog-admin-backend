// src/config/database.config.ts
import { registerAs } from '@nestjs/config';
import { createConfigFactory } from './utils/config-factory';
import { DatabaseConfig } from './config.interface';

export default registerAs(
  'database',
  createConfigFactory<DatabaseConfig>(
    'database',
    ['DATABASE_URL'],
    [],
    (env) => ({
      url: env.DATABASE_URL!,
    }),
  ),
);