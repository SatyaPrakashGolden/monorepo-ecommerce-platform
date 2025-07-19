import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Category Gateway (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/category/add-category (POST)', () => {
    it('should create a new category and return it', () => {
      // Append a random number to make the data unique for each test run
      const uniqueId = Math.floor(Math.random() * 1000);
      const createCategoryDto = {
        name: `Test Category ${uniqueId}`,
        slug: `test-category-${uniqueId}`,
        description: 'A test category description',
      };

      return request(app.getHttpServer())
        .post('/api/category/add-category')
        .send(createCategoryDto)
        .expect(201)
        .then((response) => {
          expect(response.body.success).toBe(true);
          expect(response.body.message).toEqual('Category added successfully');
          
          const result = response.body.data;
          expect(result.success).toBe(true);
          expect(result.data.name).toEqual(createCategoryDto.name);
          expect(result.data.slug).toBeDefined();
        });
    });

    it('should return a 400 Bad Request if the name is missing', () => {
      const invalidDto = {
        slug: 'invalid-slug',
        description: 'This is an invalid DTO'
      };

      return request(app.getHttpServer())
        .post('/api/category/add-category')
        .send(invalidDto)
        .expect(400);
    });
  });
});