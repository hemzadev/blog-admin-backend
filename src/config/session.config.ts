// src/config/session.config.ts
import { registerAs } from '@nestjs/config';
import { SessionConfig } from './config.interface';

export default registerAs('session', (): SessionConfig => {
    if (!process.env.SESSION_SECRET) {
      throw new Error('SESSION_SECRET environment variable is required');
    }
    if (!process.env.SESSION_MAX_AGE) {
      throw new Error('SESSION_MAX_AGE environment variable is required');
    }
  
    return {
      secret: process.env.SESSION_SECRET,
      maxAge: parseInt(process.env.SESSION_MAX_AGE, 10),
    };
  });