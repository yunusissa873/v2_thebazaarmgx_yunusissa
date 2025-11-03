/**
 * Utility to map product data to ProductCard format
 */
import type { Product } from '@/data/transformed/products';
import type { Vendor } from '@/data/transformed/vendors';

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  currency: 'KES' | 'USD';
  images: string[];
  vendorName: string;
  vendorSlug: string;
  rating: number;
  reviewCount?: number;
  isInStock: boolean;
  discount?: number;
}

export function mapProductToCard(
  product: Product,
  vendor?: Vendor
): ProductCardData {
  const vendorName = vendor?.name || 'Unknown Vendor';
  const vendorSlug = vendor?.slug || 'unknown';
  const isInStock = product.stock_quantity > 0 && product.is_active;
  
  // Calculate discount if compare_at_price exists
  let discount: number | undefined;
  if (product.compare_at_price && product.compare_at_price > product.price) {
    discount = Math.round(
      ((product.compare_at_price - product.price) / product.compare_at_price) * 100
    );
  }
  
  return {
    id: product.product_id,
    name: product.name,
    price: product.price,
    compareAtPrice: product.compare_at_price || undefined,
    currency: product.currency as 'KES' | 'USD',
    images: product.images || [],
    vendorName,
    vendorSlug,
    rating: product.rating || 0,
    reviewCount: 0, // TODO: Add review count from reviews data
    isInStock,
    discount,
  };
}

