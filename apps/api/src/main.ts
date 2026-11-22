import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { API_CONSTANTS } from '@solaros/config';

async function bootstrap() {
  const logger = new Logger('SolarOS-Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security headers & compression
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // Global Correlation ID
  app.use(new CorrelationIdMiddleware().use);

  // CORS configuration for dual frontends: Existing Web (3000) & Platform Admin (3001)
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // allow requests with no origin (like mobile apps, curl, or internal micro-calls)
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:(3000|3001)$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      API_CONSTANTS.CORRELATION_ID_HEADER,
      API_CONSTANTS.TENANT_ID_HEADER,
      API_CONSTANTS.BRANCH_ID_HEADER,
    ],
  });

  // Global API Prefix
  app.setGlobalPrefix(API_CONSTANTS.API_PREFIX);

  // Global DTO Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  // Global Exception Filter & Logging
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger / OpenAPI documentation
  if (process.env.ENABLE_SWAGGER !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('SolarOS ERP API')
      .setDescription('Enterprise Solar EPC SaaS & Operations Management API')
      .setVersion('1.0')
      .addTag('Health', 'System and dependency health status')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: API_CONSTANTS.TENANT_ID_HEADER, in: 'header' }, API_CONSTANTS.TENANT_ID_HEADER)
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger documentation registered at /docs');
  }

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  const port = process.env.PORT || API_CONSTANTS.DEFAULT_PORT;
  await app.listen(port);
  logger.log(`SolarOS API running on port ${port} with prefix /${API_CONSTANTS.API_PREFIX}`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during SolarOS API bootstrap:', err);
  process.exit(1);
});
