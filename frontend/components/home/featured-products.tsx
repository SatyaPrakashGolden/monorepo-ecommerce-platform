// import { ProductCard } from "@/components/product/product-card"

// export function FeaturedProducts() {
//   const featuredProducts = [
//     {
//       id: 1,
//       name: "Elegant Evening Dress",
//       discountPrice: 299.99,
//       originalPrice: 399.99,
//       image: "https://dukaan.b-cdn.net/700x700/webp/media/830c29b2-1280-42f3-b4c6-2b12965baf19.jpg?height=400&width=300",
//       rating: 4.8,
//       reviews: 124,
//       isNew: true,
//       isSale: true,
//     },
//     {
//       id: 2,
//       name: "Classic Leather Jacket",
//       discountPrice: 199.99,
//       image: "https://m.media-amazon.com/images/I/71C5WpF7b+L._SY879_.jpg?height=400&width=300",
//       rating: 4.6,
//       reviews: 89,
//       isNew: false,
//       isSale: false,
//     },
//     {
//       id: 3,
//       name: "Designer clothes",
//       discountPrice: 149.99,
//       originalPrice: 199.99,
//       image: "https://bougainvillealife.in/cdn/shop/files/1_5b790d4e-b8c8-4d54-838e-0dae78700c6c.jpg?v=1742578598&width=1100?height=400&width=300",
//       rating: 4.9,
//       reviews: 156,
//       isNew: false,
//       isSale: true,
//     },
//     {
//       id: 4,
//       name: "jeanse",
//       discountPrice: 79.99,
//       image: "https://assets.sheinindia.in/medias/shein_sys_master/root/20250318/Tjqv/67d8f93d2960820c49f6c8e7/-473Wx593H-443322175-ltblue-MODEL.jpg?height=400&width=300",
//       rating: 4.7,
//       reviews: 203,
//       isNew: true,
//       isSale: false,
//     },
//   ]

//   return (
//     <section className="py-16">
//       <div className="container mx-auto px-4">
//         <div className="text-center mb-12">
//           <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
//           <p className="text-gray-600 max-w-2xl mx-auto">Discover our handpicked selection of trending items</p>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           {featuredProducts.map((product) => (
//             <ProductCard key={product.id} product={product} />
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/product/product-card";
import { Product } from "../../app/types/product";

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("http://localhost:2000/api/product/product-featured");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        if (data.success) {
          // Add default inStock: true to each product if not provided
          const productsWithStock = data.data.map((product: Product) => ({
            ...product,
            inStock: product.inStock !== undefined ? product.inStock : true,
          }));
          setProducts(productsWithStock);
        } else {
          throw new Error(data.message || "Failed to fetch products");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our handpicked selection of trending items</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg animate-pulse h-96"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-red-600">Error: {error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover our handpicked selection of trending items</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}