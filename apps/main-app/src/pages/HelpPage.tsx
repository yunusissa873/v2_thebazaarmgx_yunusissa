import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@thebazaar/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@thebazaar/ui/accordion';

const helpCategories = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Click on "Register" in the top navigation bar, fill in your details, and verify your email address. You can choose to register as a buyer or a vendor.',
      },
      {
        question: 'How do I search for products?',
        answer:
          'Use the search bar in the navigation to find products by name, category, or vendor. You can also browse by category on the homepage.',
      },
      {
        question: 'How do I place an order?',
        answer:
          'Add products to your cart, review your order, proceed to checkout, enter your shipping details, choose a payment method, and complete your purchase.',
      },
    ],
  },
  {
    title: 'Shopping',
    items: [
      {
        question: 'What payment methods are accepted?',
        answer:
          'We accept Paystack (cards and mobile money), M-Pesa, and Stripe for international payments.',
      },
      {
        question: 'How long does shipping take?',
        answer:
          'Shipping times vary by vendor and location. Standard delivery within Nairobi is 2-3 business days. Delivery to other regions may take 5-7 business days.',
      },
      {
        question: 'Can I return a product?',
        answer:
          'Yes, you can return products within 7 days of delivery if they are unopened and in original condition. See our return policy for details.',
      },
    ],
  },
  {
    title: 'Account & Orders',
    items: [
      {
        question: 'How do I track my order?',
        answer:
          'Once your order is shipped, you\'ll receive a tracking number via email. You can also view order status in your Orders page.',
      },
      {
        question: 'How do I update my profile?',
        answer:
          'Go to your Profile page from the user menu and edit your personal information, shipping address, and preferences.',
      },
      {
        question: 'How do I cancel an order?',
        answer:
          'You can cancel an order from your Orders page if it hasn\'t been shipped yet. Contact support if you need help with a shipped order.',
      },
    ],
  },
  {
    title: 'Vendor Support',
    items: [
      {
        question: 'How do I become a vendor?',
        answer:
          'Click on "Become a Vendor" and complete the registration form. Our team will review your application and guide you through the onboarding process.',
      },
      {
        question: 'How do I manage my products?',
        answer:
          'Access the Vendor Dashboard to add, edit, or remove products. You can also manage inventory, view orders, and track your sales.',
      },
      {
        question: 'What are the vendor fees?',
        answer:
          'We offer multiple subscription tiers starting from Basic (directory only) to Platinum (unlimited products). Visit our Pricing page for details.',
      },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = helpCategories.map((category) => ({
    ...category,
    items: category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.items.length > 0);

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
            <p className="text-xl text-gray-400">
              Find answers to common questions and get the support you need
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-netflix-dark-gray border-netflix-medium-gray pl-10 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-6">
            {filteredCategories.map((category) => (
              <div
                key={category.title}
                className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6"
              >
                <h2 className="text-2xl font-semibold text-white mb-4">{category.title}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.items.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="border-netflix-medium-gray"
                    >
                      <AccordionTrigger className="text-white hover:text-netflix-red">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-400 pt-2">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {filteredCategories.length === 0 && searchQuery && (
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-12 text-center">
              <p className="text-gray-400 mb-4">No results found for "{searchQuery}"</p>
              <p className="text-gray-500 text-sm">
                Try a different search term or contact our support team for assistance.
              </p>
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-12 bg-gradient-to-r from-netflix-red to-orange-600 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Still Need Help?</h2>
            <p className="text-white/90 mb-6">
              Our support team is ready to assist you with any questions or concerns.
            </p>
            <a href="/contact">
              <Button className="bg-white text-netflix-red hover:bg-gray-100">
                Contact Support
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

