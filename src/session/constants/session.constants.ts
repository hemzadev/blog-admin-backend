/**
 * Constants related to session management
 * These are used throughout the session module for consistent configuration
 */
export const SESSION_CONFIG = 'SESSION_CONFIG';
export const SESSION_PROVIDER = 'SESSION_PROVIDER';

// Redis-specific session constants
export const SESSION_PREFIX = 'sess:';

// Monitoring and logging constants
export const SESSION_METRICS = {
  ACTIVE_SESSIONS: 'active_sessions',
  SESSION_DURATION: 'session_duration',
  SESSION_CREATION: 'session_creation',
  SESSION_EXPIRATION: 'session_expiration',
};