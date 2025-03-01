import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import passport from 'passport';
import helmet from 'helmet';
import session from 'express-session';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis/redis.service';
import connectRedis from 'connect-redis'; // Import connect-redis correctly

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the ConfigService and RedisService instances
  const configService = app.get(ConfigService);
  const redisService = app.get(RedisService);

  // Initialize connect-redis with the session
  const RedisStore = connectRedis(session);

  // Configure sessions using the Redis store
  const sessionConfig = {
    secret: configService.get<string>('SESSION_SECRET') || 'default-secret', // Ensure a fallback secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: configService.get('NODE_ENV') === 'production', // Secure cookies in production
      httpOnly: true,
      maxAge: parseInt(configService.get('SESSION_MAX_AGE') || '86400000'), // Default 24 hours
    },
    store: new RedisStore({
      client: redisService.getClient(), // Use the Redis client from RedisService
      prefix: configService.get<string>('SESSION_PREFIX') || 'sess:', // Optional prefix for Redis keys
    }),
  };

  // Apply session middleware
  app.use(session(sessionConfig));

  // Apply security middleware
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Initialize Passport for authentication
  app.use(passport.initialize());
  app.use(passport.session());

  // Start the application
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`Application is running on port ${port}`);
}

bootstrap();