import { supabase } from './client';

export interface CartItem {
  id: string;
  buyer_id: string;
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all cart items for a user
 */
export async function getCartItems(userId: string): Promise<{ data: CartItem[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('buyer_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  userId: string,
  productId: string,
  variantId: string | null | undefined,
  quantity: number = 1
): Promise<{ data: CartItem | null; error: any }> {
  try {
    // Check if item already exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('buyer_id', userId)
      .eq('product_id', productId)
      .eq('variant_id', variantId || null)
      .single();

    if (existing) {
      // Update quantity if item exists
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();

      return { data, error };
    } else {
      // Insert new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          buyer_id: userId,
          product_id: productId,
          variant_id: variantId || null,
          quantity,
        })
        .select()
        .single();

      return { data, error };
    }
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  userId: string,
  cartItemId: string,
  quantity: number
): Promise<{ data: CartItem | null; error: any }> {
  try {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      return await removeFromCart(userId, cartItemId);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', cartItemId)
      .eq('buyer_id', userId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(
  userId: string,
  cartItemId: string
): Promise<{ data: null; error: any }> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId)
      .eq('buyer_id', userId);

    return { data: null, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Clear all items from cart
 */
export async function clearCart(userId: string): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('buyer_id', userId);

    return { error };
  } catch (error) {
    return { error };
  }
}

