// "use client"

// import { useState } from "react"
// import Image from "next/image"
// import Link from "next/link"
// import { Heart, ShoppingBag, Star, Eye } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"

// interface Product {
//  id: number | string; 
//   name: string
//   discountPrice: number
//   originalPrice?: number
//   image: string
//   rating: number
//   reviews: number
//   isNew: boolean
//   isSale: boolean
//   inStock?: boolean
//   stockCount?: number
// }

// interface ProductCardProps {
//   product: Product
//   viewMode?: "grid" | "list"
// }

// export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
//   const [isWishlisted, setIsWishlisted] = useState(false)

//   const discountPercentage = product.originalPrice
//     ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
//     : 0

//   const getStockStatus = () => {
//     if (product.inStock === false) return { label: "Out of Stock", color: "bg-red-100 text-red-800" }
//     if (product.isSale) return { label: "Sale", color: "bg-red-100 text-red-800" }
//     if (product.isNew) return { label: "New", color: "bg-green-100 text-green-800" }
//     return { label: "In Stock", color: "bg-green-100 text-green-800" }
//   }

//   const stockStatus = getStockStatus()

//   if (viewMode === "list") {
//     return (
//       <div className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-lg transition-shadow duration-300">
//         {/* Product Image */}
//         <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden rounded-lg">
//           <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
//         </div>

//         {/* Product Info */}
//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <Link href={`/product/${product.id}`} className="block">
//                 <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors mb-1 truncate">
//                   {product.name}
//                 </h3>
//               </Link>

//               {/* Rating */}
//               <div className="flex items-center gap-1 mb-2">
//                 <div className="flex">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       className={`h-3 w-3 ${
//                         i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
//                       }`}
//                     />
//                   ))}
//                 </div>
//                 <span className="text-xs text-gray-500">({product.reviews})</span>
//               </div>

//               {/* Price */}
//               <div className="flex items-center gap-2 mb-2">
//                 <span className="text-lg font-bold text-gray-900">${product.discountPrice}</span>
//                 {product.originalPrice && (
//                   <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
//                 )}
//               </div>

//               {/* Status */}
//               <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
//             </div>

//             {/* Actions */}
//             <div className="flex items-center space-x-2 ml-4">
//               <Button size="icon" variant="ghost" onClick={() => setIsWishlisted(!isWishlisted)}>
//                 <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
//               </Button>

//               <Button variant="outline" size="sm" asChild>
//                 <Link href={`/product/${product.id}`}>
//                   <Eye className="h-4 w-4 mr-2" />
//                   View Details
//                 </Link>
//               </Button>

//               <Button className="gradient-royal-primary text-white border-0" size="sm" disabled={!product.inStock}>
//                 <ShoppingBag className="h-4 w-4 mr-2" />
//                 Add to Cart
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Grid view (default)
//   return (
//     <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
//       {/* Product Image */}
//       <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
//         <Image
//           src={product.image || "/placeholder.svg"}
//           alt={product.name}
//           fill
//           className="object-cover group-hover:scale-105 transition-transform duration-300"
//         />

//         {/* Badges */}
//         <div className="absolute top-2 left-2 flex flex-col gap-1">
//           <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
//           {product.isSale && discountPercentage > 0 && (
//             <Badge className="gradient-royal-pink text-white border-0">-{discountPercentage}%</Badge>
//           )}
//         </div>

//         {/* Wishlist Button */}
//         <Button
//           size="icon"
//           variant="ghost"
//           className="absolute top-2 right-2 bg-white/80 hover:bg-white"
//           onClick={() => setIsWishlisted(!isWishlisted)}
//         >
//           <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
//         </Button>

//         {/* Quick Actions */}
//         <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
//           <Button variant="outline" className="w-full bg-white/90 hover:bg-white" size="sm" asChild>
//             <Link href={`/product/${product.id}`}>
//               <Eye className="h-4 w-4 mr-2" />
//               View Details
//             </Link>
//           </Button>
//           <Button className="w-full gradient-royal-primary text-white border-0" size="sm" disabled={!product.inStock}>
//             <ShoppingBag className="h-4 w-4 mr-2" />
//             {product.inStock ? "Add to Cart" : "Out of Stock"}
//           </Button>
//         </div>
//       </div>

//       {/* Product Info */}
//       <div className="p-4">
//         <Link href={`/product/${product.id}`} className="block">
//           <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors mb-2">{product.name}</h3>
//         </Link>

//         {/* Rating */}
//         <div className="flex items-center gap-1 mb-2">
//           <div className="flex">
//             {[...Array(5)].map((_, i) => (
//               <Star
//                 key={i}
//                 className={`h-3 w-3 ${
//                   i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
//                 }`}
//               />
//             ))}
//           </div>
//           <span className="text-xs text-gray-500">({product.reviews})</span>
//         </div>

//         {/* Price */}
//         <div className="flex items-center gap-2">
//           <span className="text-lg font-bold text-gray-900">${product.discountPrice}</span>
//           {product.originalPrice && (
//             <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "../../app/types/product";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
    : 0;

  const getStockStatus = () => {
    if (product.inStock === false) return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (product.isSale) return { label: "Sale", color: "bg-red-100 text-red-800" };
    if (product.isNew) return { label: "New", color: "bg-green-100 text-green-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  const stockStatus = getStockStatus();

  // Format price in INR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (viewMode === "list") {
    return (
      <div className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-lg transition-shadow duration-300">
        <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden rounded-lg">
          <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Link href={`/product/${product.id}`} className="block">
                <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors mb-1 truncate">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({product.reviews})</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-gray-900">{formatPrice(product.discountPrice)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                )}
              </div>
              <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button size="icon" variant="ghost" onClick={() => setIsWishlisted(!isWishlisted)}>
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/product/${product.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
              <Button className="gradient-royal-primary text-white border-0" size="sm" disabled={!product.inStock}>
                <ShoppingBag className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
          {product.isSale && discountPercentage > 0 && (
            <Badge className="gradient-royal-pink text-white border-0">-{discountPercentage}%</Badge>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={() => setIsWishlisted(!isWishlisted)}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
        </Button>
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
          <Button variant="outline" className="w-full bg-white/90 hover:bg-white" size="sm" asChild>
            <Link href={`/product/${product.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button className="w-full gradient-royal-primary text-white border-0" size="sm" disabled={!product.inStock}>
            <ShoppingBag className="h-4 w-4 mr-2" />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </div>
      <div className="p-4">
        <Link href={`/product/${product.id}`} className="block">
          <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors mb-2">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.discountPrice)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}