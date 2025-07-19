import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  Transport,
  MicroserviceOptions,
} from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0', // or 'localhost'
      port: 4001,
    },
  });

  await app.startAllMicroservices();
  Logger.log(`✅ TCP Microservice listening on port 4001`);

  // Also expose HTTP REST if needed
  const port =  2001;
  await app.listen(port);
  Logger.log(`🚀 catalog running on http://localhost:${port}`);
}
bootstrap();
