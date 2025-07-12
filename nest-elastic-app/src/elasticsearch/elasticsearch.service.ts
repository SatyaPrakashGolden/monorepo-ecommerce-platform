import { Injectable, Logger } from '@nestjs/common';
import { Client, estypes } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService {
  private client: Client;
  private readonly logger = new Logger(ElasticsearchService.name);
  private isConnected = false;

  constructor() {
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

  async search(index: string, body: estypes.SearchRequest['body']): Promise<estypes.SearchResponse<any>> {
    try {
      if (!(await this.ensureConnection())) {
        throw new Error('Elasticsearch is not available');
      }
      return await this.client.search({ index, body });
    } catch (error) {
      this.logger.error(`Failed to search in ${index}:`, error.message);
      throw error;
    }
  }

  async fuzzySearch(
    index: string,
    fields: string[],
    query: string,
    fuzziness: string = '2'
  ): Promise<estypes.SearchResponse<any>> {
    try {
      if (!(await this.ensureConnection())) {
        throw new Error('Elasticsearch is not available');
      }
      
      const searchParams: estypes.SearchRequest = {
        index,
        query: {
          multi_match: {
            query,
            fields,
            fuzziness,
            operator: 'or' as const,
            boost: 1.0,
          },
        },
      };
      return await this.client.search(searchParams);
    } catch (error) {
      this.logger.error(`Failed to perform fuzzy search in ${index}:`, error.message);
      throw error;
    }
  }

  async searchBestResults(query: string): Promise<{
    models: Array<Record<string, any> & { score: number }>;
    variants: Array<Record<string, any> & { score: number }>;
  }> {
    if (!query) {
      throw new Error('Search query is required');
    }

    try {
      if (!(await this.ensureConnection())) {
        this.logger.warn('Elasticsearch not available, returning empty results');
        return { models: [], variants: [] };
      }

      const modelFields = ['model_name^3', 'brand^2', 'slug', 'gallery.hero_image.title^0.5'];
      const variantFields = ['variant_name^3', 'two_wheeler_model^2', 'colors.color_name^1.5', 'gallery.hero_image.title^0.5'];

      const [modelResults, variantResults] = await Promise.all([
        this.fuzzySearch('tw_models', modelFields, query),
        this.fuzzySearch('tw_variants', variantFields, query),
      ]);

      return {
        models: modelResults.hits.hits.map(hit => ({
          ...hit._source,
          score: hit._score,
        })),
        variants: variantResults.hits.hits.map(hit => ({
          ...hit._source,
          score: hit._score,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to search best results:', error.message);
      // Return empty results instead of crashing
      return { models: [], variants: [] };
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
}