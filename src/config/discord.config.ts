// src/config/discord.config.ts
import { registerAs } from '@nestjs/config';
import { DiscordConfig } from './config.interface';

export default registerAs('discord', (): DiscordConfig => {
    if (!process.env.DISCORD_CLIENT_ID) {
      throw new Error('DISCORD_CLIENT_ID environment variable is required');
    }
    if (!process.env.DISCORD_CLIENT_SECRET) {
      throw new Error('DISCORD_CLIENT_SECRET environment variable is required');
    }
    if (!process.env.DISCORD_CALLBACK_URL) {
      throw new Error('DISCORD_CALLBACK_URL environment variable is required');
    }
  
    return {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackUrl: process.env.DISCORD_CALLBACK_URL,
    };
});