// src/config/app.config.ts
import { registerAs } from '@nestjs/config';
import { configSchema } from './config.schema';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  },
  redis: {
    url: process.env.REDIS_URL as string,
  },
  database: {
    url: process.env.DATABASE_URL as string,
  },
}));