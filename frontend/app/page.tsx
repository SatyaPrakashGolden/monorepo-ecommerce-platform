import { HeroSection } from "@/components/home/hero-section"
import { FeaturedProducts } from "@/components/home/featured-products"
import { CategoryShowcase } from "@/components/home/category-showcase"
import { NewsletterSection } from "@/components/home/newsletter-section"

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <NewsletterSection />
    </div>
  )
}
