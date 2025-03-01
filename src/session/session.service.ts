import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Store, SessionData } from 'express-session';
import { EnhancedSessionOptions } from './interfaces/session-options.interface';
import { SESSION_METRICS } from './constants/session.constants';

/**
 * Service responsible for session management, monitoring, and logging
 * Provides APIs for interacting with the session store and collecting metrics
 */
@Injectable()
export class SessionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SessionService.name);
  private monitoringInterval: NodeJS.Timeout | null = null;
  private sessionStore: Store;
  private sessionOptions: EnhancedSessionOptions;
  private sessionMetrics = {
    activeCount: 0,
    creations: 0,
    expirations: 0,
    averageDuration: 0,
  };

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.logger.log('Session service initialized');
  }

  /**
   * Lifecycle hook that runs when the module is initialized
   * Sets up monitoring intervals if enabled
   */
  onModuleInit() {
    const monitoringEnabled = this.sessionOptions?.enableMetrics;
    const interval = this.sessionOptions?.monitoring?.reportInterval || 60000;
    
    if (monitoringEnabled) {
      this.logger.log(`Session monitoring enabled with interval ${interval}ms`);
      this.monitoringInterval = setInterval(() => this.reportMetrics(), interval);
      this.updateSessionMetrics();
    }
  }

  /**
   * Lifecycle hook that runs when the module is destroyed
   * Cleans up monitoring intervals
   */
  onModuleDestroy() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  /**
   * Sets the session store and options
   * Called by the module provider during initialization
   */
  setStore(store: Store, options: EnhancedSessionOptions) {
    this.sessionStore = store;
    this.sessionOptions = options;
    
    // Add custom event handlers to the store for monitoring
    if (store && options.enableMetrics) {
      this.attachStoreListeners(store);
    }
    
    this.logger.log(`Session store configured with key prefix: ${options.keyPrefix || 'default'}`);
  }

  /**
   * Gets the session store type (Redis, Memory, etc.)
   */
  getStoreType(): string {
    if (!this.sessionStore) return 'None';
    return this.sessionStore.constructor.name;
  }

  /**
   * Checks if the session store is available and working
   * Used by the health check indicator
   */
  async checkStoreAvailability(): Promise<boolean> {
    if (!this.sessionStore) return false;
    
    try {
      // Create a test session to check store availability
      const testSessionId = `test-${Date.now()}`;
      const testSessionData: SessionData = {
        cookie: {
          originalMaxAge: null,
          httpOnly: true,
          path: '/',
          secure: false,
          sameSite: 'lax',
        }
      };
      
      await new Promise<void>((resolve, reject) => {
        this.sessionStore.set(testSessionId, testSessionData, (err) => {
          if (err) reject(err);
          this.sessionStore.destroy(testSessionId, (destroyErr) => {
            if (destroyErr) this.logger.warn(`Failed to clean up test session: ${destroyErr.message}`);
            resolve();
          });
        });
      });
      return true;
    } catch (error) {
      this.logger.error(`Session store availability check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Gets the number of active sessions
   * Used for monitoring
   */
  async getActiveSessionCount(): Promise<number> {
    if (!this.sessionStore || typeof this.sessionStore.all !== 'function') {
      this.logger.warn('Session store or all method not available, returning cached count');
      return this.sessionMetrics.activeCount;
    }
    
    try {
      return await new Promise<number>((resolve, reject) => {
        // Ensure all is defined before calling it
        if (typeof this.sessionStore.all === 'function') {
          this.sessionStore.all((err, sessions) => {
            if (err) {
              this.logger.error(`Error getting active sessions: ${err.message}`);
              return reject(err);
            }
            const count = sessions ? Object.keys(sessions).length : 0;
            this.sessionMetrics.activeCount = count;
            resolve(count);
          });
        } else {
          this.logger.warn('Session store all method is not available');
          resolve(this.sessionMetrics.activeCount);
        }
      });
    } catch (error) {
      this.logger.warn(`Failed to get active session count: ${error.message}`);
      return this.sessionMetrics.activeCount;
    }
  }

  /**
   * Reports current session metrics to the logging system
   * Called periodically if monitoring is enabled
   */
  private async reportMetrics() {
    try {
      await this.updateSessionMetrics();
      
      this.logger.log(
        'Session metrics report',
        {
          activeCount: this.sessionMetrics.activeCount,
          creations: this.sessionMetrics.creations,
          expirations: this.sessionMetrics.expirations,
          averageDuration: `${Math.round(this.sessionMetrics.averageDuration / 60000)}m`,
          storeType: this.getStoreType()
        }
      );
      
      // Reset counters for new metrics
      this.sessionMetrics.creations = 0;
      this.sessionMetrics.expirations = 0;
    } catch (error) {
      this.logger.error(`Failed to report session metrics: ${error.message}`);
    }
  }

  /**
   * Updates session metrics by scanning the session store
   */
  private async updateSessionMetrics() {
    if (!this.sessionStore || !this.sessionStore.all) {
      return;
    }
    
    try {
      await this.getActiveSessionCount();
    } catch (error) {
      this.logger.warn(`Failed to update session metrics: ${error.message}`);
    }
  }

  /**
   * Attaches listeners to session store events for monitoring
   */
  private attachStoreListeners(store: Store) {
    // Define a type-safe interface for event store
    interface EventStore {
      on(event: 'set' | 'destroy', callback: (sid: string) => void): void;
    }

    // Check if the store implements the EventStore interface
    if (store && 'on' in store && typeof (store as EventStore).on === 'function') {
      const eventStore = store as EventStore;
      
      // Listen for session creation
      eventStore.on('set', (sid: string) => {
        this.sessionMetrics.creations++;
        
        if (this.sessionOptions.enableLogging) {
          this.logger.debug(`Session created: ${sid}`);
        }
      });
      
      // Listen for session destruction
      eventStore.on('destroy', (sid: string) => {
        this.sessionMetrics.expirations++;
        
        if (this.sessionOptions.enableLogging) {
          this.logger.debug(`Session destroyed: ${sid}`);
        }
      });
    } else {
      this.logger.warn('Session store does not support event listening');
    }
  }
}