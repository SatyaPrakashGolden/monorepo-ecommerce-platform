// /src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Inject } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ClientKafka } from '@nestjs/microservices';
import {  Partitioners } from 'kafkajs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  });

  // Set global prefix
  app.setGlobalPrefix('api');
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Inject Kafka Client
  const kafkaClient = app.get<ClientKafka>('KAFKA_SERVICE');  


  await kafkaClient.connect()
    .then(() => {
      console.log('✅ Kafka connected successfully!');
    })
    .catch((error) => {
      console.error('❌ Kafka connection failed:', error);
    });

  // Microservice connection using TCP
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 6006,
    },
  });

  await app.startAllMicroservices();
  
  const PORT = 5006;
  await app.listen(PORT);
  console.log(`🚀 Payment Service is running on http://localhost:${PORT}`);
  console.log('✅ TCP microservice running on port 6006');
}
bootstrap();