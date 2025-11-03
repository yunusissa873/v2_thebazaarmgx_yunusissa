import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';
import type { Product } from '@/data/transformed/products';
import type { Vendor } from '@/data/transformed/vendors';

interface ProductBannerCardProps {
  product: Product;
  vendor: Vendor | null;
  className?: string;
}

export function ProductBannerCard({
  product,
  vendor,
  className,
}: ProductBannerCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isProductInWishlist = isInWishlist(product.product_id);

  const formatPrice = (amount: number) => {
    return product.currency === 'KES'
      ? `KES ${amount.toLocaleString()}`
      : `$${amount.toFixed(2)}`;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.product_id, null, 1);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.product_id);
  };

  // Parse variants to extract storage and colors
  const parseVariants = () => {
    const storageOptions: string[] = [];
    const colorOptions: string[] = [];

    product.variants.forEach((variant) => {
      // Variant name format: "512GB / Phantom Black" or "256GB / Silver" or "100ml"
      const parts = variant.name.split(' / ');
      if (parts.length === 2) {
        const firstPart = parts[0].trim();
        const secondPart = parts[1].trim();
        
        // Check if first part is storage (contains GB, TB, ml, or size)
        if (/\d+\s*(GB|TB|MB|ml|ML)/i.test(firstPart) || /size/i.test(firstPart)) {
          if (!storageOptions.includes(firstPart)) {
            storageOptions.push(firstPart);
          }
          // Second part is color/variant
          if (!colorOptions.includes(secondPart)) {
            colorOptions.push(secondPart);
          }
        } else {
          // First part might be size/color, second part is color/size
          if (/\d+\s*(GB|TB|MB|ml|ML)/i.test(firstPart)) {
            if (!storageOptions.includes(firstPart)) {
              storageOptions.push(firstPart);
            }
          } else {
            if (!colorOptions.includes(firstPart)) {
              colorOptions.push(firstPart);
            }
          }
          
          if (/\d+\s*(GB|TB|MB|ml|ML)/i.test(secondPart)) {
            if (!storageOptions.includes(secondPart)) {
              storageOptions.push(secondPart);
            }
          } else {
            if (!colorOptions.includes(secondPart)) {
              colorOptions.push(secondPart);
            }
          }
        }
      } else {
        // Single part variant - check if it's storage or just a variant name
        if (/\d+\s*(GB|TB|MB|ml|ML)/i.test(variant.name)) {
          if (!storageOptions.includes(variant.name)) {
            storageOptions.push(variant.name);
          }
        } else {
          // Could be a color or other variant type
          if (!colorOptions.includes(variant.name)) {
            colorOptions.push(variant.name);
          }
        }
      }
    });

    return { storageOptions, colorOptions };
  };

  const { storageOptions, colorOptions } = parseVariants();
  const discount = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <Link 
      to={`/product/${product.product_id}`} 
      className={cn('relative h-full w-full flex flex-col group', className)}
    >
      {/* Hero Image Section */}
      <div className="relative flex-1 min-h-[60%] overflow-hidden">
        <img
          src={product.images?.[0] || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-product.jpg';
          }}
        />
        
        {/* Gradient Overlay at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <Badge className="absolute top-4 right-4 bg-netflix-red text-white text-base px-3 py-1.5 font-semibold">
            -{discount}%
          </Badge>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 bg-gradient-to-b from-black via-netflix-dark-gray to-black px-8 md:px-12 py-8 md:py-10">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="flex flex-col space-y-4 md:space-y-5">
            {/* Vendor Link */}
            {vendor && (
              <Link
                to={`/vendors/${vendor.slug}`}
                className="inline-block text-netflix-red hover:text-orange-400 font-medium text-sm md:text-base transition-colors w-fit"
                onClick={(e) => e.stopPropagation()}
              >
                {vendor.name}
              </Link>
            )}

            {/* Product Name */}
            <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold text-white leading-tight line-clamp-2">
              {product.name}
            </h2>

            {/* Description */}
            <p className="text-gray-300 text-base md:text-lg leading-relaxed line-clamp-2">
              {product.short_description || product.description}
            </p>

            {/* Price */}
            <div className="flex items-center gap-3 md:gap-4">
              <span className="text-2xl md:text-3xl font-bold text-netflix-red">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-lg md:text-xl text-gray-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            {/* Variants */}
            {(storageOptions.length > 0 || colorOptions.length > 0) && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                {storageOptions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm font-medium">Storage:</span>
                    <div className="flex flex-wrap gap-2">
                      {storageOptions.map((storage) => (
                        <Badge
                          key={storage}
                          variant="outline"
                          className="bg-netflix-dark-gray/70 border-netflix-medium-gray text-white text-xs px-2.5 py-1"
                        >
                          {storage}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {colorOptions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm font-medium">Colors:</span>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <Badge
                          key={color}
                          variant="outline"
                          className="bg-netflix-dark-gray/70 border-netflix-medium-gray text-white text-xs px-2.5 py-1"
                        >
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons - Icon Only with Tooltips */}
            <div className="flex items-center gap-3 pt-2">
              <TooltipProvider>
                {/* Add to Cart */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleAddToCart}
                      size="icon"
                      className="h-12 w-12 rounded-full bg-netflix-red hover:bg-netflix-red/90 text-white transition-all hover:scale-110"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add to Cart</p>
                  </TooltipContent>
                </Tooltip>

                {/* Wishlist */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleToggleWishlist}
                      size="icon"
                      variant="outline"
                      className={cn(
                        'h-12 w-12 rounded-full border-netflix-medium-gray text-white hover:bg-netflix-medium-gray transition-all hover:scale-110',
                        isProductInWishlist && 'bg-netflix-red border-netflix-red'
                      )}
                    >
                      <Heart
                        className={cn(
                          'h-5 w-5',
                          isProductInWishlist && 'fill-current'
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isProductInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}</p>
                  </TooltipContent>
                </Tooltip>

                {/* View Details */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={`/product/${product.product_id}`} onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-12 w-12 rounded-full border-netflix-medium-gray text-white hover:bg-netflix-medium-gray transition-all hover:scale-110"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
