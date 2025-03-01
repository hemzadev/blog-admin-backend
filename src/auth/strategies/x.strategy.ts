// src/auth/strategies/x.strategy.ts
import { Injectable, Logger } from '@nestjs/common';
import { BaseSocialStrategy, ISocialProfile } from './base-social.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { PROVIDER_CONFIG } from '../constants/config.constants';

@Injectable()
export class XStrategy extends BaseSocialStrategy {
  private readonly xLogger = new Logger(XStrategy.name);

  constructor(
    configService: ConfigService,
    authService: AuthService,
  ) {
    const clientID = configService.get(PROVIDER_CONFIG.X.CLIENT_ID);
    const clientSecret = configService.get(PROVIDER_CONFIG.X.CLIENT_SECRET);
    const callbackURL = configService.get(PROVIDER_CONFIG.X.CALLBACK_URL);
    
    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('X OAuth configuration is incomplete');
    }
    
    super(configService, authService, 'x', {
      clientID,
      clientSecret,
      callbackURL,
      authorizationURL: 'https://api.twitter.com/oauth/authenticate',
      tokenURL: 'https://api.twitter.com/oauth/access_token',
    });
    
    this.xLogger.log('X authentication strategy initialized');
  }

  protected extractProfileData(profile: any): ISocialProfile {
    this.xLogger.debug(`Extracting profile data for X user: ${profile.id}`);
    
    return {
      email: this.getEmail(profile),
      firstName: this.getFirstName(profile),
      lastName: this.getLastName(profile),
      picture: this.getPicture(profile),
      provider: 'x',
      providerId: profile.id,
    };
  }
}