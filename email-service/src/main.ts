import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport, ClientKafka } from '@nestjs/microservices';
import {  Partitioners } from 'kafkajs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  // Enable CORS globally
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: false,
  });

  // Prefix all HTTP routes with /api
  app.setGlobalPrefix('api');

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Connect Kafka Microservice with Legacy Partitioner
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
      },
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID || 'email-service-group',
      },
      producer: {
        createPartitioner: Partitioners.LegacyPartitioner,
      },
    },
  });
  // Connect TCP Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 6005,
    },
  });

  // Start all microservices
  await app.startAllMicroservices();

  // Inject Kafka Client
  const kafkaClient = app.get<ClientKafka>('KAFKA_SERVICE');

  // Connect to Kafka and log success/failure
  await kafkaClient.connect()
    .then(() => {
      console.log('✅ Kafka connected successfully!');
    })
    .catch((error) => {
      console.error('❌ Kafka connection failed:', error);
    });

  // Start HTTP server
  const PORT = 5005;
  await app.listen(PORT);
  console.log(`🚀 Order Service is running at http://localhost:${PORT}`);
  console.log('✅ TCP Microservice is running on port 6005');
}

bootstrap();