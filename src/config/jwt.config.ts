import { registerAs } from '@nestjs/config';
import { JwtConfig } from './config.interface';

export default registerAs('jwt', (): JwtConfig => {
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets must be defined in environment variables');
  }

  if (!process.env.JWT_ACCESS_EXPIRATION || !process.env.JWT_REFRESH_EXPIRATION) {
    throw new Error('JWT expiration times must be defined in environment variables');
  }

  return {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION,
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
  };
});