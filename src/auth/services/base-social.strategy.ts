import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-oauth2';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

export abstract class BaseSocialStrategy extends PassportStrategy(Strategy) {
  private readonly strategyName: string;

  constructor(
    protected configService: ConfigService,
    protected authService: AuthService,
    strategyName: string,
    options: StrategyOptions,
  ) {
    super(options);
    this.strategyName = strategyName;
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return this.authService.handleSocialUser({
      email: profile.emails?.[0]?.value,
      firstName: profile.name?.givenName || '',
      lastName: profile.name?.familyName || '',
      picture: profile.photos?.[0]?.value || '',
      provider: this.strategyName,
      providerId: profile.id,
    });
  }
}