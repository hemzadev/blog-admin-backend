// src/config/index.ts
import { ConfigType } from '@nestjs/config';
import { default as appConfig } from './app.config';
import { default as jwtConfig } from './jwt.config';
import { default as redisConfig } from './redis.config';
import { default as googleConfig } from './google.config';
import { default as discordConfig } from './discord.config';
import { default as githubConfig } from './github.config';
import { default as xConfig } from './x.config';
import { default as databaseConfig } from './database.config';
import { default as sessionConfig } from './session.config';
import { configSchema } from './config.schema';

export {
  appConfig,
  jwtConfig,
  redisConfig,
  googleConfig,
  discordConfig,
  githubConfig,
  xConfig,
  databaseConfig,
  sessionConfig,
  configSchema,
};

export type AppConfigType = ConfigType<typeof appConfig>;
export type JwtConfigType = ConfigType<typeof jwtConfig>;
export type RedisConfigType = ConfigType<typeof redisConfig>;
export type GoogleConfigType = ConfigType<typeof googleConfig>;
export type DiscordConfigType = ConfigType<typeof discordConfig>;
export type GithubConfigType = ConfigType<typeof githubConfig>;
export type XConfigType = ConfigType<typeof xConfig>;
export type DatabaseConfigType = ConfigType<typeof databaseConfig>;
export type SessionConfigType = ConfigType<typeof sessionConfig>;