/**
 * Vendor Products API Layer
 * 
 * Supabase functions for product CRUD operations
 * Implements RLS-aware queries (vendor can only see own products)
 * 
 * @author The Bazaar Development Team
 */

import { supabase } from '../client';
import type { Database } from '@/types/database';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];

export interface ProductFilters {
  status?: 'active' | 'inactive';
  category_id?: string;
  search?: string;
  low_stock?: boolean;
}

export interface ProductListParams {
  vendorId: string;
  filters?: ProductFilters;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'name' | 'price' | 'stock_quantity';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get all products for a vendor
 */
export async function getVendorProducts(params: ProductListParams) {
  const {
    vendorId,
    filters = {},
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  let query = supabase
    .from('products')
    .select('*, categories(name, slug)', { count: 'exact' })
    .eq('vendor_id', vendorId);

  // Apply filters
  if (filters.status !== undefined) {
    query = query.eq('is_active', filters.status === 'active');
  }

  if (filters.category_id) {
    query = query.eq('category_id', filters.category_id);
  }

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
  }

  if (filters.low_stock) {
    query = query.lte('stock_quantity', supabase.raw('low_stock_threshold'));
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  return {
    data: data as Product[],
    error,
    count: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get single product
 */
export async function getProduct(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .eq('id', productId)
    .single();

  return { data: data as Product, error };
}

/**
 * Create new product
 */
export async function createProduct(productData: ProductInsert) {
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  return { data: data as Product, error };
}

/**
 * Update product
 */
export async function updateProduct(productId: string, updates: ProductUpdate) {
  const { data, error } = await supabase
    .from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select()
    .single();

  return { data: data as Product, error };
}

/**
 * Delete product (soft delete by setting is_active to false)
 */
export async function deleteProduct(productId: string) {
  const { data, error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', productId)
    .select()
    .single();

  return { data: data as Product, error };
}

/**
 * Update inventory/stock quantity
 */
export async function updateInventory(productId: string, quantity: number) {
  const { data, error } = await supabase
    .from('products')
    .update({ 
      stock_quantity: quantity,
      updated_at: new Date().toISOString() 
    })
    .eq('id', productId)
    .select()
    .single();

  return { data: data as Product, error };
}

/**
 * Bulk update inventory
 */
export async function bulkUpdateInventory(updates: Array<{ productId: string; quantity: number }>) {
  const promises = updates.map(({ productId, quantity }) =>
    updateInventory(productId, quantity)
  );

  const results = await Promise.allSettled(promises);
  return results;
}
