export interface SearchResult {
  id: string;
  name: string;
  brandName: string;
  categoryNames: string[];
  originalPrice: number;
  discountPrice: number;
  isNew: boolean;
  isSale: boolean;
  image: string;
  score?: number;
}


