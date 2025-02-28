// src/config/config.interface.ts
export interface JwtConfig {
    accessSecret: string;
    refreshSecret: string;
    accessExpiration: string;
    refreshExpiration: string;
}
  
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    ttl: number;
}
  
export interface GoogleConfig {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
}
  
export interface DiscordConfig {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
}
  
export interface GithubConfig {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
}
  
export interface XConfig {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
}
  
export interface DatabaseConfig {
    url: string;
}
  
export interface SessionConfig {
    secret: string;
    maxAge: number;
}