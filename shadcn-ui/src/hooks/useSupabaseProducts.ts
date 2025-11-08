import { useState, useEffect } from 'react';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  getFeaturedProducts,
  searchProducts,
  type Product,
  type ProductFilters,
} from '@/lib/supabase/products';
import { useProducts as useMockProducts } from '@/hooks/useMockData';

interface UseProductsOptions {
  filters?: ProductFilters;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UseProductOptions {
  enabled?: boolean;
}

/**
 * Hook to fetch products from Supabase with fallback to mock data
 */
export function useSupabaseProducts(options: UseProductsOptions = {}) {
  const { filters, limit, offset, enabled = true } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Fallback to mock data
  const mockProducts = useMockProducts();

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getProducts(filters, limit, offset);

        if (fetchError) {
          // Only log non-schema errors to reduce console noise
          if (fetchError.code !== 'PGRST106' && !fetchError.message?.includes('schema must be one of')) {
            console.warn('Supabase fetch error, using mock data:', fetchError);
          }
          // Fallback to mock data
          const mockData = mockProducts.slice(offset || 0, (offset || 0) + (limit || mockProducts.length));
          setProducts(mockData as any);
        } else {
          setProducts(data || []);
        }
      } catch (err: any) {
        // Only log non-schema errors
        if (err?.code !== 'PGRST106' && !err?.message?.includes('schema must be one of')) {
          console.error('Error fetching products:', err);
        }
        setError(err);
        // Fallback to mock data
        const mockData = mockProducts.slice(offset || 0, (offset || 0) + (limit || mockProducts.length));
        setProducts(mockData as any);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, limit, offset, enabled]);

  return { products, loading, error };
}

/**
 * Hook to fetch a single product by ID
 */
export function useSupabaseProduct(productId: string, options: UseProductOptions = {}) {
  const { enabled = true } = options;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!enabled || !productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getProduct(productId);

        if (fetchError) {
          // Only log non-schema errors
          if (fetchError.code !== 'PGRST106' && !fetchError.message?.includes('schema must be one of')) {
            console.warn('Supabase fetch error:', fetchError);
          }
          setError(fetchError);
        } else {
          setProduct(data);
        }
      } catch (err: any) {
        // Only log non-schema errors
        if (err?.code !== 'PGRST106' && !err?.message?.includes('schema must be one of')) {
          console.error('Error fetching product:', err);
        }
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, enabled]);

  return { product, loading, error };
}

/**
 * Hook to fetch a single product by slug
 */
export function useSupabaseProductBySlug(slug: string, options: UseProductOptions = {}) {
  const { enabled = true } = options;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!enabled || !slug) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getProductBySlug(slug);

        if (fetchError) {
          // Only log non-schema errors
          if (fetchError.code !== 'PGRST106' && !fetchError.message?.includes('schema must be one of')) {
            console.warn('Supabase fetch error:', fetchError);
          }
          setError(fetchError);
        } else {
          setProduct(data);
        }
      } catch (err: any) {
        // Only log non-schema errors
        if (err?.code !== 'PGRST106' && !err?.message?.includes('schema must be one of')) {
          console.error('Error fetching product:', err);
        }
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, enabled]);

  return { product, loading, error };
}

/**
 * Hook to fetch featured products
 */
export function useSupabaseFeaturedProducts(limit: number = 10) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const mockProducts = useMockProducts();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getFeaturedProducts(limit);

        if (fetchError) {
          // Only log non-schema errors to reduce console noise
          if (fetchError.code !== 'PGRST106' && !fetchError.message?.includes('schema must be one of')) {
            console.warn('Supabase fetch error, using mock data:', fetchError);
          }
          const mockData = mockProducts.filter(p => p.is_featured).slice(0, limit);
          setProducts(mockData as any);
        } else {
          setProducts(data || []);
        }
      } catch (err: any) {
        // Only log non-schema errors
        if (err?.code !== 'PGRST106' && !err?.message?.includes('schema must be one of')) {
          console.error('Error fetching featured products:', err);
        }
        setError(err);
        const mockData = mockProducts.filter(p => p.is_featured).slice(0, limit);
        setProducts(mockData as any);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  return { products, loading, error };
}

/**
 * Hook to search products
 */
export function useSupabaseSearchProducts(query: string, limit?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const mockProducts = useMockProducts();

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const search = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await searchProducts(query, limit);

        if (fetchError) {
          // Only log non-schema errors
          if (fetchError.code !== 'PGRST106' && !fetchError.message?.includes('schema must be one of')) {
            console.warn('Supabase search error, using mock data:', fetchError);
          }
          const mockData = mockProducts
            .filter(p => 
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              p.description?.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, limit || mockProducts.length);
          setProducts(mockData as any);
        } else {
          setProducts(data || []);
        }
      } catch (err: any) {
        // Only log non-schema errors
        if (err?.code !== 'PGRST106' && !err?.message?.includes('schema must be one of')) {
          console.error('Error searching products:', err);
        }
        setError(err);
        const mockData = mockProducts
          .filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.description?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, limit || mockProducts.length);
        setProducts(mockData as any);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [query, limit]);

  return { products, loading, error };
}

