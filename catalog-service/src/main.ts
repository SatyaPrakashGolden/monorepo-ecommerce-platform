import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ElasticsearchService } from './elasticsearch/elasticsearch.service';
import redisClient from './redis/redisClient';
import { ClientKafka } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3003;

  // Redis connection
  try {
    await redisClient.connect();
    console.log('✅ Redis Connected');
  } catch (err) {
    console.error('❌ Redis Connection Failed:', err.message);
  }

  // Elasticsearch connection
  const elasticsearchService = app.get(ElasticsearchService);
  const isConnected = await elasticsearchService.ping();
  if (isConnected) {
    console.log('✅ Elasticsearch Connected');
  } else {
    console.warn('❌ Elasticsearch Connection Failed');
  }

  // Kafka connection
  const kafkaService = app.get<ClientKafka>('KAFKA_SERVICE');
  await kafkaService.connect();
  console.log('✅ Kafka Connected');

  await app.listen(port);
  console.log(`🚀 App is running on http://localhost:${port}`);
}
bootstrap();
