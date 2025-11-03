import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { ProductCard } from '@/components/marketplace/ProductCard';
import vendorsData from '@/data/transformed/vendors';

export default function WishlistPage() {
  const { loading } = useAuth();
  const { items: wishlistItems, loading: wishlistLoading, removeFromWishlist } = useWishlist();

  const handleRemoveFromWishlist = async (wishlistItemId: string) => {
    await removeFromWishlist(wishlistItemId);
  };

  if (loading || wishlistLoading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <div className="container-custom py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full bg-netflix-dark-gray" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-netflix-black">
        <div className="container-custom py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
            <span className="text-gray-400">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-12 text-center">
              <Heart className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">Your wishlist is empty</h2>
              <p className="text-gray-400 mb-6">
                Save products you love to your wishlist for easy access later
              </p>
              <Link to="/">
                <Button className="bg-netflix-red hover:bg-netflix-red/90 text-white">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {wishlistItems.map((item) => {
                if (!item.product) return null;
                
                const product = item.product;
                const vendor = vendorsData.find((v) => v.vendor_id === product.vendor_id);
                
                return (
                  <div key={item.id} className="relative group">
                    <ProductCard
                      id={product.product_id}
                      name={product.name}
                      price={product.price}
                      compareAtPrice={product.compare_at_price || undefined}
                      currency={product.currency as 'KES' | 'USD'}
                      images={product.images}
                      vendorName={vendor?.name || 'Vendor'}
                      vendorSlug={vendor?.slug || ''}
                      rating={product.rating}
                      reviewCount={0}
                      isInStock={product.is_active && product.stock_quantity > 0}
                      discount={
                        product.compare_at_price && product.compare_at_price > product.price
                          ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
                          : undefined
                      }
                    />
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-red-600 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

