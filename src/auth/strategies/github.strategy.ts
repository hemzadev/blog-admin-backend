import { Injectable } from '@nestjs/common';
import { BaseSocialStrategy } from '../services/base-social.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends BaseSocialStrategy {
  constructor(config: ConfigService, authService: AuthService) {
    super(config, authService, 'github', {
      clientID: config.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
      authorizationURL: 'https://github.com/login/oauth/authorize',
      tokenURL: 'https://github.com/login/oauth/access_token',
    });
  }
}