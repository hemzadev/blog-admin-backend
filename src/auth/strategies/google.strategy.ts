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

// In src/auth/strategies/google.strategy.ts
protected extractProfileData(profile: any): ISocialProfile {
  // Add detailed logging to see what's in the profile
  this.googleLogger.debug(`Google profile data: ${JSON.stringify(profile)}`);
  
  const email = profile.emails?.[0]?.value || '';
  const firstName = profile.name?.givenName || '';
  const lastName = profile.name?.familyName || '';
  const picture = profile.photos?.[0]?.value || '';
  
  // Log the extracted data
  this.googleLogger.debug(`Extracted Google profile: Email=${email}, Name=${firstName} ${lastName}`);
  
  return {
    email,
    firstName,
    lastName,
    picture,
    provider: 'google',
    providerId: profile.id,
  };
}

    // Add this to your GoogleStrategy.ts file to log the raw profile data
  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    this.googleLogger.debug('Raw Google profile data:', JSON.stringify(profile, null, 2));
    return super.validate(accessToken, refreshToken, profile, done);
  }
}