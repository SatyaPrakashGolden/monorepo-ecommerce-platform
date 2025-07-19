export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: January 1, 2024</p>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2>
            <p>
              By accessing and using Royal Fashion's website and services, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily download one copy of Royal Fashion's materials for personal,
              non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under
              this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for commercial purposes</li>
              <li>Attempt to reverse engineer any software</li>
              <li>Remove any copyright or proprietary notations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Product Information</h2>
            <p>
              We strive to provide accurate product information, but we do not warrant that product descriptions,
              pricing, or other content is accurate, complete, reliable, current, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Orders and Payment</h2>
            <p className="mb-4">
              By placing an order, you agree to provide accurate and complete information. We reserve the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refuse or cancel orders</li>
              <li>Limit order quantities</li>
              <li>Verify information before processing</li>
              <li>Modify or discontinue products</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Returns and Refunds</h2>
            <p>
              Our return policy is detailed on our Returns page. By making a purchase, you agree to our return and
              refund terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
            <p>
              Royal Fashion shall not be liable for any damages arising from the use or inability to use our products or
              services, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
            <p>
              These terms are governed by the laws of the State of New York, and you agree to submit to the jurisdiction
              of the courts in New York.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <p>
              Questions about these Terms of Service should be sent to us at legal@royalfashion.com or +1 (555)
              123-4567.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
