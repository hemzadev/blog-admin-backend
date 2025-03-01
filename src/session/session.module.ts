import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';
import { SessionService } from './session.service';
import { SessionHealthIndicator } from './session.health';
import { EnhancedSessionOptions } from './interfaces/session-options.interface';
import { SESSION_CONFIG, SESSION_PROVIDER } from './constants/session.constants';
import { SessionExceptionFilter } from './filters/session-exception.filter';

/**
 * Module responsible for session management
 * Provides configuration and services for session handling with monitoring capabilities
 */
@Module({
  imports: [
    ConfigModule,
    RedisModule,
  ],
  providers: [
    SessionService,
    SessionHealthIndicator,
    SessionExceptionFilter,
    {
      provide: SESSION_CONFIG,
      useFactory: (configService: ConfigService): EnhancedSessionOptions => {
        // Get session configuration from environment
        const sessionConfig: EnhancedSessionOptions = {
          secret: configService.get<string>('SESSION_SECRET') ?? (() => {
            throw new Error('SESSION_SECRET environment variable is required');
          })(),  
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: configService.get('NODE_ENV') === 'production',
            httpOnly: true,
            maxAge: parseInt(
              configService.get('SESSION_MAX_AGE') || '86400000', // Default 24 hours
              10
            ),
          },
          // Enhanced monitoring options
          enableLogging: configService.get<string>('SESSION_LOGGING') === 'true',
          enableMetrics: configService.get<string>('SESSION_METRICS') === 'true',
          keyPrefix: configService.get<string>('SESSION_PREFIX') || 'sess:',
          monitoring: {
            reportInterval: parseInt(
              configService.get('SESSION_REPORT_INTERVAL') || '60000', // Default 1 minute
              10
            ),
            trackDuration: configService.get<string>('SESSION_TRACK_DURATION') === 'true',
            trackGeography: configService.get<string>('SESSION_TRACK_GEO') === 'true',
          },
        };
        
        return sessionConfig;
      },
      inject: [ConfigService],
    },
    {
      provide: SESSION_PROVIDER,
      useFactory: (
        sessionOptions: EnhancedSessionOptions,
        redisService: RedisService,
        sessionService: SessionService,
      ) => {
        // Set up the Redis store
        const RedisStore = connectRedis(session);
        const store = new RedisStore({
          client: redisService.getClient(),
          prefix: sessionOptions.keyPrefix,
        });
        
        // Combine options with store
        const sessionConfig = {
          ...sessionOptions,
          store,
        };
        
        // Register the store and options with the session service for monitoring
        sessionService.setStore(store, sessionOptions);
        
        return sessionConfig;
      },
      inject: [SESSION_CONFIG, RedisService, SessionService],
    },
  ],
  exports: [SESSION_CONFIG, SESSION_PROVIDER, SessionService, SessionHealthIndicator, SessionExceptionFilter],
})
export class SessionModule {
  /**
   * Creates a dynamic module for sessions with custom configuration
   * Allows for overriding default options when importing the module
   */
  static forRoot(options?: Partial<EnhancedSessionOptions>): DynamicModule {
    return {
      module: SessionModule,
      providers: [
        {
          provide: 'CUSTOM_SESSION_OPTIONS',
          useValue: options || {},
        },
        {
          provide: SESSION_CONFIG,
          useFactory: (
            configService: ConfigService,
            customOptions: Partial<EnhancedSessionOptions>,
          ): EnhancedSessionOptions => {
            const defaultOptions: EnhancedSessionOptions = {
              secret: configService.get<string>('SESSION_SECRET')?? (() => {
                throw new Error('SESSION_SECRET environment variable is required');
              })(),
              resave: false,
              saveUninitialized: false,
              cookie: {
                secure: configService.get('NODE_ENV') === 'production',
                httpOnly: true,
                maxAge: parseInt(
                  configService.get('SESSION_MAX_AGE') || '86400000',
                  10
                ),
              },
              enableLogging: configService.get<string>('SESSION_LOGGING') === 'true',
              enableMetrics: configService.get<string>('SESSION_METRICS') === 'true',
              keyPrefix: configService.get<string>('SESSION_PREFIX') || 'sess:',
              monitoring: {
                reportInterval: parseInt(
                  configService.get('SESSION_REPORT_INTERVAL') || '60000',
                  10
                ),
                trackDuration: configService.get<string>('SESSION_TRACK_DURATION') === 'true',
                trackGeography: configService.get<string>('SESSION_TRACK_GEO') === 'true',
              },
            };
            
            // Merge default options with custom options
            return {
              ...defaultOptions,
              ...customOptions,
              cookie: {
                ...defaultOptions.cookie,
                ...customOptions.cookie,
              },
              monitoring: {
                ...defaultOptions.monitoring,
                ...customOptions.monitoring,
              },
            };
          },
          inject: [ConfigService, 'CUSTOM_SESSION_OPTIONS'],
        },
      ],
    };
  }
}