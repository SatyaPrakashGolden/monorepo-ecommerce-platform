// "use client"

// import { useState } from "react"
// import Image from "next/image"
// import Link from "next/link"
// import { Heart, ShoppingBag, X } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"

// interface WishlistItem {
//   id: number
//   name: string
//   price: number
//   originalPrice?: number
//   image: string
//   inStock: boolean
// }

// export function WishlistGrid() {
//   const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
//     {
//       id: 1,
//       name: "Elegant Evening Dress",
//       price: 299.99,
//       originalPrice: 399.99,
//       image: "/placeholder.svg?height=400&width=300",
//       inStock: true,
//     },
//     {
//       id: 2,
//       name: "Designer Handbag",
//       price: 149.99,
//       image: "/placeholder.svg?height=400&width=300",
//       inStock: false,
//     },
//     {
//       id: 3,
//       name: "Casual Summer Dress",
//       price: 79.99,
//       image: "/placeholder.svg?height=400&width=300",
//       inStock: true,
//     },
//   ])

//   const removeFromWishlist = (id: number) => {
//     setWishlistItems((items) => items.filter((item) => item.id !== id))
//   }

//   const addToCart = (id: number) => {
//     // Handle add to cart logic
//     console.log("Adding to cart:", id)
//   }

//   if (wishlistItems.length === 0) {
//     return (
//       <div className="text-center py-16">
//         <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//         <h2 className="text-xl font-semibold mb-4">Your wishlist is empty</h2>
//         <p className="text-gray-600 mb-8">Save items you love to your wishlist</p>
//         <Button asChild>
//           <Link href="/products">Continue Shopping</Link>
//         </Button>
//       </div>
//     )
//   }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <p className="text-gray-600">{wishlistItems.length} items in your wishlist</p>
//         <Button variant="outline" onClick={() => setWishlistItems([])}>
//           Clear All
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//         {wishlistItems.map((item) => (
//           <Card key={item.id} className="group relative">
//             <CardContent className="p-0">
//               {/* Remove Button */}
//               <Button
//                 size="icon"
//                 variant="ghost"
//                 className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
//                 onClick={() => removeFromWishlist(item.id)}
//               >
//                 <X className="h-4 w-4" />
//               </Button>

//               {/* Product Image */}
//               <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
//                 <Image
//                   src={item.image || "/placeholder.svg"}
//                   alt={item.name}
//                   fill
//                   className="object-cover group-hover:scale-105 transition-transform duration-300"
//                 />
//                 {!item.inStock && (
//                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                     <span className="text-white font-medium">Out of Stock</span>
//                   </div>
//                 )}
//               </div>

//               {/* Product Info */}
//               <div className="p-4">
//                 <Link href={`/product/${item.id}`} className="block">
//                   <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors mb-2">
//                     {item.name}
//                   </h3>
//                 </Link>

//                 <div className="flex items-center gap-2 mb-4">
//                   <span className="text-lg font-bold text-gray-900">${item.price}</span>
//                   {item.originalPrice && (
//                     <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
//                   )}
//                 </div>

//                 <Button
//                   className="w-full gradient-royal-primary text-white border-0"
//                   disabled={!item.inStock}
//                   onClick={() => addToCart(item.id)}
//                 >
//                   <ShoppingBag className="h-4 w-4 mr-2" />
//                   {item.inStock ? "Add to Cart" : "Out of Stock"}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     </div>
//   )
// }




"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";

interface WishlistItem {
  id: string; // Changed to string to match MongoDB ObjectId
  name: string;
  price: number; // Maps to discountPrice
  originalPrice?: number;
  image: string;
  inStock: boolean;
}

export function WishlistGrid() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth, setAuth } = useAuth();

  // Format price in INR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Fetch wishlist on mount
  useEffect(() => {
    async function fetchWishlist() {
      if (!auth.accessToken) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching wishlist with token:", auth.accessToken);
        const response = await fetch("http://localhost:2000/api/wishlist/get", {
          method: "POST", // Note: Using POST as per cURL, though GET is typical
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: JSON.stringify({}),
        });

        if (response.status === 401 && auth.refreshToken) {
          try {
            console.log("Attempting to refresh token...");
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
              setAuth({
                ...auth,
                accessToken: refreshResult.data.accessToken,
              });
              // Retry wishlist fetch
              const retryResponse = await fetch("http://localhost:2000/api/wishlist/get", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${refreshResult.data.accessToken}`,
                },
                body: JSON.stringify({}),
              });
              const retryResult = await retryResponse.json();
              if (retryResponse.ok && retryResult.products) {
                const items = retryResult.products.map((item: any) => ({
                  id: item.product._id,
                  name: item.product.name,
                  price: item.product.originalPrice || 0, // Use originalPrice as discountPrice not provided
                  originalPrice: item.product.originalPrice,
                  image: item.product.images[0] || "/placeholder.svg",
                  inStock: item.product.inStock,
                }));
                setWishlistItems(items);
              } else {
                throw new Error(retryResult.message || "Failed to fetch wishlist after token refresh");
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
          console.log("Wishlist fetch response:", result);
          if (result.products) {
            const items = result.products.map((item: any) => ({
              id: item.product._id,
              name: item.product.name,
              price: item.product.originalPrice || 0,
              originalPrice: item.product.originalPrice,
              image: item.product.images[0] || "/placeholder.svg",
              inStock: item.product.inStock,
            }));
            setWishlistItems(items);
          } else {
            throw new Error(result.message || "Failed to fetch wishlist");
          }
        } else {
          const errorResult = await response.json();
          console.error("Wishlist fetch error:", errorResult);
          throw new Error(errorResult.message || `Failed to fetch wishlist: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load wishlist",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, [auth.accessToken, auth.refreshToken, setAuth]);

  const removeFromWishlist = async (id: string) => {
    if (!auth.accessToken) {
      toast({
        title: "Error",
        description: "You have not logged in yet. Please log in to manage your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Removing from wishlist:", { productId: id });
      const response = await fetch("http://localhost:2000/api/wishlist/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({ productId: id }),
      });

      if (response.status === 401 && auth.refreshToken) {
        try {
          console.log("Attempting to refresh token...");
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
            setAuth({
              ...auth,
              accessToken: refreshResult.data.accessToken,
            });
            // Retry remove request
            const retryResponse = await fetch("http://localhost:2000/api/wishlist/remove", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshResult.data.accessToken}`,
              },
              body: JSON.stringify({ productId: id }),
            });
            const retryResult = await retryResponse.json();
            if (retryResponse.ok && retryResult.success) {
              setWishlistItems((items) => items.filter((item) => item.id !== id));
              toast({
                title: "Success",
                description: retryResult.message || "Product removed from wishlist",
              });
            } else {
              throw new Error(retryResult.message || "Failed to remove from wishlist after token refresh");
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
        console.log("Remove wishlist response:", result);
        if (result.success) {
          setWishlistItems((items) => items.filter((item) => item.id !== id));
          toast({
            title: "Success",
            description: result.message || "Product removed from wishlist",
          });
        } else {
          throw new Error(result.message || "Failed to remove from wishlist");
        }
      } else {
        const errorResult = await response.json();
        console.error("Remove wishlist error:", errorResult);
        throw new Error(errorResult.message || `Failed to remove from wishlist: ${response.status}`);
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove from wishlist",
        variant: "destructive",
      });
    }
  };

  const clearWishlist = async () => {
    if (!auth.accessToken) {
      toast({
        title: "Error",
        description: "You have not logged in yet. Please log in to manage your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Clearing wishlist with token:", auth.accessToken);
      const response = await fetch("http://localhost:2000/api/wishlist/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({ productId: "" }), // Empty productId as per cURL
      });

      if (response.status === 401 && auth.refreshToken) {
        try {
          console.log("Attempting to refresh token...");
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
            setAuth({
              ...auth,
              accessToken: refreshResult.data.accessToken,
            });
            // Retry clear request
            const retryResponse = await fetch("http://localhost:2000/api/wishlist/clear", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshResult.data.accessToken}`,
              },
              body: JSON.stringify({ productId: "" }),
            });
            const retryResult = await retryResponse.json();
            if (retryResponse.ok && retryResult.success) {
              setWishlistItems([]);
              toast({
                title: "Success",
                description: retryResult.message || "Wishlist cleared successfully",
              });
            } else {
              throw new Error(retryResult.message || "Failed to clear wishlist after token refresh");
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
        console.log("Clear wishlist response:", result);
        if (result.success) {
          setWishlistItems([]);
          toast({
            title: "Success",
            description: result.message || "Wishlist cleared successfully",
          });
        } else {
          throw new Error(result.message || "Failed to clear wishlist");
        }
      } else {
        const errorResult = await response.json();
        console.error("Clear wishlist error:", errorResult);
        throw new Error(errorResult.message || `Failed to clear wishlist: ${response.status}`);
      }
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to clear wishlist",
        variant: "destructive",
      });
    }
  };

  const addToCart = (id: string) => {
    console.log("Adding to cart:", id);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-4">Loading your wishlist...</h2>
      </div>
    );
  }

  if (!auth.accessToken) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-4">Please log in to view your wishlist</h2>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-4">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-8">Save items you love to your wishlist</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">{wishlistItems.length} items in your wishlist</p>
        <Button variant="outline" onClick={clearWishlist}>
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <Card key={item.id} className="group relative">
            <CardContent className="p-0">
              {/* Remove Button */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                onClick={() => removeFromWishlist(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Product Image */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <Link href={`/product/${item.id}`} className="block">
                  <h3 className="font-medium text-gray-900 hover:text-purple-600 transition-colors mb-2">
                    {item.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">{formatPrice(item.originalPrice)}</span>
                  )}
                </div>

                <Button
                  className="w-full gradient-royal-primary text-white border-0"
                  disabled={!item.inStock}
                  onClick={() => addToCart(item.id)}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {item.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}