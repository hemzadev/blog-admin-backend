import { Injectable } from '@nestjs/common';
import { BaseSocialStrategy } from '../services/base-social.strategy';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class DiscordStrategy extends BaseSocialStrategy {
  constructor(config: ConfigService, authService: AuthService) {
    super(config, authService, 'discord', {
      clientID: config.getOrThrow<string>('DISCORD_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('DISCORD_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('DISCORD_CALLBACK_URL'),
      scope: ['identify', 'email'],
      authorizationURL: 'https://discord.com/api/oauth2/authorize',
      tokenURL: 'https://discord.com/api/oauth2/token',
    });
  }
}