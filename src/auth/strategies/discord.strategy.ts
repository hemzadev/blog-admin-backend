// src/auth/strategies/discord.strategy.ts
import { Injectable, Logger } from '@nestjs/common';
import { BaseSocialStrategy, ISocialProfile } from './base-social.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { PROVIDER_CONFIG } from '../constants/config.constants';

@Injectable()
export class DiscordStrategy extends BaseSocialStrategy {
  private readonly discordLogger = new Logger(DiscordStrategy.name);

  constructor(
    configService: ConfigService,
    authService: AuthService,
  ) {
    const clientID = configService.get(PROVIDER_CONFIG.DISCORD.CLIENT_ID);
    const clientSecret = configService.get(PROVIDER_CONFIG.DISCORD.CLIENT_SECRET);
    const callbackURL = configService.get(PROVIDER_CONFIG.DISCORD.CALLBACK_URL);
    
    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Discord OAuth configuration is incomplete');
    }
    
    super(configService, authService, 'discord', {
      clientID,
      clientSecret,
      callbackURL,
      scope: ['identify', 'email'],
      authorizationURL: 'https://discord.com/api/oauth2/authorize',
      tokenURL: 'https://discord.com/api/oauth2/token',
    });
    
    this.discordLogger.log('Discord authentication strategy initialized');
  }

  protected extractProfileData(profile: any): ISocialProfile {
    this.discordLogger.debug(`Extracting profile data for Discord user: ${profile.id}`);
    
    return {
      email: this.getEmail(profile),
      firstName: this.getFirstName(profile),
      lastName: this.getLastName(profile),
      picture: this.getPicture(profile),
      provider: 'discord',
      providerId: profile.id,
    };
  }
}