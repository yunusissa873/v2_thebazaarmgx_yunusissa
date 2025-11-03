/**
 * Products Page - Search Results with Filters
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid3x3, List, SlidersHorizontal } from 'lucide-react';
import { SearchBar } from '@/components/marketplace/SearchBar';
import { FilterSidebar } from '@/components/marketplace/FilterSidebar';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { searchProducts, type SearchFilters, type SortOption } from '@/utils/search';
import { mapProductToCard } from '@/utils/productMapper';
import { useVendors } from '@/hooks/useMockData';
import type { Product } from '@/data/transformed/products';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const vendors = useVendors();
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const isUpdatingFromURL = useRef(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const query = searchParams.get('search') || undefined;
    const categoryId = searchParams.get('category') || undefined;
    const vendorId = searchParams.get('vendor') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
    const inStock = searchParams.get('inStock') === 'true' ? true : undefined;

    return {
      query,
      categoryId,
      vendorId,
      minPrice,
      maxPrice,
      minRating,
      inStock,
    };
  });

  // Update filters when URL params change (e.g., from category search)
  useEffect(() => {
    if (isUpdatingFromURL.current) {
      isUpdatingFromURL.current = false;
      return;
    }

    const query = searchParams.get('search') || undefined;
    const categoryId = searchParams.get('category') || undefined;
    const vendorId = searchParams.get('vendor') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined;
    const inStock = searchParams.get('inStock') === 'true' ? true : undefined;

    // Only update if filters have actually changed to avoid loops
    const newFilters: SearchFilters = {
      query,
      categoryId,
      vendorId,
      minPrice,
      maxPrice,
      minRating,
      inStock,
    };

    // Check if filters have changed
    const hasChanged =
      filters.query !== newFilters.query ||
      filters.categoryId !== newFilters.categoryId ||
      filters.vendorId !== newFilters.vendorId ||
      filters.minPrice !== newFilters.minPrice ||
      filters.maxPrice !== newFilters.maxPrice ||
      filters.minRating !== newFilters.minRating ||
      filters.inStock !== newFilters.inStock;

    if (hasChanged) {
      setFilters(newFilters);
    }
  }, [searchParams, filters]);

  // Update URL when filters change (but not when filters were set from URL)
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.query) params.set('search', filters.query);
    if (filters.categoryId) params.set('category', filters.categoryId);
    if (filters.vendorId) params.set('vendor', filters.vendorId);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating) params.set('minRating', filters.minRating.toString());
    if (filters.inStock) params.set('inStock', 'true');

    const currentParams = searchParams.toString();
    const newParams = params.toString();

    // Only update if URL params actually changed
    if (currentParams !== newParams) {
      isUpdatingFromURL.current = true;
      setSearchParams(params, { replace: true });
    }
  }, [filters, setSearchParams, searchParams]);

  // Get search results
  const results = useMemo(() => {
    return searchProducts(filters, sortBy);
  }, [filters, sortBy]);

  // Map products to card format
  const productCards = useMemo(() => {
    return results.map((product: Product) => {
      const vendor = vendors.find((v) => v.vendor_id === product.vendor_id);
      return mapProductToCard(product, vendor);
    });
  }, [results, vendors]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
  };


  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            placeholder="Search products, vendors..."
            onSearch={(query) => {
              setFilters({ ...filters, query });
            }}
          />
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header with Results Count, Sort, and View Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="text-gray-300">
                  {results.length} {results.length === 1 ? 'product' : 'products'} found
                  {filters.query && (
                    <span className="ml-2">
                      for "<span className="text-white font-medium">{filters.query}</span>"
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden">
                  <FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />
                </div>

                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] bg-netflix-dark-gray border-netflix-medium-gray text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-netflix-dark-gray border-netflix-medium-gray">
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 border border-netflix-medium-gray rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-8 w-8',
                      viewMode === 'grid'
                        ? 'bg-netflix-red text-white hover:bg-netflix-red/90'
                        : 'text-gray-400 hover:text-white hover:bg-netflix-medium-gray'
                    )}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    className={cn(
                      'h-8 w-8',
                      viewMode === 'list'
                        ? 'bg-netflix-red text-white hover:bg-netflix-red/90'
                        : 'text-gray-400 hover:text-white hover:bg-netflix-medium-gray'
                    )}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {productCards.length > 0 ? (
              <div
                className={cn(
                  viewMode === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                    : 'grid grid-cols-1 gap-4'
                )}
              >
                {productCards.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    currency={product.currency}
                    images={product.images}
                    vendorName={product.vendorName}
                    vendorSlug={product.vendorSlug}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    isInStock={product.isInStock}
                    discount={product.discount}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <SlidersHorizontal className="h-16 w-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                <p className="text-gray-400 text-center max-w-md">
                  {filters.query
                    ? `We couldn't find any products matching "${filters.query}". Try adjusting your search or filters.`
                    : 'Try adjusting your filters to see more products.'}
                </p>
                {(filters.query || Object.keys(filters).length > 1) && (
                  <Button
                    variant="outline"
                    className="mt-4 border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
                    onClick={() => {
                      setFilters({});
                      setSearchParams({}, { replace: true });
                    }}
                  >
                    Clear all filters
                  </Button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

