import { supabase } from './client';

export interface WishlistItem {
  id: string;
  buyer_id: string;
  product_id: string;
  created_at: string;
}

/**
 * Get all wishlist items for a user
 */
export async function getWishlistItems(userId: string): Promise<{ data: WishlistItem[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('*')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Add item to wishlist
 */
export async function addToWishlist(
  userId: string,
  productId: string
): Promise<{ data: WishlistItem | null; error: any }> {
  try {
    // Check if item already exists
    const { data: existing } = await supabase
      .from('wishlists')
      .select('*')
      .eq('buyer_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Already in wishlist
      return { data: existing, error: null };
    }

    // Insert new item
    const { data, error } = await supabase
      .from('wishlists')
      .insert({
        buyer_id: userId,
        product_id: productId,
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Remove item from wishlist
 */
export async function removeFromWishlist(
  userId: string,
  wishlistItemId: string
): Promise<{ data: null; error: any }> {
  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlistItemId)
      .eq('buyer_id', userId);

    return { data: null, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(
  userId: string,
  productId: string
): Promise<{ data: boolean; error: any }> {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select('id')
      .eq('buyer_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is fine
      return { data: false, error };
    }

    return { data: !!data, error: null };
  } catch (error) {
    return { data: false, error };
  }
}

/**
 * Remove item from wishlist by product ID (convenience method)
 */
export async function removeFromWishlistByProductId(
  userId: string,
  productId: string
): Promise<{ data: null; error: any }> {
  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('buyer_id', userId)
      .eq('product_id', productId);

    return { data: null, error };
  } catch (error) {
    return { data: null, error };
  }
}

