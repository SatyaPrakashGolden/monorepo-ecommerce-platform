"use client"

import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product/product-card"
import { ProductFilters } from "@/components/product/product-filters"
import { ProductSort } from "@/components/product/product-sort"

export function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  // Mock search results
  const searchResults = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Search Result ${i + 1} - ${query}`,
    price: Math.floor(Math.random() * 300) + 50,
    originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 400) + 100 : undefined,
    image: `/placeholder.svg?height=400&width=300&query=${query} product ${i + 1}`,
    rating: Math.floor(Math.random() * 2) + 4,
    reviews: Math.floor(Math.random() * 200) + 10,
    isNew: Math.random() > 0.7,
    isSale: Math.random() > 0.6,
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Search Results for "{query}"</h1>
        <p className="text-gray-600">Showing {searchResults.length} results</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex items-center justify-end mb-6">
            <ProductSort />
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-xl font-semibold mb-4">No results found</h2>
              <p className="text-gray-600 mb-8">Try adjusting your search or browse our categories</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
