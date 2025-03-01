// src/config/config.schema.ts
import * as Joi from 'joi';

/**
 * Full configuration validation schema
 */
export const configSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DEBUG: Joi.boolean().default(false),
  
  // Session
  SESSION_SECRET: Joi.string().required(),
  SESSION_MAX_AGE: Joi.number().required(),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().required().min(32),
  JWT_REFRESH_SECRET: Joi.string().required().min(64),
  JWT_ACCESS_EXPIRATION: Joi.string().required(),
  JWT_REFRESH_EXPIRATION: Joi.string().required(),

  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_TTL: Joi.number().required(),
  REDIS_URL: Joi.string().optional(),

  // Database
  DATABASE_URL: Joi.string().required(),

  // Google OAuth
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_CALLBACK_URL: Joi.string().required().uri(),

  // Discord OAuth
  DISCORD_CLIENT_ID: Joi.string().required(),
  DISCORD_CLIENT_SECRET: Joi.string().required(),
  DISCORD_CALLBACK_URL: Joi.string().required().uri(),

  // GitHub OAuth
  GITHUB_CLIENT_ID: Joi.string().required(),
  GITHUB_CLIENT_SECRET: Joi.string().required(),
  GITHUB_CALLBACK_URL: Joi.string().required().uri(),

  // X (Twitter) OAuth
  X_CLIENT_ID: Joi.string().required(),
  X_CLIENT_SECRET: Joi.string().required(),
  X_CALLBACK_URL: Joi.string().required().uri(),
});