import { SessionOptions } from 'express-session';

/**
 * Interface extending SessionOptions with custom monitoring properties
 * Allows for configuring session behavior while adding monitoring capabilities
 */
export interface EnhancedSessionOptions extends SessionOptions {
  /**
   * Enable detailed logging of session operations
   */
  enableLogging?: boolean;
  
  /**
   * Enable metrics collection for sessions
   */
  enableMetrics?: boolean;
  
  /**
   * Custom prefix for session keys in the store
   */
  keyPrefix?: string;
  
  /**
   * Additional monitoring settings
   */
  monitoring?: {
    /**
     * How often to report session metrics (in milliseconds)
     */
    reportInterval?: number;
    
    /**
     * Whether to track session durations
     */
    trackDuration?: boolean;
    
    /**
     * Whether to track session geography (requires additional middleware)
     */
    trackGeography?: boolean;
  };
}