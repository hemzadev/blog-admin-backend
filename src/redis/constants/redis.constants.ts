// src/redis/constants/redis.constants.ts

/**
 * Redis key prefixes for different features
 */
export const REDIS_KEY_PREFIXES = {
    REFRESH_TOKEN: 'auth:refresh',
    USER_SESSION: 'session:user',
    RATE_LIMIT: 'ratelimit',
    CACHE: 'cache',
    HEALTH_CHECK: 'health:check',
  };
  
  /**
   * Default TTL values (in seconds)
   */
  export const DEFAULT_TTL = {
    REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
    SESSION: 24 * 60 * 60, // 24 hours
    CACHE: 60 * 60, // 1 hour
    SHORT_CACHE: 5 * 60, // 5 minutes
  };