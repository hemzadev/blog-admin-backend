import { registerAs } from '@nestjs/config';
import { createOAuthConfigFactory } from './utils/config-factory';
import { GoogleConfig } from './config.interface';

export default registerAs(
  'google',
  createOAuthConfigFactory<GoogleConfig>(
    'google',
    (clientId, clientSecret, callbackUrl) => ({
      clientId,
      clientSecret,
      callbackUrl,
    }),
  ),
);