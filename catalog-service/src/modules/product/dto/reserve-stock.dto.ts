// src/modules/product/dto/reserve-stock.dto.ts
import { IsMongoId, IsInt, Min } from 'class-validator';

export class ReserveStockDto {
  @IsMongoId()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
