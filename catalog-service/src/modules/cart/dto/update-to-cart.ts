import { IsMongoId, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { SizeName } from '../../product/schema/product.schema'; 

export class UpdateCartItemDto {
  @IsMongoId()
  product: string;

  @IsEnum(SizeName)
  size: SizeName;

  @IsString()
  color: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
