// src/auth/strategies/discord.strategy.ts
import { Strategy } from 'passport-discord';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('DISCORD_CLIENT_ID')!,
      clientSecret: config.get<string>('DISCORD_CLIENT_SECRET')!,
      callbackURL: config.get<string>('DISCORD_CALLBACK_URL')!,
      scope: ['identify', 'email']
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any
  ) {
    return {
      provider: 'discord',
      providerId: profile.id,
      email: profile.email,
      username: profile.username,
      avatar: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`,
    };
  }
}