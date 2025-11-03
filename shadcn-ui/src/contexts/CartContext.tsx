import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import * as cartApi from '@/lib/supabase/cart';
import type { CartItem } from '@/lib/supabase/cart';
import productsData from '@/data/transformed/products';
import type { Product } from '@/data/transformed/products';
import { queueSyncOperation } from '@/utils/backgroundSync';

// Extended cart item with product data for display
export interface CartItemWithProduct extends CartItem {
  product?: Product;
}

interface CartContextType {
  items: CartItemWithProduct[];
  loading: boolean;
  addToCart: (productId: string, variantId?: string | null, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  getSubtotal: () => number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'thebazaar_cart';

// Helper to get guest cart from localStorage
function getGuestCart(): Array<{ productId: string; variantId?: string | null; quantity: number }> {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Helper to save guest cart to localStorage
function saveGuestCart(items: Array<{ productId: string; variantId?: string | null; quantity: number }>) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Load product data for cart items
  const loadProductData = useCallback((cartItems: CartItem[]): CartItemWithProduct[] => {
    return cartItems.map((item) => {
      // Get product from mock data (will be replaced with API call later)
      const product = productsData.find((p) => p.product_id === item.product_id);
      return {
        ...item,
        product,
      };
    });
  }, []);

  // Load cart from Supabase or localStorage
  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isSupabaseConfigured = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseUrl !== '';

      if (isAuthenticated && user?.id && isSupabaseConfigured) {
        // Load from Supabase
        try {
          const { data, error } = await cartApi.getCartItems(user.id);
          if (error) {
            console.warn('Supabase cart error (falling back to localStorage):', error);
            // Fall through to localStorage fallback
          } else {
            const itemsWithProducts = loadProductData(data || []);
            setItems(itemsWithProducts);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Supabase cart error (falling back to localStorage):', error);
          // Fall through to localStorage fallback
        }
      }
      
      // Fallback to localStorage for guest users or if Supabase is not configured
      // Load from localStorage for guest users
      const guestCart = getGuestCart();
      const itemsWithProducts = guestCart.map((item) => {
        const product = productsData.find((p) => p.product_id === item.productId);
        // Create a temporary cart item structure
        const tempItem: CartItemWithProduct = {
          id: `guest_${item.productId}_${item.variantId || 'base'}`,
          buyer_id: 'guest',
          product_id: item.productId,
          variant_id: item.variantId || null,
          quantity: item.quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          product,
        };
        return tempItem;
      });
      setItems(itemsWithProducts);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, loadProductData]);

  // Sync guest cart to Supabase when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const guestCart = getGuestCart();
      if (guestCart.length > 0) {
        // Migrate guest cart to Supabase
        Promise.all(
          guestCart.map((item) =>
            cartApi.addToCart(user.id, item.productId, item.variantId, item.quantity).catch(console.error)
          )
        ).then(() => {
          // Clear localStorage after migration
          localStorage.removeItem(CART_STORAGE_KEY);
          // Reload cart
          loadCart();
        });
      } else {
        // Just load cart normally
        loadCart();
      }
    } else if (!isAuthenticated) {
      // Load guest cart
      loadCart();
    }
  }, [isAuthenticated, user?.id, loadCart]);

  // Initial load
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const addToCart = useCallback(
    async (productId: string, variantId?: string | null, quantity: number = 1) => {
      const isOffline = !navigator.onLine;
      
      try {
        if (isAuthenticated && user?.id) {
          if (isOffline) {
            // Queue for background sync when online
            queueSyncOperation('cart', 'add', { productId, variantId, quantity });
            toast.success('Item added to cart (will sync when online)');
            await loadCart(); // Refresh from localStorage
          } else {
            const { data, error } = await cartApi.addToCart(user.id, productId, variantId || null, quantity);
            if (error) {
              // Fallback: queue for sync if API fails
              queueSyncOperation('cart', 'add', { productId, variantId, quantity });
              toast.success('Item added to cart (will sync when online)');
              await loadCart();
            } else {
              toast.success('Item added to cart');
              await loadCart(); // Refresh cart
            }
          }
        } else {
          // Guest: save to localStorage
          const guestCart = getGuestCart();
          const existingIndex = guestCart.findIndex(
            (item) => item.productId === productId && item.variantId === variantId
          );

          if (existingIndex >= 0) {
            guestCart[existingIndex].quantity += quantity;
          } else {
            guestCart.push({ productId, variantId, quantity });
          }

          saveGuestCart(guestCart);
          toast.success('Item added to cart');
          await loadCart(); // Refresh cart
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error('Failed to add item to cart');
      }
    },
    [isAuthenticated, user?.id, loadCart]
  );

  const updateQuantity = useCallback(
    async (cartItemId: string, quantity: number) => {
      const isOffline = !navigator.onLine;
      const item = items.find((i) => i.id === cartItemId);
      
      try {
        if (isAuthenticated && user?.id) {
          if (isOffline && item) {
            // Queue for background sync when online
            queueSyncOperation('cart', 'update', { cartItemId, quantity, productId: item.product_id });
            toast.success('Quantity updated (will sync when online)');
            await loadCart(); // Refresh from localStorage
          } else {
            const { error } = await cartApi.updateCartItem(user.id, cartItemId, quantity);
            if (error) {
              // Fallback: queue for sync if API fails
              if (item) {
                queueSyncOperation('cart', 'update', { cartItemId, quantity, productId: item.product_id });
              }
              toast.success('Quantity updated (will sync when online)');
              await loadCart();
            } else {
              await loadCart(); // Refresh cart
            }
          }
        } else {
          // Guest: update localStorage
          const guestCart = getGuestCart();
          const item = items.find((i) => i.id === cartItemId);
          if (item) {
            const index = guestCart.findIndex(
              (guestItem) => guestItem.productId === item.product_id && guestItem.variantId === item.variant_id
            );
            if (index >= 0) {
              if (quantity <= 0) {
                guestCart.splice(index, 1);
              } else {
                guestCart[index].quantity = quantity;
              }
              saveGuestCart(guestCart);
              await loadCart(); // Refresh cart
            }
          }
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        toast.error('Failed to update quantity');
      }
    },
    [isAuthenticated, user?.id, items, loadCart]
  );

  const removeFromCart = useCallback(
    async (cartItemId: string) => {
      const isOffline = !navigator.onLine;
      const item = items.find((i) => i.id === cartItemId);
      
      try {
        if (isAuthenticated && user?.id) {
          if (isOffline && item) {
            // Queue for background sync when online
            queueSyncOperation('cart', 'remove', { cartItemId, productId: item.product_id });
            toast.success('Item removed from cart (will sync when online)');
            await loadCart(); // Refresh from localStorage
          } else {
            const { error } = await cartApi.removeFromCart(user.id, cartItemId);
            if (error) {
              // Fallback: queue for sync if API fails
              if (item) {
                queueSyncOperation('cart', 'remove', { cartItemId, productId: item.product_id });
              }
              toast.success('Item removed from cart (will sync when online)');
              await loadCart();
            } else {
              toast.success('Item removed from cart');
              await loadCart(); // Refresh cart
            }
          }
        } else {
          // Guest: remove from localStorage
          const item = items.find((i) => i.id === cartItemId);
          if (item) {
            const guestCart = getGuestCart();
            const index = guestCart.findIndex(
              (guestItem) => guestItem.productId === item.product_id && guestItem.variantId === item.variant_id
            );
            if (index >= 0) {
              guestCart.splice(index, 1);
              saveGuestCart(guestCart);
              await loadCart(); // Refresh cart
            }
          }
          toast.success('Item removed from cart');
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast.error('Failed to remove item');
      }
    },
    [isAuthenticated, user?.id, items, loadCart]
  );

  const clearCart = useCallback(async () => {
    try {
      if (isAuthenticated && user?.id) {
        const { error } = await cartApi.clearCart(user.id);
        if (error) {
          toast.error('Failed to clear cart');
          console.error('Error clearing cart:', error);
        } else {
          toast.success('Cart cleared');
          await loadCart(); // Refresh cart
        }
      } else {
        // Guest: clear localStorage
        localStorage.removeItem(CART_STORAGE_KEY);
        await loadCart(); // Refresh cart
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  }, [isAuthenticated, user?.id, loadCart]);

  const getItemCount = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const getSubtotal = useCallback(() => {
    return items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  const refreshCart = useCallback(() => {
    return loadCart();
  }, [loadCart]);

  const value: CartContextType = {
    items,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemCount,
    getSubtotal,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

