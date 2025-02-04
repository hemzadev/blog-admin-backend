// src/auth/strategies/x.strategy.ts
import { Strategy } from 'passport-twitter';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class XStrategy extends PassportStrategy(Strategy, 'x') {
  constructor(config: ConfigService) {
    super({
      consumerKey: config.get<string>('X_CLIENT_ID')!,
      consumerSecret: config.get<string>('X_CLIENT_SECRET')!,
      callbackURL: config.get<string>('X_CALLBACK_URL')!,
      includeEmail: true,
    });
  }

  async validate(
    token: string,
    tokenSecret: string,
    profile: any
  ) {
    return {
      provider: 'x',
      providerId: profile.id,
      email: profile.emails?.[0]?.value || null,
      username: profile.username || profile.displayName,
      avatar: profile.photos?.[0]?.value || null,
    };
  }
}
