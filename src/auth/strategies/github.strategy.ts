// src/auth/strategies/github.strategy.ts
import { Injectable, Logger } from '@nestjs/common';
import { BaseSocialStrategy, ISocialProfile } from './base-social.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { PROVIDER_CONFIG } from '../constants/config.constants';

@Injectable()
export class GithubStrategy extends BaseSocialStrategy {
  private readonly githubLogger = new Logger(GithubStrategy.name);

  constructor(
    configService: ConfigService,
    authService: AuthService,
  ) {
    const clientID = configService.get(PROVIDER_CONFIG.GITHUB.CLIENT_ID);
    const clientSecret = configService.get(PROVIDER_CONFIG.GITHUB.CLIENT_SECRET);
    const callbackURL = configService.get(PROVIDER_CONFIG.GITHUB.CALLBACK_URL);
    
    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('GitHub OAuth configuration is incomplete');
    }
    
    super(configService, authService, 'github', {
      clientID,
      clientSecret,
      callbackURL,
      scope: ['user:email'],
      authorizationURL: 'https://github.com/login/oauth/authorize',
      tokenURL: 'https://github.com/login/oauth/access_token',
    });
    
    this.githubLogger.log('GitHub authentication strategy initialized');
  }

  protected extractProfileData(profile: any): ISocialProfile {
    this.githubLogger.debug(`Extracting profile data for GitHub user: ${profile.id}`);
    
    return {
      email: this.getEmail(profile),
      firstName: this.getFirstName(profile),
      lastName: this.getLastName(profile),
      picture: this.getPicture(profile),
      provider: 'github',
      providerId: profile.id,
    };
  }
}