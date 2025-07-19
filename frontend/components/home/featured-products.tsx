import { ProductCard } from "@/components/product/product-card"

export function FeaturedProducts() {
  const featuredProducts = [
    {
      id: 1,
      name: "Elegant Evening Dress",
      price: 299.99,
      originalPrice: 399.99,
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.8,
      reviews: 124,
      isNew: true,
      isSale: true,
    },
    {
      id: 2,
      name: "Classic Leather Jacket",
      price: 199.99,
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.6,
      reviews: 89,
      isNew: false,
      isSale: false,
    },
    {
      id: 3,
      name: "Designer Handbag",
      price: 149.99,
      originalPrice: 199.99,
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.9,
      reviews: 156,
      isNew: false,
      isSale: true,
    },
    {
      id: 4,
      name: "Casual Summer Dress",
      price: 79.99,
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.7,
      reviews: 203,
      isNew: true,
      isSale: false,
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover our handpicked selection of trending items</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
