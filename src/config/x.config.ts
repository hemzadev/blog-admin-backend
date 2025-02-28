// src/config/x.config.ts
import { registerAs } from '@nestjs/config';
import { XConfig } from './config.interface';

export default registerAs('x', (): XConfig => {
    if (!process.env.X_CLIENT_ID) {
      throw new Error('X_CLIENT_ID environment variable is required');
    }
    if (!process.env.X_CLIENT_SECRET) {
      throw new Error('X_CLIENT_SECRET environment variable is required');
    }
    if (!process.env.X_CALLBACK_URL) {
      throw new Error('X_CALLBACK_URL environment variable is required');
    }
  
    return {
      clientId: process.env.X_CLIENT_ID,
      clientSecret: process.env.X_CLIENT_SECRET,
      callbackUrl: process.env.X_CALLBACK_URL,
    };
});