// src/config/session.config.ts
import { registerAs } from '@nestjs/config';
import { createConfigFactory } from './utils/config-factory';
import { SessionConfig } from './config.interface';

export default registerAs(
  'session',
  createConfigFactory<SessionConfig>(
    'session',
    ['SESSION_SECRET', 'SESSION_MAX_AGE'],
    [],
    (env) => ({
      secret: env.SESSION_SECRET!,
      maxAge: parseInt(env.SESSION_MAX_AGE!, 10),
    }),
  ),
);