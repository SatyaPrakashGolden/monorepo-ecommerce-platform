//monorepo-ecommerce-platform/catalog-service/src/modules/brand/dto/create-brand.dto.ts
import { IsBoolean, IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  name: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase, alphanumeric, and hyphen-separated',
  })
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo must be a valid URL' })
  logo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;
}
