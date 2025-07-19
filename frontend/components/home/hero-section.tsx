import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 gradient-royal-primary opacity-90"></div>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://cdn.pixabay.com/photo/2017/06/21/20/51/tshirt-2428521_1280.jpg')",
        }}
      ></div>

      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">Royal Fashion</h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">Discover luxury fashion that defines your style</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100" asChild>
            <Link href="/women">Shop Women</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-purple-600 bg-transparent"
            asChild
          >
            <Link href="/men">Shop Men</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
