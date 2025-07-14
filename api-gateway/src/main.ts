import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.enableCors();

  app.setGlobalPrefix('api');

 
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, 
      forbidNonWhitelisted: true,
      transform: true, 
    }),
  );

  const PORT = 2000
  await app.listen(PORT);
  Logger.log(`🚀 API Gateway is running on http://localhost:${PORT}/api`);
}

bootstrap();
