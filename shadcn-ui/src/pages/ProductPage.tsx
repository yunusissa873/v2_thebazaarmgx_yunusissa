import { useParams, Link } from 'react-router-dom';
import { Home, ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, CheckCircle, Share2, Facebook, Twitter, Copy, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useProduct, useVendor, useProductReviews, useProducts } from '@/hooks/useMockData';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { mapProductToCard } from '@/utils/productMapper';
import vendorsData from '@/data/transformed/vendors';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Get product from transformed data
  const product = useProduct(id || '');
  const vendor = product ? useVendor(product.vendor_id) : null;
  const reviews = useProductReviews(product?.product_id);
  
  // Get all products for related products
  const allProducts = useProducts();
  const allVendors = vendorsData;

  if (!product) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="text-netflix-red hover:underline text-lg"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const images = product?.images || [];
  const hasMultipleImages = images.length > 1;

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => 
      prev > 0 ? prev - 1 : images.length - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev < images.length - 1 ? prev + 1 : 0
    );
  };

  const formatPrice = (amount: number) => {
    return product?.currency === 'KES'
      ? `KES ${amount.toLocaleString()}`
      : `$${amount.toFixed(2)}`;
  };

  // Get selected variant price
  const selectedVariantData = useMemo(() => {
    if (!product || !selectedVariant) return null;
    return product.variants.find(v => v.variant_id === selectedVariant);
  }, [product, selectedVariant]);

  const displayPrice = useMemo(() => {
    if (!product) return 0;
    return selectedVariantData?.price || product.price;
  }, [product, selectedVariantData]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.product_id, selectedVariant || null, quantity);
  };
  
  // Get related products (same category, different product)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => 
        p.product_id !== product.product_id && 
        p.category_id === product.category_id &&
        p.is_active
      )
      .slice(0, 8)
      .map(p => {
        const v = allVendors.find(v => v.vendor_id === p.vendor_id);
        return mapProductToCard(p, v);
      });
  }, [product, allProducts, allVendors]);

  const handleShare = async (platform?: 'facebook' | 'twitter') => {
    const url = window.location.href;
    const text = `${product?.name} - The Bazaar`;

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    } else {
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    await toggleWishlist(product.product_id);
  };
  
  const isProductInWishlist = product ? isInWishlist(product.product_id) : false;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder-product.jpg';
  };

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Breadcrumb Navigation */}
      <div className="bg-netflix-dark-gray border-b border-netflix-medium-gray">
        <div className="container-custom py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <span className="text-gray-600">/</span>
            {vendor && (
              <>
                <Link
                  to={`/vendors/${vendor.slug}`}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {vendor.name}
                </Link>
                <span className="text-gray-600">/</span>
              </>
            )}
            <span className="text-white">{product?.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-netflix-dark-gray rounded-lg overflow-hidden">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[selectedImageIndex] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}
                  {product?.compare_at_price && product.compare_at_price > (product?.price || 0) && (
                    <Badge className="absolute top-4 left-4 bg-netflix-red text-white border-none">
                      -{Math.round(((product.compare_at_price - (product?.price || 0)) / product.compare_at_price) * 100)}%
                    </Badge>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {hasMultipleImages && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-netflix-red'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
            {vendor && (
              <Link
                to={`/vendors/${vendor.slug}`}
                className="text-netflix-red hover:underline text-sm mb-2 inline-block"
              >
                {vendor.name}
              </Link>
            )}
            <h1 className="text-4xl font-bold text-white mb-4">
              {product?.name}
            </h1>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(product.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-400">
                    {product.rating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-white">
                  {formatPrice(displayPrice)}
                </span>
                {((selectedVariantData?.price && product?.compare_at_price) || 
                  (product?.compare_at_price && product.compare_at_price > displayPrice)) && (
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(selectedVariantData?.price ? 
                      (product?.compare_at_price || 0) : 
                      (product?.compare_at_price || 0))}
                  </span>
                )}
              </div>

              {/* Variant Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="text-white font-medium mb-2 block">Select Variant:</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <Button
                        key={variant.variant_id}
                        variant={selectedVariant === variant.variant_id ? 'default' : 'outline'}
                        onClick={() => setSelectedVariant(variant.variant_id)}
                        className={`${
                          selectedVariant === variant.variant_id
                            ? 'bg-netflix-red border-netflix-red text-white'
                            : 'border-netflix-medium-gray text-white hover:bg-netflix-medium-gray'
                        } ${variant.stock_quantity === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={variant.stock_quantity === 0}
                      >
                        {variant.name}
                        {variant.stock_quantity === 0 && ' (Out of Stock)'}
                      </Button>
                    ))}
                  </div>
                  {selectedVariantData && (
                    <p className="text-gray-400 text-sm mt-2">
                      SKU: {selectedVariantData.sku} | Stock: {selectedVariantData.stock_quantity}
                    </p>
                  )}
                </div>
              )}

              {/* Stock Status */}
              {(!product?.is_active || (product?.stock_quantity || 0) === 0) && (
                <Badge className="bg-red-600 text-white mb-4">
                  Out of Stock
                </Badge>
              )}
              {product?.is_active && (product?.stock_quantity || 0) > 0 && (
                <Badge className="bg-green-600 text-white mb-4">
                  In Stock ({(product?.stock_quantity || 0)} available)
                </Badge>
              )}
            </div>

            {/* Quantity Selector */}
            {product?.is_active && (product?.stock_quantity || 0) > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-white font-medium">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-16 text-center text-white font-semibold">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    className="flex-1 bg-netflix-red hover:bg-netflix-red/90 text-white"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!product?.is_active || (product?.stock_quantity || 0) === 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleToggleWishlist}
                    className={`border-netflix-medium-gray text-white hover:bg-netflix-medium-gray ${
                      isProductInWishlist ? 'bg-netflix-red border-netflix-red' : ''
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isProductInWishlist ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Social Sharing */}
                <div className="pt-4 border-t border-netflix-medium-gray">
                  <label className="text-white font-medium mb-2 block">Share:</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('facebook')}
                      className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
                    >
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare('twitter')}
                      className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShare()}
                      className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Product Description */}
            <div className="pt-6 border-t border-netflix-medium-gray">
              <h2 className="text-xl font-semibold text-white mb-4">
                Description
              </h2>
              <p className="text-gray-400 whitespace-pre-line">
                {product.description || `Discover this premium product from ${vendor?.name || 'our trusted vendor'}. High quality and authentic product with excellent customer support.`}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-6 border-t border-netflix-medium-gray">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-gray-400 border-gray-600">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-netflix-medium-gray">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} {...relatedProduct} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-12 pt-8 border-t border-netflix-medium-gray">
            <h2 className="text-2xl font-semibold text-white mb-6">
              Customer Reviews ({reviews.length})
            </h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.review_id}
                  className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={review.user_image_url} alt={review.user_name} />
                      <AvatarFallback className="bg-netflix-medium-gray text-white">
                        {review.user_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{review.user_name}</h3>
                        {review.is_verified_purchase && (
                          <CheckCircle className="h-4 w-4 text-green-500" title="Verified Purchase" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && (
                        <h4 className="text-white font-medium mb-2">{review.title}</h4>
                      )}
                      <p className="text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-4">
                      {review.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Review ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&q=80';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Q&A Section */}
        <div className="mt-12 pt-8 border-t border-netflix-medium-gray">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Questions & Answers
            </h2>
            <Button
              variant="outline"
              className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
            >
              Ask a Question
            </Button>
          </div>
          <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">No questions yet</p>
            <p className="text-gray-500 text-sm">
              Be the first to ask a question about this product
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

