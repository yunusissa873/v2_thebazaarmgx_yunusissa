/**
 * Hook for accessing transformed mock data
 * Use this until Supabase is connected
 */

import { useMemo } from 'react';
import categoriesData from '@/data/transformed/categories';
import vendorsData from '@/data/transformed/vendors';
import productsData from '@/data/transformed/products';
import attributesData from '@/data/transformed/attributes';
import usersData from '@/data/transformed/users';
import ordersData from '@/data/transformed/orders';
import reviewsData from '@/data/transformed/product_reviews';
import systemSettingsData from '@/data/transformed/system_settings';

export function useCategories() {
  return categoriesData;
}

export function useVendors() {
  return vendorsData;
}

export function useProducts(filters?: {
  categoryId?: string;
  vendorId?: string;
  featured?: boolean;
  limit?: number;
}) {
  return useMemo(() => {
    let filtered = productsData;
    
    if (filters) {
      if (filters.categoryId) {
        filtered = filtered.filter(p => p.category_id === filters.categoryId);
      }
      if (filters.vendorId) {
        filtered = filtered.filter(p => p.vendor_id === filters.vendorId);
      }
      if (filters.featured) {
        filtered = filtered.filter(p => p.is_featured);
      }
      if (filters.limit) {
        filtered = filtered.slice(0, filters.limit);
      }
    }
    
    return filtered;
  }, [filters?.categoryId, filters?.vendorId, filters?.featured, filters?.limit]);
}

export function useProduct(productId: string) {
  return useMemo(() => {
    return productsData.find(p => p.product_id === productId);
  }, [productId]);
}

export function useAttributes() {
  return attributesData;
}

export function useVendor(vendorId: string) {
  return useMemo(() => {
    return vendorsData.find(v => v.vendor_id === vendorId);
  }, [vendorId]);
}

export function useFeaturedCategories(limit: number = 8) {
  return useMemo(() => {
    const featured: any[] = [];
    
    const collectFeatured = (items: any[]) => {
      items.forEach(item => {
        if (item.is_featured && item.level <= 2) {
          featured.push({
            id: item.category_id,
            category_id: item.category_id,
            name: item.name,
            slug: item.slug,
            image_url: item.image_url,
            level: item.level,
          });
        }
        if (item.children) {
          collectFeatured(item.children);
        }
      });
    };
    
    collectFeatured(categoriesData);
    return featured.slice(0, limit);
  }, [limit]);
}

export function useUsers() {
  return usersData;
}

export function useUser(userId: string) {
  return useMemo(() => {
    return usersData.find(u => u.user_id === userId);
  }, [userId]);
}

export function useOrders(userId?: string) {
  return useMemo(() => {
    if (userId) {
      return ordersData.filter(o => o.user_id === userId);
    }
    return ordersData;
  }, [userId]);
}

export function useOrder(orderId: string) {
  return useMemo(() => {
    return ordersData.find(o => o.order_id === orderId);
  }, [orderId]);
}

export function useProductReviews(productId?: string) {
  return useMemo(() => {
    if (productId) {
      return reviewsData.filter(r => r.product_id === productId);
    }
    return reviewsData;
  }, [productId]);
}

export function useSystemSettings() {
  return systemSettingsData;
}

