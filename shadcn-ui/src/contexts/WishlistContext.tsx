import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import * as wishlistApi from '@/lib/supabase/wishlist';
import type { WishlistItem } from '@/lib/supabase/wishlist';
import productsData from '@/data/transformed/products';
import type { Product } from '@/data/transformed/products';
import { queueSyncOperation } from '@/utils/backgroundSync';

// Extended wishlist item with product data for display
export interface WishlistItemWithProduct extends WishlistItem {
  product?: Product;
}

interface WishlistContextType {
  items: WishlistItemWithProduct[];
  loading: boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (wishlistItemId: string) => Promise<void>;
  removeFromWishlistByProductId: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  getItemCount: () => number;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'thebazaar_wishlist';

// Helper to get guest wishlist from localStorage
function getGuestWishlist(): string[] {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Helper to save guest wishlist to localStorage
function saveGuestWishlist(productIds: string[]) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(productIds));
  } catch (error) {
    console.error('Failed to save wishlist to localStorage:', error);
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Load product data for wishlist items
  const loadProductData = useCallback((wishlistItems: WishlistItem[]): WishlistItemWithProduct[] => {
    return wishlistItems.map((item) => {
      // Get product from mock data (will be replaced with API call later)
      const product = productsData.find((p) => p.product_id === item.product_id);
      return {
        ...item,
        product,
      };
    });
  }, []);

  // Load wishlist from Supabase or localStorage
  const loadWishlist = useCallback(async () => {
    setLoading(true);
    try {
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const isSupabaseConfigured = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co' && supabaseUrl !== '';

      if (isAuthenticated && user?.id && isSupabaseConfigured) {
        // Load from Supabase
        try {
          const { data, error } = await wishlistApi.getWishlistItems(user.id);
          if (error) {
            console.warn('Supabase wishlist error (falling back to localStorage):', error);
            // Fall through to localStorage fallback
          } else {
            const itemsWithProducts = loadProductData(data || []);
            setItems(itemsWithProducts);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.warn('Supabase wishlist error (falling back to localStorage):', error);
          // Fall through to localStorage fallback
        }
      }
      
      // Fallback to localStorage for guest users or if Supabase is not configured
      // Load from localStorage for guest users
      const guestWishlist = getGuestWishlist();
      const itemsWithProducts = guestWishlist.map((productId) => {
        const product = productsData.find((p) => p.product_id === productId);
        // Create a temporary wishlist item structure
        const tempItem: WishlistItemWithProduct = {
          id: `guest_${productId}`,
          buyer_id: 'guest',
          product_id: productId,
          created_at: new Date().toISOString(),
          product,
        };
        return tempItem;
      });
      setItems(itemsWithProducts);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, loadProductData]);

  // Sync guest wishlist to Supabase when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const guestWishlist = getGuestWishlist();
      if (guestWishlist.length > 0) {
        // Migrate guest wishlist to Supabase
        Promise.all(
          guestWishlist.map((productId) =>
            wishlistApi.addToWishlist(user.id, productId).catch(console.error)
          )
        ).then(() => {
          // Clear localStorage after migration
          localStorage.removeItem(WISHLIST_STORAGE_KEY);
          // Reload wishlist
          loadWishlist();
        });
      } else {
        // Just load wishlist normally
        loadWishlist();
      }
    } else if (!isAuthenticated) {
      // Load guest wishlist
      loadWishlist();
    }
  }, [isAuthenticated, user?.id, loadWishlist]);

  // Initial load
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const addToWishlist = useCallback(
    async (productId: string) => {
      const isOffline = !navigator.onLine;
      
      try {
        if (isAuthenticated && user?.id) {
          if (isOffline) {
            // Queue for background sync when online
            queueSyncOperation('wishlist', 'add', { productId });
            toast.success('Added to wishlist (will sync when online)');
            await loadWishlist(); // Refresh from localStorage
          } else {
            const { data, error } = await wishlistApi.addToWishlist(user.id, productId);
            if (error) {
              // Fallback: queue for sync if API fails
              queueSyncOperation('wishlist', 'add', { productId });
              toast.success('Added to wishlist (will sync when online)');
              await loadWishlist();
            } else {
              toast.success('Added to wishlist');
              await loadWishlist(); // Refresh wishlist
            }
          }
        } else {
          // Guest: save to localStorage
          const guestWishlist = getGuestWishlist();
          if (!guestWishlist.includes(productId)) {
            guestWishlist.push(productId);
            saveGuestWishlist(guestWishlist);
            toast.success('Added to wishlist');
            await loadWishlist(); // Refresh wishlist
          }
        }
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        toast.error('Failed to add to wishlist');
      }
    },
    [isAuthenticated, user?.id, loadWishlist]
  );

  const removeFromWishlist = useCallback(
    async (wishlistItemId: string) => {
      const isOffline = !navigator.onLine;
      const item = items.find((i) => i.id === wishlistItemId);
      
      try {
        if (isAuthenticated && user?.id) {
          if (isOffline && item) {
            // Queue for background sync when online
            queueSyncOperation('wishlist', 'remove', { wishlistItemId, productId: item.product_id });
            toast.success('Removed from wishlist (will sync when online)');
            await loadWishlist(); // Refresh from localStorage
          } else {
            const { error } = await wishlistApi.removeFromWishlist(user.id, wishlistItemId);
            if (error) {
              // Fallback: queue for sync if API fails
              if (item) {
                queueSyncOperation('wishlist', 'remove', { wishlistItemId, productId: item.product_id });
              }
              toast.success('Removed from wishlist (will sync when online)');
              await loadWishlist();
            } else {
              toast.success('Removed from wishlist');
              await loadWishlist(); // Refresh wishlist
            }
          }
        } else {
          // Guest: remove from localStorage
          const item = items.find((i) => i.id === wishlistItemId);
          if (item) {
            const guestWishlist = getGuestWishlist();
            const index = guestWishlist.indexOf(item.product_id);
            if (index >= 0) {
              guestWishlist.splice(index, 1);
              saveGuestWishlist(guestWishlist);
              await loadWishlist(); // Refresh wishlist
            }
          }
          toast.success('Removed from wishlist');
        }
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        toast.error('Failed to remove from wishlist');
      }
    },
    [isAuthenticated, user?.id, items, loadWishlist]
  );

  const removeFromWishlistByProductId = useCallback(
    async (productId: string) => {
      try {
        if (isAuthenticated && user?.id) {
          const { error } = await wishlistApi.removeFromWishlistByProductId(user.id, productId);
          if (error) {
            toast.error('Failed to remove from wishlist');
            console.error('Error removing from wishlist:', error);
          } else {
            toast.success('Removed from wishlist');
            await loadWishlist(); // Refresh wishlist
          }
        } else {
          // Guest: remove from localStorage
          const guestWishlist = getGuestWishlist();
          const index = guestWishlist.indexOf(productId);
          if (index >= 0) {
            guestWishlist.splice(index, 1);
            saveGuestWishlist(guestWishlist);
            await loadWishlist(); // Refresh wishlist
          }
          toast.success('Removed from wishlist');
        }
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        toast.error('Failed to remove from wishlist');
      }
    },
    [isAuthenticated, user?.id, loadWishlist]
  );

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return items.some((item) => item.product_id === productId);
    },
    [items]
  );

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (isInWishlist(productId)) {
        const item = items.find((i) => i.product_id === productId);
        if (item) {
          await removeFromWishlist(item.id);
        }
      } else {
        await addToWishlist(productId);
      }
    },
    [items, isInWishlist, addToWishlist, removeFromWishlist]
  );

  const getItemCount = useCallback(() => {
    return items.length;
  }, [items]);

  const refreshWishlist = useCallback(() => {
    return loadWishlist();
  }, [loadWishlist]);

  const value: WishlistContextType = {
    items,
    loading,
    addToWishlist,
    removeFromWishlist,
    removeFromWishlistByProductId,
    isInWishlist,
    toggleWishlist,
    getItemCount,
    refreshWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

