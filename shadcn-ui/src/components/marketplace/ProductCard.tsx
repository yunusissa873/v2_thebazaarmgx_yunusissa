import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  currency?: 'KES' | 'USD';
  images: string[];
  vendorName: string;
  vendorSlug: string;
  rating?: number;
  reviewCount?: number;
  isInStock?: boolean;
  discount?: number;
  className?: string;
}

export function ProductCard({
  id,
  name,
  price,
  compareAtPrice,
  currency = 'KES',
  images,
  vendorName,
  vendorSlug,
  rating = 0,
  reviewCount = 0,
  isInStock = true,
  discount,
  className,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const formatPrice = (amount: number) => {
    return currency === 'KES'
      ? `KES ${amount.toLocaleString()}`
      : `$${amount.toFixed(2)}`;
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement add to cart
    console.log('Add to cart:', id);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsInWishlist(!isInWishlist);
    // TODO: Implement wishlist toggle
    console.log('Toggle wishlist:', id);
  };

  return (
    <Link to={`/product/${id}`}>
      <div
        className={cn(
          'group relative overflow-hidden rounded-lg bg-netflix-dark-gray transition-all duration-300 ease-in-out netflix-card',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container - 85% of card height */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={images[0] || '/placeholder-product.jpg'}
            alt={name}
            className={cn(
              'h-full w-full object-cover transition-all duration-500',
              isHovered && 'scale-110 brightness-110'
            )}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Discount Badge */}
          {discount && (
            <Badge className="absolute top-2 left-2 bg-netflix-red text-white border-none">
              -{discount}%
            </Badge>
          )}

          {/* Out of Stock Overlay */}
          {!isInStock && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick Actions (appear on hover) */}
          <div
            className={cn(
              'absolute top-2 right-2 flex flex-col gap-2 transition-all duration-300',
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            )}
          >
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                'h-9 w-9 rounded-full bg-white/90 hover:bg-white',
                isInWishlist && 'bg-netflix-red hover:bg-netflix-red text-white'
              )}
              onClick={handleToggleWishlist}
            >
              <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current')} />
            </Button>
            {isInStock && (
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 rounded-full bg-white/90 hover:bg-white"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Product Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">
              {name}
            </h3>
            <Link
              to={`/vendors/${vendorSlug}`}
              className="text-gray-300 text-xs hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {vendorName}
            </Link>
          </div>
        </div>

        {/* Price and Rating Section - 15% of card */}
        <div className="p-3 space-y-2">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-white font-bold text-lg">
              {formatPrice(price)}
            </span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-gray-400 text-sm line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>

          {/* Rating */}
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3 w-3',
                      i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-600'
                    )}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-xs">
                {rating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}