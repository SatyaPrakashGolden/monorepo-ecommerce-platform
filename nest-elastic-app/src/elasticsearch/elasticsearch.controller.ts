import { Controller, Get, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ClientKafka } from '@nestjs/microservices';
import {  Partitioners } from 'kafkajs';

@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Get()
  async search(@Query('q') query: string) {
    try {
      if (!query) {
        throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
      }

      const results = await this.elasticsearchService.searchBestResults(query);
      
      return {
        success: true,
        data: results,
        message: results.models.length === 0 && results.variants.length === 0 
          ? 'No results found' 
          : 'Search completed successfully'
      };
    } catch (error) {
      this.logger.error('Search endpoint error:', error);
      
      // Check if it's an Elasticsearch connection error
      if (error.message.includes('Elasticsearch is not available')) {
        return {
          success: false,
          data: { models: [], variants: [] },
          message: 'Search service is temporarily unavailable. Please try again later.',
          error: 'ELASTICSEARCH_UNAVAILABLE'
        };
      }

      // Handle other errors
      throw new HttpException(
        {
          success: false,
          message: 'Search failed',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  async healthCheck() {
    try {
      const health = await this.elasticsearchService.healthCheck();
      return {
        success: true,
        elasticsearch: health
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        success: false,
        elasticsearch: { status: 'error', error: error.message }
      };
    }
  }
}