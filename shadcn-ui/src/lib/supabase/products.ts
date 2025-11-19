import { supabase } from './client';
import { shouldSkipSupabase, markSchemaUnavailable, markSchemaAvailable } from './schemaCheck';

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string | null;
  price?: number | null;
  compare_at_price?: number | null;
  stock_quantity: number;
  attributes?: Record<string, any> | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  short_description?: string | null;
  images?: string[] | null;
  price: number;
  compare_at_price?: number | null;
  currency: string;
  sku?: string | null;
  barcode?: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  weight?: number | null;
  dimensions?: Record<string, any> | null;
  tags?: string[] | null;
  meta_title?: string | null;
  meta_description?: string | null;
  view_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variants?: ProductVariant[];
}

export interface ProductFilters {
  categoryId?: string;
  vendorId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  search?: string;
}

/**
 * Get all products with optional filters
 */
export async function getProducts(
  filters?: ProductFilters,
  limit?: number,
  offset?: number
): Promise<{ data: Product[] | null; error: any }> {
  // Skip Supabase if schema is not available
  if (shouldSkipSupabase()) {
    return { data: null, error: { code: 'PGRST106', message: 'Schema not available' } };
  }

  try {
    // Use simpler query first to avoid 406 errors with foreign key relationships
    // Fetch related data separately if needed
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters?.vendorId) {
      query = query.eq('vendor_id', filters.vendorId);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.minRating !== undefined) {
      query = query.gte('rating', filters.minRating);
    }

    if (filters?.inStock) {
      query = query.gt('stock_quantity', 0);
    }

    if (filters?.isFeatured) {
      query = query.eq('is_featured', true);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.range(offset, offset + (limit || 100) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      // Check if it's a schema/table missing error (PGRST106)
      if (error.code === 'PGRST106' || error.message?.includes('schema must be one of')) {
        // Mark schema as unavailable to skip future requests
        markSchemaUnavailable();
        // Tables don't exist yet - this is expected if schema hasn't been set up
        // Don't log as error, just return null data
        return { data: null, error };
      }
      // For other errors, log them
      console.error('Supabase products query error:', error);
      return { data: null, error };
    }

    // If we got data successfully, mark schema as available
    if (data && data.length > 0) {
      markSchemaAvailable();
    }

    // If we got products, fetch related data separately
    if (data && data.length > 0) {
      // Fetch vendors
      const vendorIds = [...new Set(data.map(p => p.vendor_id).filter(Boolean))];
      let vendors: any[] = [];
      if (vendorIds.length > 0) {
        const { data: vendorsData } = await supabase
          .from('vendors')
          .select('id, name, slug')
          .in('id', vendorIds);
        vendors = vendorsData || [];
      }

      // Fetch categories
      const categoryIds = [...new Set(data.map(p => p.category_id).filter(Boolean))];
      let categories: any[] = [];
      if (categoryIds.length > 0) {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name, slug')
          .in('id', categoryIds);
        categories = categoriesData || [];
      }

      // Fetch variants for all products
      const productIds = data.map(p => p.id);
      let variants: any[] = [];
      if (productIds.length > 0) {
        const { data: variantsData } = await supabase
          .from('product_variants')
          .select('*')
          .in('product_id', productIds)
          .eq('is_active', true);
        variants = variantsData || [];
      }

      // Combine the data
      const transformedData = data.map(product => ({
        ...product,
        vendor: vendors.find(v => v.id === product.vendor_id) || null,
        category: categories.find(c => c.id === product.category_id) || null,
        variants: variants.filter(v => v.product_id === product.id) || [],
        images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
      }));

      return { data: transformedData, error: null };
    }

    return { data: null, error };
  } catch (error) {
    console.error('Supabase products fetch error:', error);
    return { data: null, error };
  }
}

/**
 * Get a single product by ID
 */
export async function getProduct(productId: string): Promise<{ data: Product | null; error: any }> {
  // Skip Supabase if schema is not available
  if (shouldSkipSupabase()) {
    return { data: null, error: { code: 'PGRST106', message: 'Schema not available' } };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !data) {
      // Check if it's a schema/table missing error (PGRST106)
      if (error?.code === 'PGRST106' || error?.message?.includes('schema must be one of')) {
        // Mark schema as unavailable to skip future requests
        markSchemaUnavailable();
        // Tables don't exist yet - this is expected if schema hasn't been set up
        return { data: null, error };
      }
      return { data: null, error };
    }

    // If we got data successfully, mark schema as available
    markSchemaAvailable();

    // Fetch related data separately
    let vendor = null;
    if (data.vendor_id) {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id, name, slug')
        .eq('id', data.vendor_id)
        .single();
      vendor = vendorData || null;
    }

    let category = null;
    if (data.category_id) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', data.category_id)
        .single();
      category = categoryData || null;
    }

    // Fetch variants
    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true);

    // Transform images from JSONB to array
    const transformedData = {
      ...data,
      vendor,
      category,
      variants: variantsData || [],
      images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
    };

    return { data: transformedData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<{ data: Product | null; error: any }> {
  // Skip Supabase if schema is not available
  if (shouldSkipSupabase()) {
    return { data: null, error: { code: 'PGRST106', message: 'Schema not available' } };
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      // Check if it's a schema/table missing error (PGRST106)
      if (error?.code === 'PGRST106' || error?.message?.includes('schema must be one of')) {
        // Mark schema as unavailable to skip future requests
        markSchemaUnavailable();
        // Tables don't exist yet - this is expected if schema hasn't been set up
        return { data: null, error };
      }
      return { data: null, error };
    }

    // If we got data successfully, mark schema as available
    markSchemaAvailable();

    // Fetch related data separately
    let vendor = null;
    if (data.vendor_id) {
      const { data: vendorData } = await supabase
        .from('vendors')
        .select('id, name, slug')
        .eq('id', data.vendor_id)
        .single();
      vendor = vendorData || null;
    }

    let category = null;
    if (data.category_id) {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('id', data.category_id)
        .single();
      category = categoryData || null;
    }

    // Fetch variants
    const { data: variantsData } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', data.id)
      .eq('is_active', true);

    // Transform images from JSONB to array
    const transformedData = {
      ...data,
      vendor,
      category,
      variants: variantsData || [],
      images: Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []),
    };

    return { data: transformedData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  categoryId: string,
  limit?: number
): Promise<{ data: Product[] | null; error: any }> {
  return getProducts({ categoryId }, limit);
}

/**
 * Get products by vendor
 */
export async function getProductsByVendor(
  vendorId: string,
  limit?: number
): Promise<{ data: Product[] | null; error: any }> {
  return getProducts({ vendorId }, limit);
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 10): Promise<{ data: Product[] | null; error: any }> {
  return getProducts({ isFeatured: true }, limit);
}

/**
 * Search products
 */
export async function searchProducts(
  query: string,
  limit?: number
): Promise<{ data: Product[] | null; error: any }> {
  return getProducts({ search: query }, limit);
}

/**
 * Increment product view count
 */
export async function incrementProductView(productId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase.rpc('increment_product_view', { product_id: productId });
    
    // If RPC doesn't exist, manually update
    if (error && error.code === '42883') {
      const { data: product } = await getProduct(productId);
      if (product) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ view_count: product.view_count + 1 })
          .eq('id', productId);
        
        return { error: updateError };
      }
    }

    return { error };
  } catch (error) {
    return { error };
  }
}


