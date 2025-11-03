import { Book, Video, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const resources = [
  {
    category: 'Getting Started',
    icon: Book,
    items: [
      {
        title: 'Vendor Onboarding Guide',
        description: 'Complete guide to setting up your vendor account',
        type: 'PDF',
      },
      {
        title: 'Product Listing Best Practices',
        description: 'Tips for creating effective product listings',
        type: 'Article',
      },
    ],
  },
  {
    category: 'Marketing',
    icon: Video,
    items: [
      {
        title: 'Marketing Your Products',
        description: 'Learn how to effectively promote your products',
        type: 'Video',
      },
      {
        title: 'Social Media Toolkit',
        description: 'Resources for social media marketing',
        type: 'Toolkit',
      },
    ],
  },
  {
    category: 'Business',
    icon: FileText,
    items: [
      {
        title: 'Financial Planning Guide',
        description: 'Plan your finances for business success',
        type: 'Guide',
      },
      {
        title: 'Customer Service Templates',
        description: 'Templates for professional customer communication',
        type: 'Templates',
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Vendor Resources</h1>
            <p className="text-xl text-gray-400">
              Tools, guides, and resources to help you succeed on The Bazaar
            </p>
          </div>

          <div className="space-y-8">
            {resources.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="flex items-center gap-3 mb-4">
                  <category.icon className="h-6 w-6 text-netflix-red" />
                  <h2 className="text-2xl font-semibold text-white">{category.category}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {category.items.map((item, itemIndex) => (
                    <Card
                      key={itemIndex}
                      className="bg-netflix-dark-gray border-netflix-medium-gray p-6 hover:border-netflix-red transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                      <span className="text-xs text-gray-500">{item.type}</span>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-netflix-red to-orange-600 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-4">Need More Help?</h2>
            <p className="text-white/90 mb-6">
              Our support team is ready to assist you with any questions.
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

