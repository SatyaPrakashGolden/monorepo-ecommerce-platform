import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import { KafkaModule } from './kafka/kafka.module';
import { BrandModule } from './modules/brand/brand.module';
import { DatabaseModule } from './database/database.module';
import { CategoryModule } from './modules/category/categoty.module'
//import { ProductModule } from './modules/product/product.module';
import { ReviewModule } from './modules/review/review.module';
import { OfferModule } from './modules/offer/offer.module'; // Import the new module

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://satya:gvddB3fNptw1ABHW@cluster0.4zj2o.mongodb.net/fashion_store'),
    ElasticsearchModule,
    KafkaModule,
    DatabaseModule,
    BrandModule,
    CategoryModule,
    //ProductModule,
    ReviewModule,
    OfferModule 
  ],
})
export class AppModule {}