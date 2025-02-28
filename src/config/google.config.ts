// src/config/google.config.ts
import { registerAs } from '@nestjs/config';
import { GoogleConfig } from './config.interface';

export default registerAs('google', (): GoogleConfig => {
  if (!process.env.GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID is not defined');
  if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error('GOOGLE_CLIENT_SECRET is not defined');
  if (!process.env.GOOGLE_CALLBACK_URL) throw new Error('GOOGLE_CALLBACK_URL is not defined');

  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  };
});