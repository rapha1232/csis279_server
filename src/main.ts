import * as dotenv from 'dotenv';
dotenv.config();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

const port = process.env.APP_PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Raphael Semaan NestJS API')
    .setDescription(
      "This is the documentation for my final project's backend server for the course 'Advances in Computer Science'.",
    )
    .setContact(
      'Raphael Semaan',
      'https://url-to-frontend.netlify.app',
      'raphael.semaan@std.balamand.edu.lb',
    )
    .addTag('NestJS')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  app.use(helmet());
  await app.listen(port || 3001);
}
bootstrap();
