// src/auth/strategies/base-social.strategy.ts
import { Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';

// Interface for user profile data
export interface ISocialProfile {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  provider: string;
  providerId: string;
  deviceId?: string;
}

export abstract class BaseSocialStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(BaseSocialStrategy.name);
  private readonly strategyName: string;
  protected readonly authService: any; // Will be passed via constructor

  constructor(
    protected configService: ConfigService,
    authService: any,
    strategyName: string,
    options: StrategyOptions,
  ) {
    super(options);
    this.strategyName = strategyName;
    this.authService = authService;
    this.logger.log(`Initialized ${strategyName} strategy`);
  }

// In validate method of base-social.strategy.ts
async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    try {
      this.logger.debug(`${this.strategyName} profile data: ${JSON.stringify(profile)}`);
      
      // Extract profile data using the strategy-specific method
      const userData = this.extractProfileData(profile);
      
      // Log the extracted data
      this.logger.debug(`Extracted ${this.strategyName} profile: ${JSON.stringify(userData)}`);
      
      // Call the auth service to handle the social user
      const user = await this.authService.handleSocialUser({
        ...userData,
        provider: this.strategyName,
      });
      
      this.logger.debug(`${this.strategyName} authentication successful for user: ${userData.email}`);
      return done(null, user);
    } catch (error) {
      this.logger.error(`${this.strategyName} authentication failed: ${error.message}`, error.stack);
      return done(error, false);
    }
  }

  // Abstract method to be implemented by specific strategies
  protected abstract extractProfileData(profile: any): ISocialProfile;

  // Common utility methods for all strategies
  protected getEmail(profile: any): string {
    return profile.emails?.[0]?.value || '';
  }

  protected getFirstName(profile: any): string {
    return profile.name?.givenName || profile.given_name || '';
  }

  protected getLastName(profile: any): string {
    return profile.name?.familyName || profile.family_name || '';
  }

  protected getPicture(profile: any): string {
    return profile.photos?.[0]?.value || profile.picture || '';
  }
}