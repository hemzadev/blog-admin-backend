// src/config/discord.config.ts
import { registerAs } from '@nestjs/config';
import { createOAuthConfigFactory } from './utils/config-factory';
import { DiscordConfig } from './config.interface';

export default registerAs(
  'discord',
  createOAuthConfigFactory<DiscordConfig>(
    'discord',
    (clientId, clientSecret, callbackUrl) => ({
      clientId,
      clientSecret,
      callbackUrl,
    }),
  ),
);