import { RotateCcw, Clock, CheckCircle, AlertCircle } from "lucide-react"

export default function ReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Returns & Exchanges</h1>

        <div className="space-y-12">
          {/* Return Policy Overview */}
          <div className="gradient-luxury-cream rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold">30-Day Return Policy</h2>
            </div>
            <p className="text-gray-700">
              We want you to love your purchase! If you're not completely satisfied, you can return most items within 30
              days of delivery for a full refund or exchange.
            </p>
          </div>

          {/* Return Process */}
          <div>
            <h2 className="text-2xl font-bold mb-6">How to Return an Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="gradient-royal-primary p-4 rounded-full w-fit mx-auto mb-4">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="font-semibold mb-2">Start Return</h3>
                <p className="text-gray-600 text-sm">Log into your account and select the item you want to return</p>
              </div>

              <div className="text-center">
                <div className="gradient-royal-blue p-4 rounded-full w-fit mx-auto mb-4">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="font-semibold mb-2">Print Label</h3>
                <p className="text-gray-600 text-sm">Print the prepaid return shipping label we provide</p>
              </div>

              <div className="text-center">
                <div className="gradient-accent-gold p-4 rounded-full w-fit mx-auto mb-4">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="font-semibold mb-2">Package Item</h3>
                <p className="text-gray-600 text-sm">Pack the item in its original packaging with all tags attached</p>
              </div>

              <div className="text-center">
                <div className="gradient-accent-turquoise p-4 rounded-full w-fit mx-auto mb-4">
                  <span className="text-white font-bold text-xl">4</span>
                </div>
                <h3 className="font-semibold mb-2">Ship Back</h3>
                <p className="text-gray-600 text-sm">Drop off at any UPS location or schedule a pickup</p>
              </div>
            </div>
          </div>

          {/* Return Conditions */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Return Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Returnable Items</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Items in original condition with tags attached</li>
                  <li>• Unworn and unwashed clothing</li>
                  <li>• Items in original packaging</li>
                  <li>• Accessories in like-new condition</li>
                </ul>
              </div>

              <div className="border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold text-red-800">Non-Returnable Items</h3>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li>• Intimate apparel and swimwear</li>
                  <li>• Personalized or customized items</li>
                  <li>• Items damaged by normal wear</li>
                  <li>• Sale items marked "Final Sale"</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Processing Times */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Processing Times</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-purple-600 mt-1" />
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <strong>Refunds:</strong> Processed within 5-7 business days after we receive your return
                  </p>
                  <p className="text-gray-700">
                    <strong>Exchanges:</strong> New item ships within 2-3 business days after we receive your return
                  </p>
                  <p className="text-gray-700">
                    <strong>Store Credit:</strong> Applied to your account within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact for Help */}
          <div className="text-center gradient-royal-primary rounded-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Need Help with Your Return?</h2>
            <p className="mb-6">Our customer service team is here to help make your return process smooth and easy.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="mailto:returns@royalfashion.com"
                className="border border-white px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition-colors"
              >
                Email Returns Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
