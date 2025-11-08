import { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Carousel } from '@/components/marketplace/Carousel';
import { VendorCarousel } from '@/components/vendor/VendorCarousel';
import { VendorGridCarousel } from '@/components/vendor/VendorGridCarousel';
import { VendorCard } from '@/components/vendor/VendorCard';
import { useInfiniteVendors } from '@/hooks/useInfiniteVendors';
import { mockVendors } from '@/data/mockVendors';

export default function Vendors() {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('');

  // Get 10 trending vendors for banner hero carousel
  const trendingVendorSlides = useMemo(() => {
    // Prioritize featured vendors, then by rating, then by review count
    const trending = [...mockVendors]
      .sort((a, b) => {
        // Featured vendors first
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        // Then by rating
        if (b.rating !== a.rating) return b.rating - a.rating;
        // Then by review count
        return b.reviewCount - a.reviewCount;
      })
      .slice(0, 10)
      .map((vendor) => ({
        id: `vendor_${vendor.id}`,
        type: 'vendor' as const,
        image: vendor.banner || '',
        vendorData: vendor,
      }));
    return trending;
  }, []);

  // Get 10 vendors for hero carousel
  const heroVendors = useMemo(
    () => mockVendors.slice(0, 10),
    []
  );

  // Get featured vendors for 2-row carousel (30 total)
  const featuredVendors = useMemo(
    () => mockVendors.filter((v) => v.isFeatured).slice(0, 30),
    []
  );

  // Infinite scroll hook with filters
  const { vendors, loading, hasMore, observerTarget } = useInfiniteVendors({
    initialVendors: mockVendors,
    pageSize: 20,
    filters: {
      category: categoryFilter,
      location: locationFilter,
      rating: ratingFilter ? parseFloat(ratingFilter) : undefined,
      tier: tierFilter,
    },
  });

  // Extract unique values for filters
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    mockVendors.forEach((vendor) => {
      vendor.categories.forEach((cat) => categories.add(cat));
    });
    return Array.from(categories).sort();
  }, []);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(mockVendors.map((v) => v.city));
    return Array.from(locations).sort();
  }, []);

  const clearFilters = () => {
    setCategoryFilter('');
    setLocationFilter('');
    setRatingFilter('');
    setTierFilter('');
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Discover Vendors
          </h1>
          <p className="text-gray-400 text-lg">
            Browse through our verified vendors and find the perfect match for
            your needs
          </p>
        </div>

        {/* Trending Vendors Banner Hero Carousel */}
        {trendingVendorSlides.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Trending Vendors
              </h2>
            </div>
            <Carousel
              items={trendingVendorSlides}
              autoPlayInterval={6000}
            />
          </section>
        )}

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-gray-400">
              <SlidersHorizontal className="h-5 w-5" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px] bg-netflix-dark-gray border-netflix-medium-gray text-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-netflix-dark-gray border-netflix-medium-gray">
                <SelectItem value="all" className="text-white">
                  All Categories
                </SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="text-white"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[180px] bg-netflix-dark-gray border-netflix-medium-gray text-white">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-netflix-dark-gray border-netflix-medium-gray">
                <SelectItem value="all" className="text-white">
                  All Locations
                </SelectItem>
                {uniqueLocations.map((location) => (
                  <SelectItem
                    key={location}
                    value={location}
                    className="text-white"
                  >
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Rating Filter */}
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[180px] bg-netflix-dark-gray border-netflix-medium-gray text-white">
                <SelectValue placeholder="Min Rating" />
              </SelectTrigger>
              <SelectContent className="bg-netflix-dark-gray border-netflix-medium-gray">
                <SelectItem value="all" className="text-white">
                  All Ratings
                </SelectItem>
                <SelectItem value="4.5" className="text-white">
                  4.5+ Stars
                </SelectItem>
                <SelectItem value="4.0" className="text-white">
                  4.0+ Stars
                </SelectItem>
                <SelectItem value="3.5" className="text-white">
                  3.5+ Stars
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Tier Filter */}
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[180px] bg-netflix-dark-gray border-netflix-medium-gray text-white">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent className="bg-netflix-dark-gray border-netflix-medium-gray">
                <SelectItem value="all" className="text-white">
                  All Tiers
                </SelectItem>
                <SelectItem value="Platinum" className="text-white">
                  Platinum
                </SelectItem>
                <SelectItem value="Gold" className="text-white">
                  Gold
                </SelectItem>
                <SelectItem value="Silver" className="text-white">
                  Silver
                </SelectItem>
                <SelectItem value="Bronze" className="text-white">
                  Bronze
                </SelectItem>
                <SelectItem value="Basic" className="text-white">
                  Basic
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters Button */}
            {(categoryFilter ||
              locationFilter ||
              ratingFilter ||
              tierFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="border-netflix-medium-gray text-gray-400 hover:text-white hover:bg-netflix-medium-gray"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Hero Carousel - 10 Vendors */}
        {heroVendors.length > 0 && (
          <section className="mb-12">
            <VendorCarousel
              vendors={heroVendors}
              autoPlayInterval={5000}
              showNavigation={true}
            />
          </section>
        )}

        {/* Featured Vendors - 2-row Grid Carousel (15 per row = 30 total) */}
        {featuredVendors.length > 0 && (
          <section className="mb-12">
            <VendorGridCarousel
              vendors={featuredVendors}
              title="Featured Vendors"
              rows={2}
              itemsPerRow={15}
              autoPlayInterval={6000}
              showNavigation={true}
            />
          </section>
        )}

        {/* All Vendors Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">All Vendors</h2>
          
          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-400">
              {vendors.length > 0
                ? `Showing ${vendors.length} vendor${vendors.length !== 1 ? 's' : ''}`
                : 'No vendors found'}
            </p>
          </div>
        </div>

        {/* Vendors Grid - Infinite Scroll */}
        {vendors.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
              {vendors.map((vendor) => (
                <VendorCard key={vendor.id} {...vendor} />
              ))}
            </div>

            {/* Loading More Indicator */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg bg-netflix-dark-gray" />
                    <Skeleton className="h-4 w-3/4 bg-netflix-dark-gray" />
                    <Skeleton className="h-4 w-1/2 bg-netflix-dark-gray" />
                  </div>
                ))}
              </div>
            )}

            {/* Intersection Observer Target */}
            {hasMore && <div ref={observerTarget} className="h-10" />}

            {/* End of Results */}
            {!hasMore && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-400">
                  You've reached the end of the list
                </p>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-16">
              <div className="text-gray-600 mb-4">
                <Filter className="h-16 w-16 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No vendors found
              </h3>
              <p className="text-gray-400 mb-6">
                Try adjusting your filters or search query
              </p>
              <Button
                onClick={clearFilters}
                className="bg-netflix-red hover:bg-netflix-red/90 text-white"
              >
                Clear All Filters
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
}