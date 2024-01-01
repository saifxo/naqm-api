import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigValidator } from './shared/constants';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { Logger } from './shared/logger/logger';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Naqm API')
    .setDescription('Naqm API endpoint for Authentication and Users')
    .setVersion('1.0')
    .addTag('naqm')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter  token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();

  const allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'http://10.7.40.64',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.some((allowed) => origin.includes(allowed))) {
        const msg =
          'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
        callback(new Error(msg));
      }
      callback(null, true);
    },
  });

  app.setGlobalPrefix(process.env.PREFIX);
  app.enableCors();
  const dir = join(__dirname, '../uploads');
  app.use('/uploads', express.static(dir));
  app.setBaseViewsDir(join(__dirname, '..', 'templates'));
  app.useGlobalPipes(new ValidationPipe(ConfigValidator));
  app.useGlobalInterceptors(new ResponseInterceptor());
  // app.useLogger(app.get(Logger));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(process.env.PREFIX, app, document);

  await app.listen(process.env.PORT);
}

bootstrap();
