import { ProductCard } from "./product-card"

export function RelatedProducts() {
  const relatedProducts = Array.from({ length: 4 }, (_, i) => ({
    id: i + 100,
    name: `Related Product ${i + 1}`,
    discountPrice: Math.floor(Math.random() * 200) + 50,
    originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 300) + 100 : undefined,
    image: `/placeholder.svg?height=400&width=300&query=related product ${i + 1}`,
    rating: Math.floor(Math.random() * 2) + 4,
    reviews: Math.floor(Math.random() * 100) + 10,
    isNew: Math.random() > 0.7,
    isSale: Math.random() > 0.6,
  }))

  return (
    <section className="py-12 border-t">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">You might also like</h2>
        <p className="text-gray-600">Similar products that other customers loved</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
