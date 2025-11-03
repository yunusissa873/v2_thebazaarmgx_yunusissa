import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const blogPosts = [
  {
    title: '5 Tips for New Vendors on The Bazaar',
    excerpt:
      'Learn how to maximize your success as a new vendor on our marketplace platform.',
    date: '2024-11-15',
    category: 'Vendor Tips',
  },
  {
    title: 'How to Shop Safely Online',
    excerpt:
      'Essential tips for buyers to ensure safe and secure shopping experiences on The Bazaar.',
    date: '2024-11-10',
    category: 'Shopping Guide',
  },
  {
    title: 'Supporting Local Businesses in Kenya',
    excerpt:
      'Discover how The Bazaar is helping local businesses grow and reach more customers.',
    date: '2024-11-05',
    category: 'Company News',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Blog</h1>
            <p className="text-xl text-gray-400">
              Stories, tips, and updates from The Bazaar
            </p>
          </div>

          {blogPosts.length > 0 ? (
            <div className="space-y-6">
              {blogPosts.map((post, index) => (
                <article
                  key={index}
                  className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 hover:border-netflix-red transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <span className="text-netflix-red">{post.category}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-3">{post.title}</h2>
                  <p className="text-gray-400 mb-4">{post.excerpt}</p>
                  <Button
                    variant="ghost"
                    className="text-netflix-red hover:text-netflix-red/80 p-0"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-12 text-center">
              <h2 className="text-2xl font-semibold text-white mb-2">Coming Soon</h2>
              <p className="text-gray-400">
                Our blog is launching soon. Check back for updates, tips, and stories!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

