import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class XStrategy extends PassportStrategy(OAuth2Strategy, 'x') {
  constructor(
    config: ConfigService,
    private readonly httpService: HttpService
  ) {
    super({
      authorizationURL: 'https://twitter.com/i/oauth2/authorize',
      tokenURL: 'https://api.twitter.com/2/oauth2/token',
      clientID: config.get<string>('X_CLIENT_ID', { infer: true })!, // Ensure non-undefined
      clientSecret: config.get<string>('X_CLIENT_SECRET', { infer: true })!, // Ensure non-undefined
      callbackURL: config.get<string>('X_CALLBACK_URL', { infer: true })!, // Ensure non-undefined
      scope: ['users.read', 'tweet.read', 'offline.access'],
      state: true,
      pkce: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    done: (error: any, user?: any) => void
  ) {
    try {
      const response = await this.httpService.get(
        'https://api.twitter.com/2/users/me',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { 'user.fields': 'profile_image_url' }
        }
      ).toPromise();

      if (!response || !response.data) {
        throw new Error('Failed to fetch X profile');
      }

      const userProfile = {
        provider: 'x',
        providerId: response.data.data.id,
        username: response.data.data.username,
        displayName: response.data.data.name,
        avatar: response.data.data.profile_image_url?.replace('_normal', ''),
        accessToken,
        refreshToken,
      };
      
      done(null, userProfile);
    } catch (error) {
      done(new Error('Failed to fetch X profile'), false);
    }
  }
}