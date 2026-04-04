import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { SanitizeInterceptor } from './common/interceptors/sanitize.interceptor';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Body size limits (prevent DoS via large payloads)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://api.paystack.co'],
          fontSrc: ["'self'", 'https:', 'data:'],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    }),
  );

  // CORS — require explicit origins in production
  const corsOrigins = process.env.CORS_ORIGINS?.split(',').filter(Boolean);
  if (!corsOrigins?.length && process.env.NODE_ENV === 'production') {
    console.error('FATAL: CORS_ORIGINS env variable is required in production');
    process.exit(1);
  }
  app.enableCors({
    origin: corsOrigins ?? [
      'http://localhost:3000', // Public site
      'http://localhost:3002', // Student portal
      'http://localhost:3003', // Employer portal
      'http://localhost:3004', // Admin portal
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global XSS sanitization
  app.useGlobalInterceptors(new SanitizeInterceptor());

  // API prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Intemso API running on port ${port}`);
}

bootstrap();
