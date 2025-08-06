export interface Product {
  id: number | string;
  name: string;
  discountPrice: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  isNew: boolean;
  isSale: boolean;
  inStock?: boolean;
  stockCount?: number;
}