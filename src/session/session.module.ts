import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { RedisModule } from '../redis/redis.module';
import { RedisService } from '../redis/redis.service';

@Module({
  imports: [
    ConfigModule,
    RedisModule,
  ],
  providers: [
    {
      provide: 'SESSION_CONFIG',
      useFactory: (config: ConfigService, redisService: RedisService) => {
        const RedisStore = connectRedis(session);
        return {
          store: new RedisStore({ client: redisService.getClient() }),
          secret: config.get('SESSION_SECRET'),
          resave: false,
          saveUninitialized: false,
          cookie: {
            secure: config.get('NODE_ENV') === 'production',
            httpOnly: true,
            maxAge: parseInt(config.get('SESSION_MAX_AGE') || '86400000'),
          },
        };
      },
      inject: [ConfigService, RedisService],
    },
  ],
  exports: ['SESSION_CONFIG'],
})
export class SessionModule {} 