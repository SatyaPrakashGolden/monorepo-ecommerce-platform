import { Search, MessageCircle, Phone, Mail } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I track my order?",
      answer:
        "You can track your order by logging into your account and viewing your order history, or by using the tracking number sent to your email.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for most items. Items must be in original condition with tags attached. See our Returns page for full details.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping takes 5-7 business days, Express shipping takes 2-3 business days, and Overnight shipping delivers the next business day.",
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship to over 100 countries worldwide. Shipping rates and delivery times vary by destination.",
    },
    {
      question: "How do I find my size?",
      answer:
        "Please refer to our Size Guide page which includes detailed measurements for all our clothing categories.",
    },
    {
      question: "Can I change or cancel my order?",
      answer:
        "Orders can be modified or cancelled within 1 hour of placement. After that, please contact customer service for assistance.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Help Center</h1>

        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input placeholder="Search for help articles..." className="pl-10 pr-4 py-3 text-lg" />
          </div>
        </div>

        {/* Quick Help Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="gradient-royal-primary p-4 rounded-full w-fit mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">Chat with our support team</p>
            <Button className="gradient-royal-primary text-white border-0">Start Chat</Button>
          </div>

          <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="gradient-royal-blue p-4 rounded-full w-fit mx-auto mb-4">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Call Us</h3>
            <p className="text-gray-600 mb-4">Speak with a representative</p>
            <Button variant="outline">+1 (555) 123-4567</Button>
          </div>

          <div className="text-center p-6 border rounded-lg hover:shadow-lg transition-shadow">
            <div className="gradient-accent-gold p-4 rounded-full w-fit mx-auto mb-4">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Send us a message</p>
            <Button variant="outline">support@royalfashion.com</Button>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Still Need Help */}
        <div className="mt-12 text-center gradient-luxury-mint rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-gray-700 mb-6">
            Can't find what you're looking for? Our customer service team is here to help.
          </p>
          <Button className="gradient-royal-primary text-white border-0" asChild>
            <a href="/contact">Contact Us</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
