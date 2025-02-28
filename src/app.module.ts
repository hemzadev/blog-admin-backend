// src/app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { configSchema } from './config/config.schema'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { PassportModule } from '@nestjs/passport'
import { RedisModule } from './redis/redis.module'
import * as config from './config';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        config.jwtConfig,
        config.redisConfig,
        config.googleConfig,
        config.discordConfig,
        config.githubConfig,
        config.xConfig,
        config.databaseConfig,
        config.sessionConfig,
      ],
      validationSchema: config.configSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
    AuthModule,
    PassportModule.register({
      defaultStrategy: 'google',
      session: true,
    }),
    RedisModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'SESSION_SERIALIZER',
      useValue: (user: any, done: Function) => done(null, user),
    },
    {
      provide: 'SESSION_DESERIALIZER',
      useValue: (user: any, done: Function) => done(null, user),
    },
  ],
})
export class AppModule {}
