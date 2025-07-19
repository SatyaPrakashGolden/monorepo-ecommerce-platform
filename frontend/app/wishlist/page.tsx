import { WishlistGrid } from "@/components/wishlist/wishlist-grid"

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        <WishlistGrid />
      </div>
    </div>
  )
}
