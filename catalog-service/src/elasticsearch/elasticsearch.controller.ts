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

@Controller('search')
export class SearchController {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

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

    @Get('indices')
  async listAllIndices() {
    return await this.elasticsearchService.listAllIndices();
  }
}
