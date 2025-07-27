import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'dotenv';
import redisClient from './redis/redisClient'; 

import { MicroserviceOptions, Transport } from '@nestjs/microservices';
config(); 

async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    cors: true, 
  });


  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: false, 
  });


  try {
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
    process.exit(1); 
  }


  app.setGlobalPrefix('api');


  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));


  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: 4002,
    },
  });


  await app.startAllMicroservices();



  const PORT =  2002;
  await app.listen(PORT);
  console.log(`🚀 Identity Service is running on http://localhost:${PORT}`);
  console.log('✅ TCP microservice started on port 4002');
}

bootstrap();