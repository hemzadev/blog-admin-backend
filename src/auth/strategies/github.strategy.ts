// src/auth/strategies/github.strategy.ts
import { Strategy } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GITHUB_CLIENT_ID')!,
      clientSecret: config.get<string>('GITHUB_CLIENT_SECRET')!,
      callbackURL: config.get<string>('GITHUB_CALLBACK_URL')!,
      scope: ['user:email']
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any
  ) {
    return {
      provider: 'github',
      providerId: profile.id,
      email: profile.emails?.[0]?.value,
      username: profile.username,
      avatar: profile.photos?.[0]?.value,
    };
  }
}