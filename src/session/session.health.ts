import {
    HealthIndicator,
    HealthIndicatorResult,
    HealthCheckError,
  } from '@nestjs/terminus';
  import { Injectable } from '@nestjs/common';
  import { SessionService } from './session.service';
  
  /**
   * Health indicator for session store availability
   * Integrates with NestJS health checks for monitoring session functionality
   */
  @Injectable()
  export class SessionHealthIndicator extends HealthIndicator {
    constructor(private readonly sessionService: SessionService) {
      super();
    }
  
    /**
     * Performs health check on the session store
     * @param key The key which will be used for the result object
     * @returns A health indicator result
     */
    async isHealthy(key: string): Promise<HealthIndicatorResult> {
      try {
        // Check store availability
        const isAvailable = await this.sessionService.checkStoreAvailability();
        const activeSessions = await this.sessionService.getActiveSessionCount();
        
        // If store is available, return healthy with additional details
        return this.getStatus(key, isAvailable, {
          activeSessions,
          storeType: this.sessionService.getStoreType(),
        });
      } catch (error) {
        // If store is unavailable, throw a health check error
        throw new HealthCheckError(
          'Session store check failed',
          this.getStatus(key, false, {
            reason: error.message,
          }),
        );
      }
    }
  }