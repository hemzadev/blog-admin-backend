// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configSchema } from './config/config.schema';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PassportModule } from '@nestjs/passport';
;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchema,
    }),
    AuthModule,
    PassportModule.register({ 
      defaultStrategy: 'google',
      session: true 
    }),
  ],
  controllers: [AppController],
  providers: [AppService,
    {
    provide: 'SESSION_SERIALIZER',
    useValue: (user: any, done: Function) => done(null, user)
    },
    {
      provide: 'SESSION_SERIALIZER',
      useValue: (user: any, done: Function) => done(null, user)
    },
    {
      provide: 'SESSION_DESERIALIZER',
      useValue: (user: any, done: Function) => done(null, user)
    }
  ],
})
export class AppModule {}