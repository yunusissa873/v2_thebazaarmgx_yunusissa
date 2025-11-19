import { supabase } from './client';

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

/**
 * Get all variants for a product
 */
export async function getProductVariants(
  productId: string
): Promise<{ data: ProductVariant[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get a single variant by ID
 */
export async function getVariant(variantId: string): Promise<{ data: ProductVariant | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', variantId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update variant stock quantity
 */
export async function updateVariantStock(
  variantId: string,
  quantity: number
): Promise<{ data: ProductVariant | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .update({
        stock_quantity: quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', variantId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Decrement variant stock (for order processing)
 */
export async function decrementVariantStock(
  variantId: string,
  quantity: number
): Promise<{ data: ProductVariant | null; error: any }> {
  try {
    const { data: variant } = await getVariant(variantId);
    if (!variant) {
      return { data: null, error: { message: 'Variant not found' } };
    }

    const newQuantity = Math.max(0, variant.stock_quantity - quantity);
    return await updateVariantStock(variantId, newQuantity);
  } catch (error) {
    return { data: null, error };
  }
}

