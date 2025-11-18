/**
 * Utility to map product data to ProductCard format
 */
import type { Product as MockProduct } from '@/data/transformed/products';
import type { Vendor } from '@/data/transformed/vendors';
import type { Product as SupabaseProduct } from '@thebazaar/supabase/products';

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

// Map mock product format to card format
export function mapProductToCard(
  product: MockProduct | SupabaseProduct,
  vendor?: Vendor | { id: string; name: string; slug: string } | null
): ProductCardData {
  // Check if it's Supabase format (has 'id') or mock format (has 'product_id')
  const isSupabaseFormat = 'id' in product;
  const productId = isSupabaseFormat ? product.id : product.product_id;
  const vendorName = vendor?.name || 'Unknown Vendor';
  const vendorSlug = vendor?.slug || 'unknown';
  
  // Handle stock quantity - Supabase uses stock_quantity, mock uses stock_quantity
  const stockQuantity = 'stock_quantity' in product ? product.stock_quantity : 0;
  const isActive = 'is_active' in product ? product.is_active : true;
  const isInStock = stockQuantity > 0 && isActive;
  
  // Calculate discount if compare_at_price exists
  let discount: number | undefined;
  const compareAtPrice = 'compare_at_price' in product ? product.compare_at_price : null;
  if (compareAtPrice && compareAtPrice > product.price) {
    discount = Math.round(
      ((compareAtPrice - product.price) / compareAtPrice) * 100
    );
  }
  
  // Handle images - Supabase might have images as array or JSONB
  const images = Array.isArray(product.images) 
    ? product.images 
    : (product.images ? [product.images] : []);
  
  return {
    id: productId,
    name: product.name,
    price: product.price,
    compareAtPrice: compareAtPrice || undefined,
    currency: product.currency as 'KES' | 'USD',
    images,
    vendorName,
    vendorSlug,
    rating: product.rating || 0,
    reviewCount: 'review_count' in product ? product.review_count : 0,
    isInStock,
    discount,
  };
}

