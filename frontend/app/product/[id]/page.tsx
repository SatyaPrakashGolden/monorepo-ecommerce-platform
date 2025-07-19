import { ProductDetail } from "@/components/product/product-detail"
import { RelatedProducts } from "@/components/product/related-products"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail productId={params.id} />
      <RelatedProducts />
    </div>
  )
}
