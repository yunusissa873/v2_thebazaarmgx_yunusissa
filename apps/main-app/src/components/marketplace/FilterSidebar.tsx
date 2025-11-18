/**
 * Collapsible Filter Sidebar Component
 */

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@thebazaar/ui/button';
import { Checkbox } from '@thebazaar/ui/checkbox';
import { Label } from '@thebazaar/ui/label';
import { Slider } from '@thebazaar/ui/slider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@thebazaar/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@thebazaar/ui/select';
import { cn } from '@thebazaar/utils';
import { useCategories, useVendors, useProducts } from '@thebazaar/hooks/useMockData';
import type { SearchFilters } from '@/utils/search';

interface FilterSidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

// Helper to flatten categories
function flattenCategories(categories: any[]): Array<{ id: string; name: string }> {
  const result: Array<{ id: string; name: string }> = [];
  
  function traverse(items: any[]) {
    items.forEach((item) => {
      // Support both old (category_id) and new (id) structure
      const categoryId = item.id || item.category_id;
      result.push({ id: categoryId, name: item.name });
      if (item.children) {
        traverse(item.children);
      }
    });
  }
  
  traverse(categories);
  return result;
}

export function FilterSidebar({ filters, onFiltersChange, className }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const categories = useCategories();
  const vendors = useVendors();
  const allProducts = useProducts();
  const flatCategories = flattenCategories(categories);

  // Calculate price range from actual products
  const { minPrice, maxPrice } = useMemo(() => {
    if (allProducts.length === 0) {
      return { minPrice: 0, maxPrice: 500000 };
    }
    const prices = allProducts.map((p) => p.price);
    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
    };
  }, [allProducts]);

  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice ?? minPrice,
    filters.maxPrice ?? maxPrice,
  ]);

  // Update price range when filters or calculated range changes
  useEffect(() => {
    setPriceRange([
      filters.minPrice ?? minPrice,
      filters.maxPrice ?? maxPrice,
    ]);
  }, [filters.minPrice, filters.maxPrice, minPrice, maxPrice]);

  const handleCategoryToggle = (categoryId: string) => {
    onFiltersChange({
      ...filters,
      categoryId: filters.categoryId === categoryId ? undefined : categoryId,
    });
  };

  const handleVendorToggle = (vendorId: string) => {
    onFiltersChange({
      ...filters,
      vendorId: filters.vendorId === vendorId ? undefined : vendorId,
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    const [min, max] = values as [number, number];
    setPriceRange([min, max]);
    onFiltersChange({
      ...filters,
      minPrice: min > minPrice ? min : undefined,
      maxPrice: max < maxPrice ? max : undefined,
    });
  };

  const handleRatingChange = (rating: string) => {
    onFiltersChange({
      ...filters,
      minRating: rating ? parseFloat(rating) : undefined,
    });
  };

  const handleStockToggle = () => {
    onFiltersChange({
      ...filters,
      inStock: filters.inStock === true ? undefined : true,
    });
  };

  const clearAllFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    onFiltersChange({
      query: filters.query,
    });
  };

  const hasActiveFilters =
    filters.categoryId ||
    filters.vendorId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minRating ||
    filters.inStock;

  return (
    <div className={cn('w-full', className)}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-netflix-dark-gray border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
          >
            <span className="font-medium">Filters</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-6 border border-netflix-medium-gray rounded-lg p-4 bg-netflix-dark-gray">
          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-netflix-red hover:text-netflix-red hover:bg-netflix-red/10"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}

          {/* Category Filter */}
          <div>
            <Label className="text-white font-medium mb-3 block">Category</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {flatCategories.slice(0, 20).map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.categoryId === category.id}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    className="border-netflix-medium-gray data-[state=checked]:bg-netflix-red data-[state=checked]:border-netflix-red"
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm text-gray-300 cursor-pointer font-normal"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <Label className="text-white font-medium mb-3 block">
              Price Range
            </Label>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                min={minPrice}
                max={maxPrice}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>KES {priceRange[0].toLocaleString()}</span>
                <span>KES {priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <Label className="text-white font-medium mb-3 block">
              Minimum Rating
            </Label>
            <Select
              value={filters.minRating?.toString() || ''}
              onValueChange={handleRatingChange}
            >
              <SelectTrigger className="bg-netflix-medium-gray border-netflix-medium-gray text-white">
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent className="bg-netflix-dark-gray border-netflix-medium-gray">
                <SelectItem value="">Any rating</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
                <SelectItem value="3.0">3.0+ Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vendor Filter */}
          <div>
            <Label className="text-white font-medium mb-3 block">Vendor</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {vendors.map((vendor) => (
                <div key={vendor.vendor_id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`vendor-${vendor.vendor_id}`}
                    checked={filters.vendorId === vendor.vendor_id}
                    onCheckedChange={() => handleVendorToggle(vendor.vendor_id)}
                    className="border-netflix-medium-gray data-[state=checked]:bg-netflix-red data-[state=checked]:border-netflix-red"
                  />
                  <Label
                    htmlFor={`vendor-${vendor.vendor_id}`}
                    className="text-sm text-gray-300 cursor-pointer font-normal"
                  >
                    {vendor.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Filter */}
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock === true}
                onCheckedChange={handleStockToggle}
                className="border-netflix-medium-gray data-[state=checked]:bg-netflix-red data-[state=checked]:border-netflix-red"
              />
              <Label
                htmlFor="in-stock"
                className="text-sm text-gray-300 cursor-pointer font-normal"
              >
                In Stock Only
              </Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

