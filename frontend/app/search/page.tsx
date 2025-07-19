import { SearchResults } from "@/components/search/search-results"
import { Suspense } from "react"

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading search results...</div>}>
        <SearchResults />
      </Suspense>
    </div>
  )
}
