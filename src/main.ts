// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import passport from 'passport';
import helmet from 'helmet';
import session from 'express-session';
import { SessionModule } from './session/session.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure sessions using the SessionModule
  const sessionConfig = app.get('SESSION_CONFIG');
  app.use(session(sessionConfig));

  app.use(helmet());
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT || 3000);
}

bootstrap();