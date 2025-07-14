import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from './database.service';
import { BrandRepository } from './repositories/brand.repository';
import { Brand, BrandSchema } from '../modules/brand/schema/brand.schema'; // ✅ FIXED: Added BrandSchema

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }]),
  ],
  providers: [DatabaseService, BrandRepository],
  exports: [DatabaseService, BrandRepository, MongooseModule],
})
export class DatabaseModule {}
