import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { KafkaModule } from './kafka/kafka.module'; // 👈 Import Kafka module

@Module({
  imports: [
    ElasticsearchModule,
    KafkaModule, // 👈 Add this
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
