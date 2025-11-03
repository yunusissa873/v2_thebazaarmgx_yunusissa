import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Carousel } from '@/components/marketplace/Carousel';
import { CategoryCarousel } from '@/components/marketplace/CategoryCarousel';
import { ProductCarousel } from '@/components/marketplace/ProductCarousel';
import { ProductGridCarousel } from '@/components/marketplace/ProductGridCarousel';
import { InfiniteScrollGrid } from '@/components/marketplace/InfiniteScrollGrid';
import { Button } from '@/components/ui/button';
import { useFeaturedCategories, useProducts, useVendors, useVendor } from '@/hooks/useMockData';
import { mapProductToCard } from '@/utils/productMapper';
import bannersData from '@/data/mock/banners.json';
import { productsData } from '@/data/transformed/products';
import type { Product } from '@/data/transformed/products';

export default function Index() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Load data from transformed mock data
  const featuredCategories = useFeaturedCategories(8);
  const allVendors = useVendors();
  const allProducts = useProducts();
  const featuredProductsData = useProducts({ featured: true, limit: 30 });
  
  // Get active banners and products for hero carousel (Hot Deals)
  // Total: 10 items (1 banner + 9 products)
  const heroSlides = useMemo(() => {
    // Get first active banner (Welcome to The Bazaar)
    const firstBanner = bannersData.data
      .filter(banner => banner.is_active)
      .filter(banner => {
        const now = new Date();
        const startDate = new Date(banner.start_date);
        const endDate = new Date(banner.end_date);
        return now >= startDate && now <= endDate;
      })
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 1)[0]; // Get only first banner
    
    const bannerItem = firstBanner ? {
      id: firstBanner.banner_id,
      type: 'banner' as const,
      image: firstBanner.image_url,
      title: firstBanner.title,
      subtitle: firstBanner.subtitle,
      cta: {
        text: firstBanner.link_text,
        link: firstBanner.link,
      },
    } : null;

    // Select 9 diverse products from different categories for paid placements
    // Priority: featured products with variants, from different vendors and categories
    const selectedProductIds = [
      'prd_thk_001', // iPhone 17 Pro Max - TechHub Kenya (Electronics)
      'prd_001',     // Samsung Galaxy S25 Ultra - Nairobi Gadget Hub (Electronics)
      'prd_002',     // MacBook Pro - Nairobi Gadget Hub (Electronics/Laptops)
      'prd_sb_001',  // Le Falconé Hayba Royalty - Sawae Brands (Fragrances)
      'prd_sb_006',  // Sapil Royal Oud - Sawae Brands (Fragrances)
      'prd_003',     // Modern Linen Abaya - Ruuhi Collection (Fashion)
      'prd_sb_013',  // Swiss Arabian Mukhallat Malaki - Sawae Brands (Fragrances)
      'prd_sb_016',  // Cosmo Vitamin C Brightening Serum - Sawae Brands (Skincare)
      'prd_sb_018',  // Cosmo Retinol Anti-Aging Cream - Sawae Brands (Skincare)
    ];

    const selectedProducts: Product[] = selectedProductIds
      .map(id => productsData.find(p => p.product_id === id))
      .filter((p): p is Product => p !== undefined);

    // Create product carousel items
    const productItems = selectedProducts.map(product => {
      const vendor = allVendors.find(v => v.vendor_id === product.vendor_id);
      return {
        id: `product_${product.product_id}`,
        type: 'product' as const,
        image: product.images?.[0] || '',
        product: product,
        vendor: vendor || null,
      };
    });

    // Combine: 1 banner + 9 products = 10 items total
    const allItems = bannerItem ? [bannerItem, ...productItems] : productItems;
    
    return allItems;
  }, [allVendors]);

  // Hot Deals - Top 10 products (can be filtered by paid placement later)
  const hotDealsProducts = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => {
        // Sort by discount first, then by rating
        const aDiscount = a.compare_at_price ? ((a.compare_at_price - a.price) / a.compare_at_price) * 100 : 0;
        const bDiscount = b.compare_at_price ? ((b.compare_at_price - b.price) / b.compare_at_price) * 100 : 0;
        if (bDiscount !== aDiscount) {
          return bDiscount - aDiscount;
        }
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 10)
      .map(product => {
        const vendor = allVendors.find(v => v.vendor_id === product.vendor_id);
        return mapProductToCard(product, vendor);
      });
  }, [allProducts, allVendors]);

  // Map categories to CategoryCarousel format
  const categories = useMemo(() => {
    const allCat = [
      { id: 'all', name: 'All Products', slug: 'all', icon: '🛍️' },
      ...featuredCategories.map(cat => ({
        id: cat.category_id,
        category_id: cat.category_id,
        name: cat.name,
        slug: cat.slug,
        image_url: cat.image_url,
      })),
    ];
    return allCat;
  }, [featuredCategories]);

  // Featured Products - 30 products for 2 rows of 15
  const featuredProducts = useMemo(() => {
    return featuredProductsData.map(product => {
      const vendor = allVendors.find(v => v.vendor_id === product.vendor_id);
      return mapProductToCard(product, vendor);
    });
  }, [featuredProductsData, allVendors]);

  // Trending Now - Top 30 products for 2 rows of 15
  const trendingProducts = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => {
        // Sort by rating first (higher is better)
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // Then by review count
        return (b.review_count || 0) - (a.review_count || 0);
      })
      .slice(0, 30)
      .map(product => {
        const vendor = allVendors.find(v => v.vendor_id === product.vendor_id);
        return mapProductToCard(product, vendor);
      });
  }, [allProducts, allVendors]);

  // Shop Now - All products for infinite scroll
  const shopNowProducts = useMemo(() => {
    return allProducts.map(product => {
      const vendor = allVendors.find(v => v.vendor_id === product.vendor_id);
      return mapProductToCard(product, vendor);
    });
  }, [allProducts, allVendors]);

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Carousel - Hot Deals */}
      <section className="mb-8">
        <div className="container-custom mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Hot Deals</h1>
          <p className="text-gray-400 mt-2">Discover our best deals and featured products</p>
        </div>
        <Carousel items={heroSlides} autoPlayInterval={5000} />
      </section>

      {/* Categories Section */}
      <section className="container-custom mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            Browse by Category
          </h2>
          <Button
            asChild
            variant="outline"
            className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
          >
            <Link to="/categories">
              Browse Categories
            </Link>
          </Button>
        </div>
        <CategoryCarousel
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={setActiveCategory}
        />
      </section>

      {/* Featured Products - 2-row Grid Carousel (15 per row = 30 total) */}
      {featuredProducts.length > 0 && (
        <section className="container-custom mb-12">
          <ProductGridCarousel
            products={featuredProducts}
            title="Featured Products"
            rows={2}
            itemsPerRow={15}
            autoPlayInterval={5000}
            showNavigation={true}
          />
        </section>
      )}

      {/* Trending Now - 2-row Grid Carousel (15 per row = 30 total) */}
      {trendingProducts.length > 0 && (
        <section className="container-custom mb-12">
          <ProductGridCarousel
            products={trendingProducts}
            title="Trending Now"
            rows={2}
            itemsPerRow={15}
            autoPlayInterval={5000}
            showNavigation={true}
          />
        </section>
      )}

      {/* Shop Now - Infinite Scroll Grid */}
      {shopNowProducts.length > 0 && (
        <section className="container-custom mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Shop Now</h2>
          </div>
          <InfiniteScrollGrid products={shopNowProducts} pageSize={20} />
        </section>
      )}

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
            <Button asChild className="bg-white text-netflix-red hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
              <Link to="/vendors/register">
                Become a Vendor
              </Link>
            </Button>
          </div>
          <div className="absolute inset-0 bg-black/10" />
        </div>
      </section>
    </div>
  );
}