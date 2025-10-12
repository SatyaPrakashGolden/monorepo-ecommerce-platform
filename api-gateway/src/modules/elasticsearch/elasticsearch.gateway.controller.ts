import { 
  Controller, 
  Get, 
  Query, 
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { ElasticsearchGatewayService } from './elasticsearch.gateway.service';
import { successResponse, throwHttpFormattedError } from '../../utils/error.util';

@Controller('search')
export class SearchGatewayController {
  constructor(private readonly searchService: ElasticsearchGatewayService) {}

  @Get('full-text')
  @UsePipes(new ValidationPipe({ transform: true }))
  async fullTextSearch(@Query() searchDto: any) {
    try {
      const result = await this.searchService.fullTextSearch(searchDto);
      return successResponse(result, 'Full-text search completed successfully');
    } catch (error) {
      throwHttpFormattedError(error, 'Failed to perform full-text search');
    }
  }
  
}
