import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; 
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.use(helmet());
  app.enableCors({ origin: process.env.CORS_ORIGINS?.split(',') });
  app.enableCors({
    origin: true, // Allow all origins for development
    credentials: true
  });
}
bootstrap();
