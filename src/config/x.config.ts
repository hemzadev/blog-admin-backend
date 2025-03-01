// src/config/x.config.ts
import { registerAs } from '@nestjs/config';
import { createOAuthConfigFactory } from './utils/config-factory';
import { XConfig } from './config.interface';

export default registerAs(
  'x',
  createOAuthConfigFactory<XConfig>(
    'x',
    (clientId, clientSecret, callbackUrl) => ({
      clientId,
      clientSecret,
      callbackUrl,
    }),
  ),
);