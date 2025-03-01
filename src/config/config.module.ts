// src/config/config.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { 
  appConfig,
  jwtConfig, 
  redisConfig, 
  databaseConfig, 
  sessionConfig,
  googleConfig,
  discordConfig,
  githubConfig,
  xConfig,
  configSchema 
} from './index';

/**
 * Module for application configuration loading and validation
 */
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        jwtConfig,
        redisConfig,
        databaseConfig,
        sessionConfig,
        googleConfig,
        discordConfig,
        githubConfig,
        xConfig,
      ],
      validationSchema: configSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
      cache: true,
      expandVariables: true,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}