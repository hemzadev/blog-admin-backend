// src/config/github.config.ts
import { registerAs } from '@nestjs/config';
import { createOAuthConfigFactory } from './utils/config-factory';
import { GithubConfig } from './config.interface';

export default registerAs(
  'github',
  createOAuthConfigFactory<GithubConfig>(
    'github',
    (clientId, clientSecret, callbackUrl) => ({
      clientId,
      clientSecret,
      callbackUrl,
    }),
  ),
);