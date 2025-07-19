import { ProductGrid } from "@/components/product/product-grid"
import { ProductFilters } from "@/components/product/product-filters"
import { ProductSort } from "@/components/product/product-sort"

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">All Products</h1>
              <p className="text-gray-600">Showing 1-24 of 156 results</p>
            </div>
            <ProductSort />
          </div>

          <ProductGrid />
        </main>
      </div>
    </div>
  )
}
