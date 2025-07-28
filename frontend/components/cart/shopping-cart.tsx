// "use client"

// import { useState } from "react"
// import Image from "next/image"
// import Link from "next/link"
// import { Minus, Plus, Trash2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Separator } from "@/components/ui/separator"

// interface CartItem {
//   id: number
//   name: string
//   price: number
//   image: string
//   size: string
//   color: string
//   quantity: number
// }

// export function ShoppingCart() {
//   const [cartItems, setCartItems] = useState<CartItem[]>([
//     {
//       id: 1,
//       name: "Elegant Evening Dress",
//       price: 299.99,
//       image: "/placeholder.svg?height=200&width=150",
//       size: "M",
//       color: "Black",
//       quantity: 1,
//     },
//     {
//       id: 2,
//       name: "Classic Leather Jacket",
//       price: 199.99,
//       image: "/placeholder.svg?height=200&width=150",
//       size: "L",
//       color: "Brown",
//       quantity: 2,
//     },
//   ])

//   const updateQuantity = (id: number, newQuantity: number) => {
//     if (newQuantity === 0) {
//       setCartItems(cartItems.filter((item) => item.id !== id))
//     } else {
//       setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
//     }
//   }

//   const removeItem = (id: number) => {
//     setCartItems(cartItems.filter((item) => item.id !== id))
//   }

//   const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
//   const shipping = 15.99
//   const tax = subtotal * 0.08
//   const total = subtotal + shipping + tax

//   if (cartItems.length === 0) {
//     return (
//       <div className="text-center py-16">
//         <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
//         <p className="text-gray-600 mb-8">Add some items to get started!</p>
//         <Button asChild>
//           <Link href="/products">Continue Shopping</Link>
//         </Button>
//       </div>
//     )
//   }

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//       {/* Cart Items */}
//       <div className="lg:col-span-2">
//         <div className="space-y-4">
//           {cartItems.map((item) => (
//             <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
//               <Image
//                 src={item.image || "/placeholder.svg"}
//                 alt={item.name}
//                 width={80}
//                 height={100}
//                 className="object-cover rounded"
//               />

//               <div className="flex-1">
//                 <h3 className="font-medium">{item.name}</h3>
//                 <p className="text-sm text-gray-600">
//                   Size: {item.size} | Color: {item.color}
//                 </p>
//                 <p className="font-semibold">${item.price}</p>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
//                   <Minus className="h-4 w-4" />
//                 </Button>
//                 <Input
//                   type="number"
//                   value={item.quantity}
//                   onChange={(e) => updateQuantity(item.id, Number.parseInt(e.target.value) || 0)}
//                   className="w-16 text-center"
//                   min="0"
//                 />
//                 <Button size="icon" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
//                   <Plus className="h-4 w-4" />
//                 </Button>
//               </div>

//               <Button
//                 size="icon"
//                 variant="ghost"
//                 onClick={() => removeItem(item.id)}
//                 className="text-red-500 hover:text-red-700"
//               >
//                 <Trash2 className="h-4 w-4" />
//               </Button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Order Summary */}
//       <div className="bg-gray-50 p-6 rounded-lg h-fit">
//         <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

//         <div className="space-y-2 mb-4">
//           <div className="flex justify-between">
//             <span>Subtotal</span>
//             <span>${subtotal.toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>Shipping</span>
//             <span>${shipping.toFixed(2)}</span>
//           </div>
//           <div className="flex justify-between">
//             <span>Tax</span>
//             <span>${tax.toFixed(2)}</span>
//           </div>
//         </div>

//         <Separator className="my-4" />

//         <div className="flex justify-between font-semibold text-lg mb-6">
//           <span>Total</span>
//           <span>${total.toFixed(2)}</span>
//         </div>

//         <Button className="w-full gradient-royal-primary text-white border-0 mb-4">Proceed to Checkout</Button>

//         <Button variant="outline" className="w-full bg-transparent" asChild>
//           <Link href="/products">Continue Shopping</Link>
//         </Button>
//       </div>
//     </div>
//   )
// }
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth-context";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export function ShoppingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
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

  // Fetch cart items on mount
  useEffect(() => {
    async function fetchCart() {
      if (!auth.accessToken) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching cart with token:", auth.accessToken);
        const response = await fetch("http://localhost:2000/api/cart/get-all", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.accessToken}`,
          },
          body: null,
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
              // Retry cart fetch
              const retryResponse = await fetch("http://localhost:2000/api/cart/get-all", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${refreshResult.data.accessToken}`,
                },
                body: null,
              });
              const retryResult = await retryResponse.json();
              if (retryResponse.ok && retryResult.userId && retryResult.items) {
                const items = retryResult.items.map((item: any) => ({
                  productId: item.productId,
                  name: item.name,
                  price: item.price || 2199,
                  image: item.image || "/placeholder.svg",
                  size: item.size,
                  color: item.color,
                  quantity: item.quantity,
                }));
                setCartItems(items);
              } else {
                throw new Error(retryResult.message || "Failed to fetch cart after token refresh");
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
          console.log("Cart fetch response:", result);
          if (result.userId && result.items) {
            const items = result.items.map((item: any) => ({
              productId: item.productId,
              name: item.name,
              price: item.price || 2199,
              image: item.image || "/placeholder.svg",
              size: item.size,
              color: item.color,
              quantity: item.quantity,
            }));
            setCartItems(items);
          } else {
            throw new Error(result.message || "Failed to fetch cart");
          }
        } else {
          let errorResult;
          try {
            errorResult = await response.json();
          } catch {
            errorResult = {};
            console.error("Failed to parse error response:", await response.text());
          }
          console.error("Cart fetch error:", errorResult, `Status: ${response.status}`);
          throw new Error(errorResult.message || `Failed to fetch cart: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load cart",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [auth.accessToken, auth.refreshToken, setAuth]);

  const updateQuantity = async (productId: string, size: string, color: string, newQuantity: number) => {
    if (!auth.accessToken) {
      toast({
        title: "Error",
        description: "You have not logged in yet. Please log in to update your cart.",
        variant: "destructive",
      });
      return;
    }

    if (newQuantity < 0) return;

    try {
      console.log("Updating cart quantity:", { product: productId, size, color, quantity: newQuantity });
      const response = await fetch("http://localhost:2000/api/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({ product: productId, size, color, quantity: newQuantity }),
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
            // Retry update request
            const retryResponse = await fetch("http://localhost:2000/api/cart/update", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshResult.data.accessToken}`,
              },
              body: JSON.stringify({ product: productId, size, color, quantity: newQuantity }),
            });
            const retryResult = await retryResponse.json();
            if (retryResponse.ok && retryResult.cart) {
              if (newQuantity === 0) {
                setCartItems((items) =>
                  items.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
                );
              } else {
                setCartItems((items) =>
                  items.map((item) =>
                    item.productId === productId && item.size === size && item.color === color
                      ? { ...item, quantity: newQuantity }
                      : item
                  )
                );
              }
              toast({
                title: "Success",
                description: retryResult.message || "Cart updated successfully",
              });
            } else {
              throw new Error(retryResult.message || "Failed to update cart after token refresh");
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
        console.log("Cart update response:", result);
        if (result.cart) {
          if (newQuantity === 0) {
            setCartItems((items) =>
              items.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
            );
          } else {
            setCartItems((items) =>
              items.map((item) =>
                item.productId === productId && item.size === size && item.color === color
                  ? { ...item, quantity: newQuantity }
                  : item
              )
            );
          }
          toast({
            title: "Success",
            description: result.message || "Cart updated successfully",
          });
        } else {
          throw new Error(result.message || "Failed to update cart");
        }
      } else {
        let errorResult;
        try {
          errorResult = await response.json();
        } catch {
          errorResult = {};
          console.error("Failed to parse error response:", await response.text());
        }
        console.error("Cart update error:", errorResult, `Status: ${response.status}`);
        throw new Error(errorResult.message || `Failed to update cart: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      if (newQuantity === 0) {
        setCartItems((items) =>
          items.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
        );
      } else {
        setCartItems((items) =>
          items.map((item) =>
            item.productId === productId && item.size === size && item.color === color
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
      toast({
        title: "Warning",
        description: "Cart updated locally due to API error. Please refresh to sync.",
        variant: "default",
      });
    }
  };

  const removeItem = async (productId: string, size: string, color: string) => {
    if (!auth.accessToken) {
      toast({
        title: "Error",
        description: "You have not logged in yet. Please log in to manage your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Removing from cart:", { product: productId, size, color });
      const response = await fetch(`http://localhost:2000/api/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: JSON.stringify({ product: productId, size, color, quantity: 0 }),
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
            const retryResponse = await fetch(`http://localhost:2000/api/cart/remove/${productId}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${refreshResult.data.accessToken}`,
              },
              body: JSON.stringify({ product: productId, size, color, quantity: 0 }),
            });
            const retryResult = await retryResponse.json();
            if (retryResponse.ok && retryResult.cart) {
              setCartItems((items) =>
                items.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
              );
              toast({
                title: "Success",
                description: retryResult.message || "Item removed from cart",
              });
            } else {
              throw new Error(retryResult.message || "Failed to remove from cart after token refresh");
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
        console.log("Cart remove response:", result);
        if (result.cart) {
          setCartItems((items) =>
            items.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
          );
          toast({
            title: "Success",
            description: result.message || "Item removed from cart",
          });
        } else {
          throw new Error(result.message || "Failed to remove from cart");
        }
      } else {
        let errorResult;
        try {
          errorResult = await response.json();
        } catch {
          errorResult = {};
          console.error("Failed to parse error response:", await response.text());
        }
        console.error("Cart remove error:", errorResult, `Status: ${response.status}`);
        throw new Error(errorResult.message || `Failed to remove from cart: ${response.status}`);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      setCartItems((items) =>
        items.filter((item) => !(item.productId === productId && item.size === size && item.color === color))
      );
      toast({
        title: "Warning",
        description: "Item removed locally due to API error. Please refresh to sync.",
        variant: "default",
      });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 199;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Loading your cart...</h2>
      </div>
    );
  }

  if (!auth.accessToken) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Please log in to view your cart</h2>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some items to get started!</p>
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="flex items-center space-x-4 p-4 border rounded-lg"
            >
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
                <p className="font-semibold">{formatPrice(item.price)}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(item.productId, item.size, item.color, Number.parseInt(e.target.value) || 0)
                  }
                  className="w-16 text-center"
                  min="0"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeItem(item.productId, item.size, item.color)}
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
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatPrice(tax)}</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between font-semibold text-lg mb-6">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <Button className="w-full gradient-royal-primary text-white border-0 mb-4">Proceed to Checkout</Button>

        <Button variant="outline" className="w-full bg-transparent" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}