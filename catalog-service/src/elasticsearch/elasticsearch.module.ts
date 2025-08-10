// src/elasticsearch/elasticsearch.module.ts
import { Module } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { SearchController } from './elasticsearch.controller';
 
@Module({
  controllers: [SearchController],  
  providers: [ElasticsearchService],
  
  exports: [ElasticsearchService],         
})
export class ElasticsearchModule {}
