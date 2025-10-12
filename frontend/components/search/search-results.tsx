// /home/satya/myproject/frontend/components/search/search-results.tsx
"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ProductCard } from "@/components/product/product-card"
import { ProductFilters, type Filters } from "@/components/product/product-filters"
import { ProductSort } from "@/components/product/product-sort"
import { Product } from "../../app/types/product"

export function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 3000],
    sizes: [],
    colors: [],
    brands: [],
    availability: "all",
  })

  useEffect(() => {
    async function fetchSearchResults() {
      if (!query.trim()) {
        setSearchResults([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `http://localhost:2000/api/search/full-text?query=${encodeURIComponent(query)}&page=0&limit=1000`
        )

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            setSearchResults(result.data)
          } else {
            setSearchResults([])
            setError("No results found or search failed")
          }
        } else {
          setError("Failed to fetch search results")
          setSearchResults([])
        }
      } catch (err) {
        console.error("Search error:", err)
        setError("Something went wrong while searching")
        setSearchResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [query])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-gray-600">Loading search results...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Search Results for "{query}"</h1>
        <p className="text-gray-600">
          Showing {searchResults.length} results
          {error && <span className="text-red-500 ml-2">({error})</span>}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters filters={filters} onFiltersChange={setFilters} />
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