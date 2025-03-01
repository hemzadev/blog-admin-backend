// src/config/jwt.config.ts
import { registerAs } from '@nestjs/config';
import { createConfigFactory } from './utils/config-factory';
import { JwtConfig } from './config.interface';

export default registerAs(
  'jwt',
  createConfigFactory<JwtConfig>(
    'jwt',
    [
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'JWT_ACCESS_EXPIRATION',
      'JWT_REFRESH_EXPIRATION',
    ],
    [],
    (env) => ({
      accessSecret: env.JWT_ACCESS_SECRET!,
      refreshSecret: env.JWT_REFRESH_SECRET!,
      accessExpiration: env.JWT_ACCESS_EXPIRATION!,
      refreshExpiration: env.JWT_REFRESH_EXPIRATION!,
    }),
  ),
);