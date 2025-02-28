// src/config/github.config.ts
import { registerAs } from '@nestjs/config';
import { GithubConfig } from './config.interface';

export default registerAs('github', (): GithubConfig => {
    if (!process.env.GITHUB_CLIENT_ID) {
      throw new Error('GITHUB_CLIENT_ID environment variable is required');
    }
    if (!process.env.GITHUB_CLIENT_SECRET) {
      throw new Error('GITHUB_CLIENT_SECRET environment variable is required');
    }
    if (!process.env.GITHUB_CALLBACK_URL) {
      throw new Error('GITHUB_CALLBACK_URL environment variable is required');
    }
  
    return {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.GITHUB_CALLBACK_URL,
    };
});