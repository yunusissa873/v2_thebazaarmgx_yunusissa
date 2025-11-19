/**
 * Unified search utilities for products, vendors, and categories
 */

import type { Product } from '@/data/transformed/products';
import type { Vendor } from '@/data/transformed/vendors';
import productsData from '@/data/transformed/products';
import vendorsData from '@/data/transformed/vendors';
import categoriesData from '@/data/transformed/categories';

export type SearchResultType = 'product' | 'vendor' | 'category';

export interface UnifiedSearchResult {
  type: SearchResultType;
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  metadata?: Record<string, any>;
}

// Helper to flatten categories for search
function flattenCategoriesForSearch(categories: any[]): Array<{ category_id: string; name: string; slug: string; image_url: string; level: number }> {
  const result: Array<{ category_id: string; name: string; slug: string; image_url: string; level: number }> = [];
  
  function traverse(items: any[]) {
    items.forEach((item) => {
      result.push({
        category_id: item.category_id,
        name: item.name,
        slug: item.slug,
        image_url: item.image_url,
        level: item.level,
      });
      if (item.children) {
        traverse(item.children);
      }
    });
  }
  
  traverse(categories);
  return result;
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  vendorId?: string;
  inStock?: boolean;
  tags?: string[];
}

export type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

/**
 * Search products with query and filters
 */
export function searchProducts(
  filters: SearchFilters = {},
  sortBy: SortOption = 'relevance'
): Product[] {
  let results = [...productsData];

  // Filter by search query
  if (filters.query && filters.query.trim()) {
    const query = filters.query.toLowerCase().trim();
    results = results.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(query);
      const descMatch = product.description?.toLowerCase().includes(query);
      const shortDescMatch = product.short_description?.toLowerCase().includes(query);
      const tagsMatch = product.tags?.some((tag) => tag.toLowerCase().includes(query));
      const slugMatch = product.slug.toLowerCase().includes(query);

      return nameMatch || descMatch || shortDescMatch || tagsMatch || slugMatch;
    });
  }

  // Filter by category
  if (filters.categoryId) {
    results = results.filter((p) => p.category_id === filters.categoryId);
  }

  // Filter by price range
  if (filters.minPrice !== undefined) {
    results = results.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    results = results.filter((p) => p.price <= filters.maxPrice!);
  }

  // Filter by rating
  if (filters.minRating !== undefined) {
    results = results.filter((p) => p.rating >= filters.minRating!);
  }

  // Filter by vendor
  if (filters.vendorId) {
    results = results.filter((p) => p.vendor_id === filters.vendorId);
  }

  // Filter by stock
  if (filters.inStock !== undefined) {
    if (filters.inStock) {
      results = results.filter((p) => p.stock_quantity > 0 && p.is_active);
    } else {
      results = results.filter((p) => p.stock_quantity === 0 || !p.is_active);
    }
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter((p) =>
      filters.tags!.some((tag) => p.tags?.includes(tag))
    );
  }

  // Sort results
  results = sortProducts(results, sortBy, filters.query);

  return results;
}

/**
 * Sort products based on sort option
 */
function sortProducts(
  products: Product[],
  sortBy: SortOption,
  query?: string
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case 'relevance':
    default:
      // If there's a query, prioritize exact matches and name matches
      if (query) {
        const queryLower = query.toLowerCase();
        return sorted.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          
          const aExact = aName === queryLower;
          const bExact = bName === queryLower;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          
          const aStarts = aName.startsWith(queryLower);
          const bStarts = bName.startsWith(queryLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          return 0;
        });
      }
      return sorted;
  }
}

/**
 * Get search suggestions based on query
 */
export function getSearchSuggestions(query: string, limit: number = 5): string[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();
  const suggestions = new Set<string>();

  // Get product names that match
  productsData.forEach((product) => {
    const nameLower = product.name.toLowerCase();
    if (nameLower.includes(queryLower)) {
      // Extract the matching part or full name
      const words = product.name.split(' ');
      for (const word of words) {
        if (word.toLowerCase().startsWith(queryLower)) {
          suggestions.add(word);
          break;
        }
      }
      if (suggestions.size < limit) {
        suggestions.add(product.name);
      }
    }
  });

  // Get tags that match
  productsData.forEach((product) => {
    product.tags?.forEach((tag) => {
      if (tag.toLowerCase().includes(queryLower) && suggestions.size < limit) {
        suggestions.add(tag);
      }
    });
  });

  return Array.from(suggestions).slice(0, limit);
}

/**
 * Get product suggestions (full products) for autocomplete
 */
export function getProductSuggestions(query: string, limit: number = 5): Product[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();
  const suggestions: Product[] = [];

  for (const product of productsData) {
    if (suggestions.length >= limit) break;

    const nameMatch = product.name.toLowerCase().includes(queryLower);
    const slugMatch = product.slug.toLowerCase().includes(queryLower);
    const tagsMatch = product.tags?.some((tag) => tag.toLowerCase().includes(queryLower));

    if (nameMatch || slugMatch || tagsMatch) {
      suggestions.push(product);
    }
  }

  return suggestions;
}

/**
 * Unified search across products, vendors, and categories
 * Returns a balanced mix of results from each type
 */
export function unifiedSearch(query: string, limit: number = 10): UnifiedSearchResult[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const queryLower = query.toLowerCase().trim();
  const products: UnifiedSearchResult[] = [];
  const vendors: UnifiedSearchResult[] = [];
  const categories: UnifiedSearchResult[] = [];
  const flatCategories = flattenCategoriesForSearch(categoriesData);

  // Search products (limit per type to ensure variety)
  const perTypeLimit = Math.ceil(limit / 3);
  
  for (const product of productsData) {
    if (products.length >= perTypeLimit) break;

    const nameMatch = product.name.toLowerCase().includes(queryLower);
    const descMatch = product.description?.toLowerCase().includes(queryLower);
    const slugMatch = product.slug.toLowerCase().includes(queryLower);
    const tagsMatch = product.tags?.some((tag) => tag.toLowerCase().includes(queryLower));

    if (nameMatch || descMatch || slugMatch || tagsMatch) {
      products.push({
        type: 'product',
        id: product.product_id,
        name: product.name,
        slug: product.slug,
        description: product.short_description,
        image: product.images?.[0],
        metadata: {
          price: product.price,
          currency: product.currency,
          rating: product.rating,
        },
      });
    }
  }

  // Search vendors
  for (const vendor of vendorsData) {
    if (vendors.length >= perTypeLimit) break;

    const nameMatch = vendor.name.toLowerCase().includes(queryLower);
    const taglineMatch = vendor.tagline?.toLowerCase().includes(queryLower);
    const descMatch = vendor.description?.toLowerCase().includes(queryLower);
    
    // Slug matching - handle both hyphen and space variations
    const slugLower = vendor.slug.toLowerCase();
    const slugMatch = slugLower.includes(queryLower) || 
                     slugLower.replace(/-/g, ' ').includes(queryLower) ||
                     queryLower.replace(/\s+/g, '-').includes(slugLower);
    
    const businessCategoryMatch = vendor.business_category?.some((cat) => cat.toLowerCase().includes(queryLower));
    const tagsMatch = vendor.tags?.some((tag) => tag.toLowerCase().includes(queryLower));

    if (nameMatch || taglineMatch || descMatch || slugMatch || businessCategoryMatch || tagsMatch) {
      vendors.push({
        type: 'vendor',
        id: vendor.vendor_id,
        name: vendor.name,
        slug: vendor.slug,
        description: vendor.tagline,
        image: vendor.logo_url,
        metadata: {
          rating: vendor.rating,
          location: vendor.location,
          verification_status: vendor.verification_status,
        },
      });
    }
  }

  // Search categories
  for (const category of flatCategories) {
    if (categories.length >= perTypeLimit) break;

    const nameMatch = category.name.toLowerCase().includes(queryLower);
    const slugMatch = category.slug.toLowerCase().includes(queryLower);

    if (nameMatch || slugMatch) {
      categories.push({
        type: 'category',
        id: category.category_id,
        name: category.name,
        slug: category.slug,
        image: category.image_url,
        metadata: {
          level: category.level,
        },
      });
    }
  }

  // Combine and interleave results for better variety
  const combined: UnifiedSearchResult[] = [];
  const maxLength = Math.max(products.length, vendors.length, categories.length);
  
  for (let i = 0; i < maxLength && combined.length < limit; i++) {
    if (i < products.length && combined.length < limit) combined.push(products[i]);
    if (i < vendors.length && combined.length < limit) combined.push(vendors[i]);
    if (i < categories.length && combined.length < limit) combined.push(categories[i]);
  }

  // Sort by relevance (exact name matches first, then starts with, then contains)
  return combined.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const query = queryLower;

    // Exact match
    const aExact = aName === query;
    const bExact = bName === query;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;

    // Starts with
    const aStarts = aName.startsWith(query);
    const bStarts = bName.startsWith(query);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    return 0;
  }).slice(0, limit);
}

