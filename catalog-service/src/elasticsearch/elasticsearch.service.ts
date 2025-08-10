import { Injectable, Logger } from '@nestjs/common';
import { Client, estypes } from '@elastic/elasticsearch';
import { SearchDto } from './dto/search.dto';
import { SearchResult } from './interfaces/search-result.interface';
import { Brand, BrandDocument } from '../modules/brand/schema/brand.schema';
import { Category, CategoryDocument } from '../modules/category/schema/category.schema';
import { ProductStatus } from '../modules/product/schema/product.schema';
@Injectable()
export class ElasticsearchService {

  private readonly logger = new Logger(ElasticsearchService.name);
  private isConnected = false; private client: Client;

  private readonly indexName = 'products';

  constructor(

  ) {
    this.client = new Client({
      node: 'http://localhost:9200',
      auth: {
        username: 'elastic',
        password: '*wUK-Cb6vIgwF8fMmifw',
      },
      // Add connection timeout and retry settings
      requestTimeout: 5000,
      maxRetries: 3,
    });
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.ping();
      this.isConnected = true;
      return true;
    } catch (error) {
      this.isConnected = false;
      this.logger.error('Elasticsearch ping failed:', error.message);
      return false;
    }
  }

  private async ensureConnection(): Promise<boolean> {
    if (!this.isConnected) {
      return await this.ping();
    }
    return true;
  }




  async fullTextSearch(query: string, page = 0, limit = 10) {
    const pricePatterns = [
      { regex: /under\s*(\d+)/i, type: 'under' },
      { regex: /below\s*(\d+)/i, type: 'under' },
      { regex: /less\s*than\s*(\d+)/i, type: 'under' },
      { regex: /<\s*(\d+)/i, type: 'under' },
      { regex: /above\s*(\d+)/i, type: 'above' },
      { regex: /over\s*(\d+)/i, type: 'above' },
      { regex: /more\s*than\s*(\d+)/i, type: 'above' },
      { regex: />\s*(\d+)/i, type: 'above' },
      { regex: /between\s*(\d+)\s*(?:and|to|-)\s*(\d+)/i, type: 'between' },
      { regex: /(\d+)\s*-\s*(\d+)/i, type: 'between' },
      { regex: /exactly\s*(\d+)/i, type: 'exact' },
      { regex: /around\s*(\d+)/i, type: 'around' }
    ];

    let priceFilter: any = null;
    let cleanedQuery = query;

    for (const pattern of pricePatterns) {
      const match = query.match(pattern.regex);
      if (match) {
        switch (pattern.type) {
          case 'under':
            priceFilter = { lte: parseFloat(match[1]) };
            break;
          case 'above':
            priceFilter = { gte: parseFloat(match[1]) };
            break;
          case 'between':
            priceFilter = { gte: parseFloat(match[1]), lte: parseFloat(match[2]) };
            break;
          case 'exact':
            priceFilter = { gte: parseFloat(match[1]), lte: parseFloat(match[1]) };
            break;
          case 'around':
            const price = parseFloat(match[1]);
            priceFilter = { gte: price - 100, lte: price + 100 }; // +/- 100 buffer
            break;
        }
        cleanedQuery = query.replace(pattern.regex, '').trim();
        break; // stop after first match
      }
    }

    const esQuery: any = {
      bool: {
        must: [
          {
            multi_match: {
              query: cleanedQuery,
              fields: ['name^3', 'brandName^2', 'categoryNames'],
              fuzziness: 'AUTO'
            }
          }
        ]
      }
    };

    if (priceFilter) {
      esQuery.bool.filter = [
        {
          bool: {
            should: [
              { range: { discountPrice: priceFilter } },
              { range: { originalPrice: priceFilter } }
            ]
          }
        }
      ];
    }

    const result = await this.client.search({
      index: 'fashion_products',
      from: page * limit,
      size: limit,
      _source: [
        'name',
        'originalPrice',
        'discountPrice',
        'isNew',
        'isSale',
        'images',
        'brandName',
        'categoryNames'
      ],
      query: esQuery
    });

    return result.hits.hits.map((hit: any) => ({
      id: hit._id,
      ...(hit._source as any),
      score: hit._score
    }));
  }






  async createIndex(index: string, body: estypes.IndicesCreateRequest['body']): Promise<any> {
    try {
      if (!(await this.ensureConnection())) {
        throw new Error('Elasticsearch is not available');
      }
      return await this.client.indices.create({ index, body });
    } catch (error) {
      this.logger.error(`Failed to create index ${index}:`, error.message);
      throw error;
    }
  }

  async indexDocument(index: string, id: string, document: Record<string, any>): Promise<any> {
    try {
      if (!(await this.ensureConnection())) {
        throw new Error('Elasticsearch is not available');
      }
      return await this.client.index({ index, id, body: document });
    } catch (error) {
      this.logger.error(`Failed to index document in ${index}:`, error.message);
      throw error;
    }
  }


  async listAllIndices(): Promise<any> {
    try {
      if (!(await this.ensureConnection())) {
        throw new Error('Elasticsearch is not available');
      }

      const indices = await this.client.cat.indices({
        format: 'json',
      });

      return indices; // Already an array of index info
    } catch (error) {
      this.logger.error(`Failed to fetch indices:`, error.message);
      throw error;
    }
  }



  // Add a health check method
  async healthCheck(): Promise<{ status: string; cluster?: any; error?: string }> {
    try {
      if (await this.ping()) {
        const health = await this.client.cluster.health();
        return { status: 'connected', cluster: health };
      }
      return { status: 'disconnected' };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }


  async advancedSearch(searchDto: SearchDto): Promise<SearchResult[]> {
    const { query, page = 0, limit = 10 } = searchDto;

    try {
      const result = await this.client.search({
        index: this.indexName,
        from: page * limit,
        size: limit,
        query: {
          bool: {
            should: [
              {
                match: {
                  name: {
                    query,
                    fuzziness: 'AUTO',
                    boost: 3, // higher weight for product name
                  },
                },
              },
              {
                match: {
                  brandName: {
                    query,
                    fuzziness: 'AUTO',
                    boost: 2, // brand is important but less than name
                  },
                },
              },
              {
                match: {
                  categoryNames: {
                    query,
                    fuzziness: 'AUTO',
                    boost: 1,
                  },
                },
              },
              {
                wildcard: {
                  name: `*${query.toLowerCase()}*`, // partial match
                },
              },
            ],
            minimum_should_match: 1,
          },
        },
      });

      return result.hits.hits.map((hit: any) => ({
        id: hit._id,
        ...(hit._source as Omit<SearchResult, 'id'>),
        score: hit._score,
      }));
    } catch (error) {
      this.logger.error('Search error:', error);
      throw error;
    }
  }





}