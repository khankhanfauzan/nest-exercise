import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { rateLimitMiddleware } from './common/middleware/rate-limitter.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Add prefix and versioning 
  app.setGlobalPrefix('/api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  // Security & Performance Middleware
  app.use(helmet());
  app.use(compression());
  app.use(morgan('dev'));
  app.use(rateLimitMiddleware);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Nest Excercise')
    .setDescription('Learning DTOs, Pipes, and API Documentation')
    .setVersion('1.1')
    .addTag('products')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
