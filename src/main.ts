import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';

import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://wastetoworth.onrender.com',
  ];

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: (requestOrigin, callback) => {
        // Cho phép không có origin (như curl) hoặc nằm trong whitelist
        if (!requestOrigin) return callback(null, true);

        // Cho phép localhost, onrender, hoặc IP mạng nội bộ (192.168.x.x)
        if (
          allowedOrigins.includes(requestOrigin) ||
          /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d{1,5}$/.test(requestOrigin)
        ) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    },
  });

  app.use(cookieParser());

  app.useStaticAssets(resolve('uploads'), {
    prefix: '/uploads',
  });

  // ✅ Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // ✅ Swagger setup
  const config = new DocumentBuilder()
    .setTitle('BookShop API')
    .setDescription('API documentation for the book store platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const PORT = process.env.PORT ?? 3212;
  await app.listen(PORT, '0.0.0.0');

  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 Swagger docs available at http://localhost:${PORT}/api`);
}
bootstrap();
