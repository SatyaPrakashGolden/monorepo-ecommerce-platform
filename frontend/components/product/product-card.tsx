// "use client";

// import { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Heart, Star, Eye } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { toast } from "@/components/ui/use-toast";
// import { Product } from "../../app/types/product";

// interface ProductCardProps {
//   product: Product;
//   viewMode?: "grid" | "list";
// }

// export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
//   const [isWishlisted, setIsWishlisted] = useState(false);
//   const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

//   const discountPercentage = product.originalPrice
//     ? Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100)
//     : 0;

//   const getStockStatus = () => {
//     if (product.inStock === false) return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
//     if (product.isSale) return { label: "Sale", color: "bg-red-100 text-red-800" };
//     if (product.isNew) return { label: "New", color: "bg-green-100 text-green-800" };
//     return { label: "In Stock", color: "bg-green-100 text-green-800" };
//   };

//   const stockStatus = getStockStatus();

//   // Format price in INR
//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2,
//     }).format(price);
//   };

//   const handleAddToWishlist = async () => {
//     const accessToken = localStorage.getItem("accessToken");
//     if (!accessToken) {
//       toast({
//         title: "Error",
//         description: "Please log in to add items to your wishlist.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsAddingToWishlist(true);
//     try {
//       const response = await fetch("http://localhost:2000/api/user/wishlist", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${accessToken}`,
//         },
//         body: JSON.stringify({ productId: product.id }),
//       });

//       const result = await response.json();
//       if (response.ok && result.success) {
//         setIsWishlisted(true);
//         toast({
//           title: "Success",
//           description: result.message || "Product added to wishlist",
//         });
//       } else {
//         throw new Error(result.message || "Failed to add to wishlist");
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Something went wrong",
//         variant: "destructive",
//       });
//     } finally {
//       setIsAddingToWishlist(false);
//     }
//   };

//   if (viewMode === "list") {
//     return (
//       <div className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-lg transition-shadow duration-300">
//         <div className="relative w-24 h-32 flex-shrink-0 overflow-hidden rounded-lg">
//           <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
//         </div>
//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between">
//             <div className="flex-1">
//               <Link href={`/product/${product.id}`} className="block">
//                 <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors mb-1 truncate">
//                   {product.name}
//                 </h3>
//               </Link>
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
//               <div className="flex items-center gap-2 mb-2">
//                 <span className="text-lg font-bold text-gray-900">{formatPrice(product.discountPrice)}</span>
//                 {product.originalPrice && (
//                   <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
//                 )}
//               </div>
//               <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
//             </div>
//             <div className="flex items-center space-x-2 ml-4">
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={handleAddToWishlist}
//                 disabled={isAddingToWishlist || isWishlisted}
//               >
//                 <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
//               </Button>
//               <Button variant="outline" size="sm" asChild>
//                 <Link href={`/product/${product.id}`}>
//                   <Eye className="h-4 w-4 mr-2" />
//                   View Details
//                 </Link>
//               </Button>
//               <Button
//                 className="gradient-royal-primary text-white border-0"
//                 size="sm"
//                 onClick={handleAddToWishlist}
//                 disabled={isAddingToWishlist || isWishlisted}
//               >
//                 <Heart className="h-4 w-4 mr-2" />
//                 {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
//       <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
//         <Image
//           src={product.image || "/placeholder.svg"}
//           alt={product.name}
//           fill
//           className="object-cover group-hover:scale-105 transition-transform duration-300"
//         />
//         <div className="absolute top-2 left-2 flex flex-col gap-1">
//           <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
//           {product.isSale && discountPercentage > 0 && (
//             <Badge className="gradient-royal-pink text-white border-0">-{discountPercentage}%</Badge>
//           )}
//         </div>
//         <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
//           <Button variant="outline" className="w-full bg-white/90 hover:bg-white" size="sm" asChild>
//             <Link href={`/product/${product.id}`}>
//               <Eye className="h-4 w-4 mr-2" />
//               View Details
//             </Link>
//           </Button>
//           <Button
//             className="w-full gradient-royal-primary text-white border-0"
//             size="sm"
//             onClick={handleAddToWishlist}
//             disabled={isAddingToWishlist || isWishlisted}
//           >
//             <Heart className="h-4 w-4 mr-2" />
//             {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
//           </Button>
//         </div>
//       </div>
//       <div className="p-4">
//         <Link href={`/product/${product.id}`} className="block">
//           <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors mb-2">{product.name}</h3>
//         </Link>
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
//         <div className="flex items-center gap-2">
//           <span className="text-lg font-bold text-gray-900">{formatPrice(product.discountPrice)}</span>
//           {product.originalPrice && (
//             <span className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Product } from "../../app/types/product";
import { useAuth } from "@/lib/auth-context";

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const { auth, setAuth } = useAuth();

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

  // Check if product is already in wishlist on mount
  useEffect(() => {
    async function checkWishlistStatus() {
      if (!auth.accessToken || !product.id) return;

      try {
        const response = await fetch("http://localhost:2000/api/wishlist", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const isProductWishlisted = result.data.products.some(
              (item: { product: string }) => item.product === product.id
            );
            setIsWishlisted(isProductWishlisted);
          }
        } else if (response.status === 401 && auth.refreshToken) {
          // Attempt to refresh token if unauthorized
          try {
            const refreshResponse = await fetch("http://localhost:2000/api/auth/refresh", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refreshToken: auth.refreshToken }),
            });

            const refreshResult = await refreshResponse.json();
            if (refreshResponse.ok && refreshResult.success && refreshResult.data.accessToken) {
              setAuth({
                ...auth,
                accessToken: refreshResult.data.accessToken,
              });
              // Retry wishlist check
              const retryResponse = await fetch("http://localhost:2000/api/wishlist", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${refreshResult.data.accessToken}`,
                },
              });
              const retryResult = await retryResponse.json();
              if (retryResult.success && retryResult.data) {
                const isProductWishlisted = retryResult.data.products.some(
                  (item: { product: string }) => item.product === product.id
                );
                setIsWishlisted(isProductWishlisted);
              }
            }
          } catch (refreshError) {
            console.error("Failed to refresh token for wishlist check:", refreshError);
          }
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    }

    checkWishlistStatus();
  }, [auth.accessToken, auth.refreshToken, product.id, setAuth]);

  const handleAddToWishlist = async () => {
    if (!auth.accessToken) {
      toast({
        title: "Error",
        description: "You have not logged in yet. Please log in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    if (!product.id) {
      toast({
        title: "Error",
        description: "Invalid product ID. Unable to add to wishlist.",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToWishlist(true);
    try {
      console.log("Adding to wishlist:", { productId: product.id, accessToken: auth.accessToken });
      const response = await fetch("http://localhost:2000/api/wishlist/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({ productId: product.id }),
      });

      console.log("Wishlist API response status:", response.status);

      if (response.status === 401 && auth.refreshToken) {
        console.log("Attempting to refresh token...");
        // Attempt to refresh the access token
        try {
          const refreshResponse = await fetch("http://localhost:2000/api/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken: auth.refreshToken }),
          });

          const refreshResult = await refreshResponse.json();
          console.log("Refresh token response:", refreshResult);

          if (refreshResponse.ok && refreshResult.success && refreshResult.data.accessToken) {
            // Update auth context with new access token
            setAuth({
              ...auth,
              accessToken: refreshResult.data.accessToken,
            });

            // Retry the wishlist request with the new access token
            console.log("Retrying wishlist request with new token...");
            const retryResponse = await fetch("http://localhost:2000/api/wishlist/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshResult.data.accessToken}`,
              },
              body: JSON.stringify({ productId: product.id }),
            });

            const retryResult = await retryResponse.json();
            console.log("Retry wishlist response:", retryResult);

            if (retryResponse.ok && retryResult.success) {
              setIsWishlisted(true);
              toast({
                title: "Success",
                description: retryResult.message || "Product added to wishlist",
              });
            } else {
              throw new Error(retryResult.message || "Failed to add to wishlist after token refresh");
            }
          } else {
            throw new Error(refreshResult.message || "Failed to refresh token");
          }
        } catch (refreshError) {
          console.error("Token refresh error:", refreshError);
          toast({
            title: "Error",
            description: "Session expired. Please log in again.",
            variant: "destructive",
          });
          setAuth({ accessToken: null, refreshToken: null, user: null });
        }
      } else if (response.ok) {
        const result = await response.json();
        console.log("Wishlist API success response:", result);
        if (result.success) {
          setIsWishlisted(true);
          toast({
            title: "Success",
            description: result.message || "Product added to wishlist",
          });
        } else {
          throw new Error(result.message || "Failed to add to wishlist");
        }
      } else {
        const errorResult = await response.json();
        console.error("Wishlist API error response:", errorResult);
        throw new Error(errorResult.message || `Failed to add to wishlist: ${response.status}`);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsAddingToWishlist(false);
    }
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
              <Button
                size="icon"
                variant="ghost"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist || isWishlisted}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/product/${product.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </Button>
              <Button
                className="gradient-royal-primary text-white border-0"
                size="sm"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist || isWishlisted}
              >
                <Heart className="h-4 w-4 mr-2" />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
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
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
          <Button variant="outline" className="w-full bg-white/90 hover:bg-white" size="sm" asChild>
            <Link href={`/product/${product.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button
            className="w-full gradient-royal-primary text-white border-0"
            size="sm"
            onClick={handleAddToWishlist}
            disabled={isAddingToWishlist || isWishlisted}
          >
            <Heart className="h-4 w-4 mr-2" />
            {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
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