// import { ProductCard } from "./product-card"

// export function RelatedProducts() {
//   const relatedProducts = Array.from({ length: 4 }, (_, i) => ({
//     id: i + 100,
//     name: `Related Product ${i + 1}`,
//     discountPrice: Math.floor(Math.random() * 200) + 50,
//     originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 300) + 100 : undefined,
//     image: `/placeholder.svg?height=400&width=300&query=related product ${i + 1}`,
//     rating: Math.floor(Math.random() * 2) + 4,
//     reviews: Math.floor(Math.random() * 100) + 10,
//     isNew: Math.random() > 0.7,
//     isSale: Math.random() > 0.6,
//   }))

//   return (
//     <section className="py-12 border-t">
//       <div className="mb-8">
//         <h2 className="text-2xl font-bold mb-4">You might also like</h2>
//         <p className="text-gray-600">Similar products that other customers loved</p>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//         {relatedProducts.map((product) => (
//           <ProductCard key={product.id} product={product} />
//         ))}
//       </div>
//     </section>
//   )
// }

// /home/satya/myproject/frontend/components/product/related-products.tsx
"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"

interface RelatedProductsProps {
  productId: string
}

interface RelatedProduct {
  id: string
  name: string
  slug: string
  originalPrice: number
  discountPrice: number
  stockCount: number
  isNew: boolean
  isSale: boolean
  discountPercentage: number
  hasDiscount: boolean
  image: string
  rating: number
  totalReviews: number
  isInStock: boolean
  offerDetails: {
    name: string
    discountType: string
    discountValue: number
  }
}

export function RelatedProducts({ productId }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRelatedProducts() {
      try {
        setIsLoading(true)
        const response = await fetch(`http://localhost:2000/api/product/product-related?productId=${productId}`)
        const data = await response.json()

        if (data.success && data.data) {
          setRelatedProducts(data.data)
        } else {
          setError("Failed to load related products")
        }
      } catch (err) {
        setError("Error fetching related products")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedProducts()
  }, [productId])

  if (isLoading) {
    return (
      <section className="py-12 border-t">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">You might also like</h2>
          <p className="text-gray-600">Similar products that other customers loved</p>
        </div>
        <div>Loading...</div>
      </section>
    )
  }

  if (error || relatedProducts.length === 0) {
    return (
      <section className="py-12 border-t">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">You might also like</h2>
          <p className="text-gray-600">Similar products that other customers loved</p>
        </div>
        <div>{error || "No related products found"}</div>
      </section>
    )
  }

  return (
    <section className="py-12 border-t">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">You might also like</h2>
        <p className="text-gray-600">Similar products that other customers loved</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={{
            id: product.id,
            name: product.name,
            discountPrice: product.discountPrice,
            originalPrice: product.hasDiscount ? product.originalPrice : undefined,
            image: product.image,
            rating: product.rating,
            reviews: product.totalReviews,
            isNew: product.isNew,
            isSale: product.isSale
          }} />
        ))}
      </div>
    </section>
  )
}