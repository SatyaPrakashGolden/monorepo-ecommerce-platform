import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { KafkaModule } from './kafka/kafka.module';
import { BrandModule } from './modules/brand/brand.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://satya:gvddB3fNptw1ABHW@cluster0.4zj2o.mongodb.net/fashion_store'),
    ElasticsearchModule,
    KafkaModule,
    DatabaseModule,
    BrandModule,
  ],
})
export class AppModule {}
