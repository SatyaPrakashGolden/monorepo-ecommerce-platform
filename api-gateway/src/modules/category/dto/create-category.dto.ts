import { IsString, IsOptional, Matches } from 'class-validator';

export class CreateCategoryDto {
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
}