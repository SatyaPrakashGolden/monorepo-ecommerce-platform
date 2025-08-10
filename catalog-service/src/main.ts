import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch/elasticsearch.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the ElasticsearchService instance
  const elasticsearchService = app.get(ElasticsearchService);

  // Check Elasticsearch connection
  const health = await elasticsearchService.healthCheck();
  if (health.status === 'connected') {
    console.log('✅ Elasticsearch connected')
    Logger.log('✅ Elasticsearch connected', 'Bootstrap');
  } else {
    Logger.error(`❌ Elasticsearch connection failed: ${health.error || 'Unknown error'}`, 'Bootstrap');
  }

  // Set global prefix for HTTP routes
  app.setGlobalPrefix('api');

  // Configure TCP microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 4001,
    },
  });

  // Start microservices
  await app.startAllMicroservices();
  Logger.log(`✅ TCP Microservice listening on port 4001`, 'Bootstrap');

  // Start HTTP server
  const port = 2001;
  await app.listen(port);
  console.log(`🚀 Catalog running on http://localhost:${port}`)
  Logger.log(`🚀 Catalog running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();