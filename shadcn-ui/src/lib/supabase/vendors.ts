import { supabase } from './client';
import type { Vendor, Product } from '@/types';

export interface VendorFilters {
  category?: string;
  location?: string;
  rating?: number;
  tier?: string;
  search?: string;
}

/**
 * Fetch vendors with pagination and filters
 */
export async function getVendors(
  limit: number = 20,
  offset: number = 0,
  filters: VendorFilters = {}
): Promise<{ data: Vendor[] | null; error: unknown }> {
  try {
    let query = supabase
      .from('vendors')
      .select('*')
      .range(offset, offset + limit - 1);

    // Apply filters
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,business_type.ilike.%${filters.search}%,city.ilike.%${filters.search}%`
      );
    }

    if (filters.location) {
      query = query.ilike('city', `%${filters.location}%`);
    }

    if (filters.rating) {
      query = query.gte('rating', filters.rating);
    }

    if (filters.tier) {
      query = query.eq('subscription_tier', filters.tier);
    }

    const { data, error } = await query;

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetch a single vendor by slug
 */
export async function getVendorBySlug(
  slug: string
): Promise<{ data: Vendor | null; error: unknown }> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('slug', slug)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetch vendor's products
 */
export async function getVendorProducts(
  vendorId: string,
  limit: number = 20
): Promise<{ data: Product[] | null; error: unknown }> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .eq('is_active', true)
      .limit(limit);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Fetch featured vendors for carousel
 */
export async function getFeaturedVendors(
  limit: number = 5
): Promise<{ data: Vendor[] | null; error: unknown }> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_featured', true)
      .eq('is_verified', true)
      .limit(limit);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Search vendors by query
 */
export async function searchVendors(
  query: string,
  limit: number = 20
): Promise<{ data: Vendor[] | null; error: unknown }> {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .or(
        `name.ilike.%${query}%,business_type.ilike.%${query}%,description.ilike.%${query}%`
      )
      .limit(limit);

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}