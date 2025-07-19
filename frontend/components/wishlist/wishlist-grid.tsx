"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface WishlistItem {
  id: number
  name: string
  price: number
  originalPrice?: number
  image: string
  inStock: boolean
}

export function WishlistGrid() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 1,
      name: "Elegant Evening Dress",
      price: 299.99,
      originalPrice: 399.99,
      image: "/placeholder.svg?height=400&width=300",
      inStock: true,
    },
    {
      id: 2,
      name: "Designer Handbag",
      price: 149.99,
      image: "/placeholder.svg?height=400&width=300",
      inStock: false,
    },
    {
      id: 3,
      name: "Casual Summer Dress",
      price: 79.99,
      image: "/placeholder.svg?height=400&width=300",
      inStock: true,
    },
  ])

  const removeFromWishlist = (id: number) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id))
  }

  const addToCart = (id: number) => {
    // Handle add to cart logic
    console.log("Adding to cart:", id)
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-4">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-8">Save items you love to your wishlist</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">{wishlistItems.length} items in your wishlist</p>
        <Button variant="outline" onClick={() => setWishlistItems([])}>
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="group relative">
            <CardContent className="p-0">
              {/* Remove Button */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                onClick={() => removeFromWishlist(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Product Image */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/product/${item.id}`} className="block">
                  <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors mb-2">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-gray-900">${item.price}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                  )}
                </div>

                <Button
                  className="w-full gradient-royal-primary text-white border-0"
                  disabled={!item.inStock}
                  onClick={() => addToCart(item.id)}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {item.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
