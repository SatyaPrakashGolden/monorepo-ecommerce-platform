export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">About Royal Fashion</h1>

        <div className="gradient-luxury-mint rounded-lg p-8 mb-12">
          <p className="text-lg text-center text-gray-700">
            Royal Fashion is your premier destination for luxury clothing and accessories. We curate the finest
            collections to help you express your unique style with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-600 mb-4">
              To provide exceptional fashion experiences through carefully curated collections, outstanding customer
              service, and a commitment to quality that exceeds expectations.
            </p>
            <p className="text-gray-600">
              We believe that fashion is a form of self-expression, and everyone deserves to feel confident and
              beautiful in what they wear.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Our Values</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span>Quality craftsmanship in every piece</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span>Sustainable and ethical fashion practices</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span>Inclusive sizing and diverse representation</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <span>Exceptional customer experience</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Fashion Journey</h2>
          <p className="text-gray-600 mb-6">
            Discover the latest trends, exclusive collections, and styling tips by following us on social media.
          </p>
        </div>
      </div>
    </div>
  )
}
