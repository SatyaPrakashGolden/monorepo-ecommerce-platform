import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS if you want to allow cross-origin requests
  app.enableCors();

  // Global validation pipe for request DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  const port =  2005;
  await app.listen(port);
  console.log(`Notification service is running on http://localhost:${port}`);
}

bootstrap();
