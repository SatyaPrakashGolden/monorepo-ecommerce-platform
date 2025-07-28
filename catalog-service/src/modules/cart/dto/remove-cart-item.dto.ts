import { IsMongoId, IsEnum, IsString } from 'class-validator';
import { SizeName } from '../../product/schema/product.schema'; 

export class RemoveCartItemDto {
  @IsMongoId()
  product: string;

  @IsEnum(SizeName)
  size: SizeName;

  @IsString()
  color: string;
}
