import { useState } from 'react';
import { Carousel } from '@/components/marketplace/Carousel';
import { CategoryCarousel } from '@/components/marketplace/CategoryCarousel';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Index() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Mock data for hero carousel
  const heroSlides = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=600&fit=crop',
      title: 'Welcome to The Bazaar',
      subtitle: 'Discover amazing products from verified vendors across Kenya',
      cta: {
        text: 'Start Shopping',
        link: '#products',
      },
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=600&fit=crop',
      title: 'Become a Vendor',
      subtitle: 'Join thousands of successful vendors on our platform',
      cta: {
        text: 'Learn More',
        link: '/vendors/register',
      },
    },
  ];

  // Mock data for categories
  const categories = [
    { id: '1', name: 'All Products', slug: 'all', icon: '🛍️' },
    { id: '2', name: 'Electronics', slug: 'electronics', icon: '📱' },
    { id: '3', name: 'Fashion', slug: 'fashion', icon: '👕' },
    { id: '4', name: 'Home & Garden', slug: 'home-garden', icon: '🏡' },
    { id: '5', name: 'Beauty', slug: 'beauty', icon: '💄' },
    { id: '6', name: 'Sports', slug: 'sports', icon: '⚽' },
    { id: '7', name: 'Books', slug: 'books', icon: '📚' },
    { id: '8', name: 'Toys', slug: 'toys', icon: '🧸' },
  ];

  // Mock data for products
  const mockProducts = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      price: 8500,
      compareAtPrice: 12000,
      currency: 'KES' as const,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=500&fit=crop'],
      vendorName: 'TechHub Kenya',
      vendorSlug: 'techhub-kenya',
      rating: 4.5,
      reviewCount: 128,
      isInStock: true,
      discount: 29,
    },
    {
      id: '2',
      name: 'Designer Leather Handbag',
      price: 15000,
      currency: 'KES' as const,
      images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop'],
      vendorName: 'Fashion Forward',
      vendorSlug: 'fashion-forward',
      rating: 4.8,
      reviewCount: 89,
      isInStock: true,
    },
    {
      id: '3',
      name: 'Smart Watch Pro',
      price: 25000,
      compareAtPrice: 32000,
      currency: 'KES' as const,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop'],
      vendorName: 'TechHub Kenya',
      vendorSlug: 'techhub-kenya',
      rating: 4.6,
      reviewCount: 256,
      isInStock: true,
      discount: 22,
    },
    {
      id: '4',
      name: 'Organic Skincare Set',
      price: 4500,
      currency: 'KES' as const,
      images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=500&fit=crop'],
      vendorName: 'Beauty Essentials',
      vendorSlug: 'beauty-essentials',
      rating: 4.9,
      reviewCount: 342,
      isInStock: true,
    },
    {
      id: '5',
      name: 'Running Shoes',
      price: 7800,
      compareAtPrice: 9500,
      currency: 'KES' as const,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop'],
      vendorName: 'Sports Arena',
      vendorSlug: 'sports-arena',
      rating: 4.4,
      reviewCount: 167,
      isInStock: true,
      discount: 18,
    },
    {
      id: '6',
      name: 'Coffee Maker Deluxe',
      price: 12000,
      currency: 'KES' as const,
      images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=500&fit=crop'],
      vendorName: 'Home Essentials',
      vendorSlug: 'home-essentials',
      rating: 4.7,
      reviewCount: 93,
      isInStock: false,
    },
    {
      id: '7',
      name: 'Bluetooth Speaker',
      price: 5500,
      currency: 'KES' as const,
      images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=500&fit=crop'],
      vendorName: 'TechHub Kenya',
      vendorSlug: 'techhub-kenya',
      rating: 4.3,
      reviewCount: 201,
      isInStock: true,
    },
    {
      id: '8',
      name: 'Vintage Sunglasses',
      price: 3200,
      currency: 'KES' as const,
      images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=500&fit=crop'],
      vendorName: 'Fashion Forward',
      vendorSlug: 'fashion-forward',
      rating: 4.6,
      reviewCount: 78,
      isInStock: true,
    },
  ];

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Carousel */}
      <section className="mb-8">
        <Carousel items={heroSlides} autoPlayInterval={5000} />
      </section>

      {/* Categories Section */}
      <section className="container-custom mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">
          Browse by Category
        </h2>
        <CategoryCarousel
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={setActiveCategory}
        />
      </section>

      {/* Products Grid */}
      <section className="container-custom mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Featured Products</h2>
          <button className="text-netflix-red hover:underline">View All</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>

      {/* Trending Section Placeholder */}
      <section className="container-custom mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Trending Now</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] w-full rounded-lg bg-netflix-dark-gray" />
              <Skeleton className="h-4 w-3/4 bg-netflix-dark-gray" />
              <Skeleton className="h-4 w-1/2 bg-netflix-dark-gray" />
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container-custom mb-12">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-netflix-red to-orange-600 p-12 text-center">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Selling?
            </h2>
            <p className="text-white/90 text-lg mb-6">
              Join thousands of successful vendors on The Bazaar
            </p>
            <button className="bg-white text-netflix-red hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
              Become a Vendor
            </button>
          </div>
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </section>
    </div>
  );
}