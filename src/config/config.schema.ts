// src/config/config.schema.ts
import * as Joi from 'joi';

export const configSchema = Joi.object({
  // General
  PORT: Joi.number().default(3000),
  SESSION_SECRET: Joi.string().required(),
  SESSION_MAX_AGE: Joi.number().required(), // 24 hours

  // JWT
  JWT_ACCESS_SECRET: Joi.string().required().min(32),
  JWT_REFRESH_SECRET: Joi.string().required().min(64),

  // Redis
  REDIS_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().required(),

  // Database
  DATABASE_URL: Joi.string().required(),

  // Google
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().required().uri(),

  // Discord
  DISCORD_CLIENT_ID: Joi.string().required(),
  DISCORD_CLIENT_SECRET: Joi.string().required(),
  DISCORD_CALLBACK_URL: Joi.string().required().uri(),

  // GitHub
  GITHUB_CLIENT_ID: Joi.string().required(),
  GITHUB_CLIENT_SECRET: Joi.string().required(),
  GITHUB_CALLBACK_URL: Joi.string().required().uri(),

  // X (Twitter)
  X_CLIENT_ID: Joi.string().required(),
  X_CLIENT_SECRET: Joi.string().required(),
  X_CALLBACK_URL: Joi.string().required().uri(),
});