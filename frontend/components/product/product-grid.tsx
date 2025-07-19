import { ProductCard } from "./product-card"

export function ProductGrid() {
  // Mock product data
  const products = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    price: Math.floor(Math.random() * 300) + 50,
    originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 400) + 100 : undefined,
    image: `/placeholder.svg?height=400&width=300&query=fashion product ${i + 1}`,
    rating: Math.floor(Math.random() * 2) + 4,
    reviews: Math.floor(Math.random() * 200) + 10,
    isNew: Math.random() > 0.7,
    isSale: Math.random() > 0.6,
  }))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
