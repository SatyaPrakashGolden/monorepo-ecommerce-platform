"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "./product-card"
import { ProductFilters } from "./product-filters"
import { QuickFilters } from "./quick-filters"
import { Button } from "@/components/ui/button"
import { Grid, List } from "lucide-react"

interface Product {
  id: number
  name: string
  discountPrice: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  isNew: boolean
  isSale: boolean
  category: string
  brand: string
  sizes: string[]
  colors: string[]
  inStock: boolean
  stockCount: number
}

interface ProductListingProps {
  category: string
  title: string
}

export function ProductListing({ category, title }: ProductListingProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("featured")
  const [filters, setFilters] = useState({
    priceRange: [0, 500],
    sizes: [] as string[],
    colors: [] as string[],
    brands: [] as string[],
    availability: "all", // all, in-stock, out-of-stock
  })

  // Mock product data - in real app, this would come from API
  const allProducts: Product[] = [
    {
      id: 1,
      name: "Classic Cotton T-Shirt",
     discountPrice: 29.99,
      originalPrice: 39.99,
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.5,
      reviews: 128,
      isNew: false,
      isSale: true,
      category: "men",
      brand: "Royal Collection",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "White", "Navy"],
      inStock: true,
      stockCount: 15,
    },
    {
      id: 2,
      name: "Elegant Evening Dress",
      discountPrice: 299.99,
      originalPrice: 399.99,
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.8,
      reviews: 89,
      isNew: true,
      isSale: true,
      category: "women",
      brand: "Luxury Line",
      sizes: ["XS", "S", "M", "L"],
      colors: ["Black", "Navy", "Burgundy"],
      inStock: true,
      stockCount: 8,
    },
    {
      id: 3,
      name: "Designer Leather Jacket",
     discountPrice: 199.99,
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.6,
      reviews: 156,
      isNew: false,
      isSale: false,
      category: "men",
      brand: "Premium Style",
      sizes: ["M", "L", "XL"],
      colors: ["Black", "Brown"],
      inStock: false,
      stockCount: 0,
    },
    {
      id: 4,
      name: "Summer Floral Dress",
     discountPrice: 79.99,
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.7,
      reviews: 203,
      isNew: true,
      isSale: false,
      category: "women",
      brand: "Elite Fashion",
      sizes: ["S", "M", "L"],
      colors: ["Pink", "Blue", "Yellow"],
      inStock: true,
      stockCount: 22,
    },
    {
      id: 5,
      name: "Kids Rainbow Hoodie",
     discountPrice: 49.99,
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.9,
      reviews: 67,
      isNew: true,
      isSale: false,
      category: "kids",
      brand: "Designer Choice",
      sizes: ["XS", "S", "M"],
      colors: ["Rainbow", "Pink", "Blue"],
      inStock: true,
      stockCount: 12,
    },
    {
      id: 6,
      name: "Luxury Handbag",
     discountPrice: 149.99,
      originalPrice: 199.99,
      image: "/placeholder.svg?height=400&width=300",
      rating: 4.4,
      reviews: 91,
      isNew: false,
      isSale: true,
      category: "accessories",
      brand: "Royal Collection",
      sizes: ["One Size"],
      colors: ["Black", "Brown", "Tan"],
      inStock: true,
      stockCount: 5,
    },
  ]

  // Filter products based on category and filters
  const filteredProducts = useMemo(() => {
    let products = allProducts

    // Filter by category
    if (category !== "sale") {
      products = products.filter((product) => product.category === category)
    } else {
      products = products.filter((product) => product.isSale)
    }

    // Apply filters
    products = products.filter((product) => {
      // Price range filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false
      }

      // Size filter
      if (filters.sizes.length > 0) {
        if (!filters.sizes.some((size) => product.sizes.includes(size))) {
          return false
        }
      }

      // Color filter
      if (filters.colors.length > 0) {
        if (!filters.colors.some((color) => product.colors.includes(color))) {
          return false
        }
      }

      // Brand filter
      if (filters.brands.length > 0) {
        if (!filters.brands.includes(product.brand)) {
          return false
        }
      }

      // Availability filter
      if (filters.availability === "in-stock" && !product.inStock) {
        return false
      }
      if (filters.availability === "out-of-stock" && product.inStock) {
        return false
      }

      return true
    })

    // Sort products
    switch (sortBy) {
      case "price-low":
        products.sort((a, b) => a.discountPrice - b.discountPrice)
        break
      case "price-high":
        products.sort((a, b) => b.discountPrice - a.discountPrice)
        break
      case "rating":
        products.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      default:
        // Featured - keep original order
        break
    }

    return products
  }, [category, filters, sortBy, allProducts])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters filters={filters} onFiltersChange={setFilters} />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <p className="text-gray-600">Showing {filteredProducts.length} products</p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <QuickFilters sortBy={sortBy} onSortChange={setSortBy} />

          {/* Products Grid/List */}
          {filteredProducts.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-4">No products found</h2>
              <p className="text-gray-600 mb-8">Try adjusting your filters or browse other categories</p>
              <Button
                onClick={() =>
                  setFilters({ priceRange: [0, 500], sizes: [], colors: [], brands: [], availability: "all" })
                }
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
