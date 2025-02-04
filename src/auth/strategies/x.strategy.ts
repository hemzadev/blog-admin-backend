// src/auth/strategies/x.strategy.ts
import { Strategy } from 'passport-twitter';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class XStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(config: ConfigService) {
    super({
      consumerKey: config.get<string>('X_CONSUMER_KEY')!,
      consumerSecret: config.get<string>('X_CONSUMER_SECRET')!,
      callbackURL: config.get<string>('X_CALLBACK_URL')!,
      includeEmail: true,
    });
  }

  async validate(
    token: string,
    tokenSecret: string,
    profile: any,
    done: (error: any, user?: any) => void
  ) {
    const user = {
      provider: 'x',
      providerId: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value,
      avatar: profile.photos?.[0]?.value.replace('_normal', ''),
    };
    done(null, user);
  }
}