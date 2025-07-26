// /home/satya/myproject/frontend/app/product/[id]/page.tsx
import { ProductDetail } from "@/components/product/product-detail"
import { RelatedProducts } from "@/components/product/related-products"

interface ProductPageProps {
  params: Promise<{ id: string }> // Update to reflect that params is a Promise
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params // Await the params to resolve the Promise
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail productId={id} />
      <RelatedProducts productId={id} />
    </div>
  )
}