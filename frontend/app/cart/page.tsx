import { ShoppingCart } from "@/components/cart/shopping-cart"

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart</h1>
      <ShoppingCart />
    </div>
  )
}
