// src/auth/strategies/google.strategy.ts
import { Injectable, Logger } from '@nestjs/common';
import { BaseSocialStrategy, ISocialProfile } from './base-social.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { PROVIDER_CONFIG } from '../constants/config.constants';
import passport from 'passport';

@Injectable()
export class GoogleStrategy extends BaseSocialStrategy {
  private readonly googleLogger  = new Logger(GoogleStrategy.name);

  constructor(
    configService: ConfigService,
    authService: AuthService,
  ) {
    const clientID = configService.get<string>(PROVIDER_CONFIG.GOOGLE.CLIENT_ID);
    const clientSecret = configService.get<string>(PROVIDER_CONFIG.GOOGLE.CLIENT_SECRET);
    const callbackURL = configService.get<string>(PROVIDER_CONFIG.GOOGLE.CALLBACK_URL);
    
    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Google OAuth configuration is incomplete');
    }
    
    super(configService, authService, 'google', {
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: false,
      authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenURL: 'https://oauth2.googleapis.com/token',
    });
    
    this.googleLogger .log('Google authentication strategy initialized');
    this.name = 'google';
    passport.use(this.name, this);
  }

  protected extractProfileData(profile: any): ISocialProfile {
    this.googleLogger.debug(`Extracting profile data for Google user: ${profile.id}`);
    
    return {
      email: this.getEmail(profile),
      firstName: this.getFirstName(profile),
      lastName: this.getLastName(profile),
      picture: this.getPicture(profile),
      provider: 'google',
      providerId: profile.id,
    };
  }
}