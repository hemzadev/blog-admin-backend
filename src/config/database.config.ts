// src/config/database.config.ts
import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from './config.interface';
export default registerAs('database', (): DatabaseConfig => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
  }
  return {
    url: process.env.DATABASE_URL,
  };
});