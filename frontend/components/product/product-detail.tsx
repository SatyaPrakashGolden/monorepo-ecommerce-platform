"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, ShoppingBag, Star, Truck, Shield, RotateCcw, Share2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductReviews } from "./product-reviews"

interface ProductDetailProps {
  productId: string
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Mock product data - in real app, this would come from API
  const product = {
    id: productId,
    name: "Elegant Evening Dress",
    discountPrice: 299.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviews: 124,
    inStock: true,
    stockCount: 8,
    brand: "Luxury L  ine",
    sku: "LED-001",
    images: [
      "/placeholder.svg?height=600&width=500",
      "/placeholder.svg?height=600&width=500",
      "/placeholder.svg?height=600&width=500",
      "/placeholder.svg?height=600&width=500",
    ],
    sizes: [
      { name: "XS", inStock: true },
      { name: "S", inStock: true },
      { name: "M", inStock: true },
      { name: "L", inStock: false },
      { name: "XL", inStock: true },
    ],
    colors: [
      { name: "Black", value: "#000000", inStock: true },
      { name: "Navy", value: "#1e3a8a", inStock: true },
      { name: "Burgundy", value: "#7c2d12", inStock: false },
    ],
    description:
      "This elegant evening dress is perfect for special occasions. Made from premium materials with attention to detail, it features a flattering silhouette that enhances your natural beauty. The dress is designed with comfort in mind while maintaining a sophisticated look.",
    features: [
      "Premium fabric blend (70% Silk, 30% Cotton)",
      "Professional tailoring with attention to detail",
      "Comfortable fit with stretch panels",
      "Hidden zipper closure",
      "Fully lined interior",
      "Dry clean only",
    ],
    specifications: {
      Material: "70% Silk, 30% Cotton",
      Fit: "Regular",
      Length: "Midi",
      "Sleeve Type": "Sleeveless",
      Neckline: "V-Neck",
      Closure: "Hidden Zipper",
    },
    careInstructions: [
      "Dry clean only",
      "Do not bleach",
      "Iron on low heat if needed",
      "Store on padded hangers",
      "Avoid direct sunlight when storing",
    ],
  }

  const discountPercentage = Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)

  const getStockStatus = () => {
    if (product.stockCount === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" }
    if (product.stockCount <= 5)
      return { label: `Only ${product.stockCount} left`, color: "bg-orange-100 text-orange-800" }
    return { label: "In Stock", color: "bg-green-100 text-green-800" }
  }

  const stockStatus = getStockStatus()

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= product.stockCount) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="aspect-[4/5] overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={product.images[selectedImage] || "/placeholder.svg"}
            alt={product.name}
            width={500}
            height={600}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Thumbnail Images */}
        <div className="grid grid-cols-4 gap-2">
          {product.images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`aspect-square overflow-hidden rounded-lg border-2 ${
                selectedImage === index ? "border-purple-500" : "border-gray-200"
              }`}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`${product.name} ${index + 1}`}
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
            <Badge className="gradient-royal-pink text-white border-0">-{discountPercentage}%</Badge>
          </div>

          <p className="text-sm text-gray-600 mb-1">{product.brand}</p>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">${product.discountPrice}</span>
            <span className="text-xl text-gray-500 line-through">${product.originalPrice}</span>
            <Badge className="gradient-accent-gold text-white border-0">
              Save ${(product.originalPrice - product.discountPrice).toFixed(2)}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Product Options */}
        <div className="space-y-4">
          {/* Size Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Size</label>
            <div className="grid grid-cols-5 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size.name}
                  onClick={() => size.inStock && setSelectedSize(size.name)}
                  disabled={!size.inStock}
                  className={`p-2 border rounded-md text-sm font-medium transition-colors ${
                    selectedSize === size.name
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : size.inStock
                        ? "border-gray-300 hover:border-purple-300"
                        : "border-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Color</label>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => color.inStock && setSelectedColor(color.name)}
                  disabled={!color.inStock}
                  className={`relative w-10 h-10 rounded-full border-2 ${
                    selectedColor === color.name ? "border-purple-500" : "border-gray-300"
                  } ${!color.inStock ? "opacity-50 cursor-not-allowed" : ""}`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {!color.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-0.5 bg-red-500 rotate-45"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {selectedColor && <p className="text-sm text-gray-600 mt-1">Selected: {selectedColor}</p>}
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 text-center min-w-[3rem]">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stockCount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-gray-600">{product.stockCount} available</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full gradient-royal-primary text-white border-0"
            size="lg"
            disabled={!selectedSize || !selectedColor || !product.inStock}
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Add to Cart - ${(product.discountPrice * quantity).toFixed(2)}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={isWishlisted ? "text-red-500 border-red-500" : ""}
            >
              <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? "fill-current" : ""}`} />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
          <div className="flex items-center gap-2 text-sm">
            <Truck className="h-4 w-4 text-green-600" />
            <span>Free Shipping</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <RotateCcw className="h-4 w-4 text-purple-600" />
            <span>30-Day Returns</span>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="specifications">Specs</TabsTrigger>
            <TabsTrigger value="care">Care</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-4">
            <p className="text-gray-600">{product.description}</p>
          </TabsContent>

          <TabsContent value="features" className="mt-4">
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="specifications" className="mt-4">
            <div className="space-y-3">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="care" className="mt-4">
            <ul className="space-y-2">
              {product.careInstructions.map((instruction, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{instruction}</span>
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <ProductReviews />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
