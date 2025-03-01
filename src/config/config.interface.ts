// src/config/config.interface.ts
/**
 * JWT authentication configuration interface
 */
export interface JwtConfig {
    accessSecret: string;
    refreshSecret: string;
    accessExpiration: string;
    refreshExpiration: string;
  }
  
  /**
   * Redis cache configuration interface
   */
  export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    ttl: number;
    url?: string; // Added for flexibility
  }
  
  /**
   * Base OAuth provider configuration interface
   */
  export interface OAuthProviderConfig {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  }
  
  /**
   * Google OAuth configuration interface
   */
  export interface GoogleConfig extends OAuthProviderConfig {}
  
  /**
   * Discord OAuth configuration interface
   */
  export interface DiscordConfig extends OAuthProviderConfig {}
  
  /**
   * GitHub OAuth configuration interface
   */
  export interface GithubConfig extends OAuthProviderConfig {}
  
  /**
   * X (Twitter) OAuth configuration interface
   */
  export interface XConfig extends OAuthProviderConfig {}
  
  /**
   * Database configuration interface
   */
  export interface DatabaseConfig {
    url: string;
  }
  
  /**
   * Session configuration interface
   */
  export interface SessionConfig {
    secret: string;
    maxAge: number;
  }
  
  /**
   * Application configuration interface
   */
  export interface AppConfig {
    port: number;
    environment: string;
    debug: boolean;
  }