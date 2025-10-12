import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { SearchDto } from './dto/search.dto';
import { FullTextSearchDto } from './dto/full-text-search.dto';
import { errorResponse, successResponse } from '../utils/error.util';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('search')
export class SearchController {
  constructor(private readonly elasticsearchService: ElasticsearchService) { }
  // Full-text search with fuzzy matching
  @Get('full-text')
  @UsePipes(new ValidationPipe({ transform: true }))
  async fullTextSearch(@Query() searchDto: FullTextSearchDto) {
    return await this.elasticsearchService.fullTextSearch(
      searchDto.query,
      searchDto.page,
      searchDto.limit
    );
  }

  @MessagePattern({ cmd: 'search_full_text' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async fullTextSearchMessage(@Payload() searchDto: FullTextSearchDto) {
    try {
      const result = await this.elasticsearchService.fullTextSearch(
        searchDto.query,
        searchDto.page,
        searchDto.limit
      );
      return successResponse(result, 'Full-text search completed successfully');
    } catch (error) {
      console.error('[SearchController] fullTextSearchMessage error:', error);
      throw errorResponse(error, 'Failed to perform full-text search', 500, true);
    }
  }

  // Elasticsearch health check
  @Get('health')
  async healthCheck() {
    return await this.elasticsearchService.healthCheck();
  }

  // Advanced multi-field search
  @Get('advanced')
  @UsePipes(new ValidationPipe({ transform: true }))
  async advancedSearch(@Query() searchDto: SearchDto) {
    return await this.elasticsearchService.advancedSearch(searchDto);
  }


  @Get('indices')
  async listAllIndices() {
    return await this.elasticsearchService.listAllIndices();
  }
}
