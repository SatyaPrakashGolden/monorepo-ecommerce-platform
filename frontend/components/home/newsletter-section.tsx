import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSection() {
  return (
    <section className="py-16 gradient-luxury-mint">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Stay in Style</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter and be the first to know about new collections, exclusive offers, and fashion
            tips.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input type="email" placeholder="Enter your email address" className="flex-1" />
            <Button className="gradient-royal-primary text-white border-0">Subscribe</Button>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            By subscribing, you agree to our Privacy Policy and Terms of Service.
          </p>
        </div>
      </div>
    </section>
  )
}
