// src/elasticsearch/elasticsearch.module.ts
import { Module } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { SearchController } from './elasticsearch.controller';

@Module({
  controllers: [SearchController],  // 👈 Add controller
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],         // 👈 So it can be used in other modules
})
export class ElasticsearchModule {}
