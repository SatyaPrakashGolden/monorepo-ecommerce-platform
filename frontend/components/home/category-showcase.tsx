///home/satya/myproject/frontend/components/home/category-showcase.tsx
import Link from "next/link"
import Image from "next/image"

export function CategoryShowcase() {
  const categories = [
    {
      name: "Women",
      href: "/women",
      image: "https://img.freepik.com/free-photo/front-view-woman-looking-camera-mall_23-2148302834.jpg",
      gradient: "gradient-royal-pink",
    },
    {
      name: "Men",
      href: "/men",
      image: "https://img.freepik.com/free-photo/man-portrait_1296-626.jpg",
      gradient: "gradient-royal-blue",
    },
    {
      name: "Kids",
      href: "/kids",
      image: "https://img.freepik.com/free-photo/full-shot-kid-with-sunglasses_23-2149067155.jpg",
      gradient: "gradient-luxury-mint",
    },
    {
      name: "Accessories",
      href: "/accessories",
      image: "https://img.freepik.com/free-photo/model-career-kit-still-life_23-2150229754.jpg",
      gradient: "gradient-accent-gold",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections designed for every style and occasion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative overflow-hidden rounded-lg aspect-[3/4] hover:scale-105 transition-transform duration-300"
            >
              <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
              <div
                className={`absolute inset-0 ${category.gradient} opacity-60 group-hover:opacity-40 transition-opacity`}
              ></div>
              <div className="absolute inset-0 flex items-end p-6">
                <h3 className="text-white text-2xl font-bold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
