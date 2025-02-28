import { Injectable } from '@nestjs/common';
import { BaseSocialStrategy } from '../services/base-social.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class XStrategy extends BaseSocialStrategy {
  constructor(config: ConfigService, authService: AuthService) {
    super(config, authService, 'x', {
      clientID: config.getOrThrow<string>('X_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('X_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('X_CALLBACK_URL'),
      authorizationURL: 'https://api.twitter.com/oauth/authenticate',
      tokenURL: 'https://api.twitter.com/oauth/access_token',
    });
  }
}