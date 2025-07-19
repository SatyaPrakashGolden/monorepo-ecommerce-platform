"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
}

export function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Elegant Evening Dress",
      price: 299.99,
      image: "/placeholder.svg?height=200&width=150",
      size: "M",
      color: "Black",
      quantity: 1,
    },
    {
      id: 2,
      name: "Classic Leather Jacket",
      price: 199.99,
      image: "/placeholder.svg?height=200&width=150",
      size: "L",
      color: "Brown",
      quantity: 2,
    },
  ])

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter((item) => item.id !== id))
    } else {
      setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 15.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some items to get started!</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={80}
                height={100}
                className="object-cover rounded"
              />

              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  Size: {item.size} | Color: {item.color}
                </p>
                <p className="font-semibold">${item.price}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 0)}
                  className="w-16 text-center"
                  min="0"
                />
                <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-6 rounded-lg h-fit">
        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-semibold text-lg mb-6">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <Button className="w-full gradient-royal-primary text-white border-0 mb-4">Proceed to Checkout</Button>

        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  )
}
