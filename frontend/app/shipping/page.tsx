import { Truck, Clock, Globe, Shield } from "lucide-react"

export default function ShippingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Shipping Information</h1>

        <div className="space-y-12">
          {/* Shipping Options */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Shipping Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-lg p-6 text-center">
                <div className="gradient-royal-primary p-3 rounded-full w-fit mx-auto mb-4">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Standard Shipping</h3>
                <p className="text-gray-600 mb-2">5-7 business days</p>
                <p className="font-bold">FREE on orders $100+</p>
                <p className="text-sm text-gray-500">Otherwise $9.99</p>
              </div>

              <div className="border rounded-lg p-6 text-center">
                <div className="gradient-royal-blue p-3 rounded-full w-fit mx-auto mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Express Shipping</h3>
                <p className="text-gray-600 mb-2">2-3 business days</p>
                <p className="font-bold">$19.99</p>
              </div>

              <div className="border rounded-lg p-6 text-center">
                <div className="gradient-accent-gold p-3 rounded-full w-fit mx-auto mb-4">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Overnight</h3>
                <p className="text-gray-600 mb-2">Next business day</p>
                <p className="font-bold">$29.99</p>
              </div>
            </div>
          </div>

          {/* International Shipping */}
          <div>
            <h2 className="text-2xl font-bold mb-6">International Shipping</h2>
            <div className="gradient-luxury-mint rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                We ship to over 100 countries worldwide. International shipping rates and delivery times vary by
                destination.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Canada: 7-14 business days, starting at $15</li>
                <li>• Europe: 10-21 business days, starting at $25</li>
                <li>• Asia Pacific: 14-28 business days, starting at $30</li>
                <li>• Rest of World: 21-35 business days, starting at $35</li>
              </ul>
            </div>
          </div>

          {/* Processing Time */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Processing Time</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-purple-600 mt-1" />
                <div>
                  <p className="text-gray-700 mb-2">
                    All orders are processed within 1-2 business days. Orders placed on weekends or holidays will be
                    processed the next business day.
                  </p>
                  <p className="text-gray-700">
                    You will receive a confirmation email with tracking information once your order has shipped.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Restrictions */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Shipping Restrictions</h2>
            <div className="space-y-4">
              <p className="text-gray-700">
                Please note that we cannot ship to P.O. boxes, APO/FPO addresses, or freight forwarders.
              </p>
              <p className="text-gray-700">
                Some items may have shipping restrictions due to size, weight, or international regulations. These
                restrictions will be noted on the product page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
