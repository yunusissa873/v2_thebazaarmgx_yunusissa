import { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { VendorCard } from '@/components/vendor/VendorCard';
import { useInfiniteVendors } from '@/hooks/useInfiniteVendors';
import { mockVendors } from '@/data/mockVendors';

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('');

  // Get featured vendors for carousel
  const featuredVendors = useMemo(
    () => mockVendors.filter((v) => v.isFeatured),
    []
  );

  // Create carousel items from featured vendors
  const carouselItems = featuredVendors.map((vendor) => ({
    id: vendor.id,
    image: vendor.banner,
    title: vendor.name,
    subtitle: vendor.businessType,
    cta: {
      text: 'View Profile',
      link: `/vendors/${vendor.slug}`,
    },
  }));

  // Infinite scroll hook with filters
  const { vendors, loading, hasMore, observerTarget } = useInfiniteVendors({
    initialVendors: mockVendors,
    pageSize: 20,
    filters: {
      search: searchQuery,
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setLocationFilter('');
    setRatingFilter('');
    setTierFilter('');
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Carousel - Featured Vendors */}
      {carouselItems.length > 0 && (
        <section className="mb-8">
          <Carousel items={carouselItems} autoPlayInterval={6000} />
        </section>
      )}

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

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search vendors by name, business type, or location..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-netflix-dark-gray border-netflix-medium-gray pl-10 text-white placeholder:text-gray-400 focus-visible:ring-netflix-red"
            />
          </div>

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
            {(searchQuery ||
              categoryFilter ||
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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            {vendors.length > 0
              ? `Showing ${vendors.length} vendor${vendors.length !== 1 ? 's' : ''}`
              : 'No vendors found'}
          </p>
        </div>

        {/* Vendors Grid */}
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