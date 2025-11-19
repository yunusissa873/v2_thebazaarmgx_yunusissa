import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSystemSettings } from '@/hooks/useMockData';
import vendorsData from '@/data/transformed/vendors';

export default function CartPage() {
  const { loading } = useAuth();
  const { items: cartItems, loading: cartLoading, updateQuantity, removeFromCart, getSubtotal } = useCart();
  const settings = useSystemSettings();

  const subtotal = getSubtotal();
  // Use system settings for free shipping threshold (Nairobi Metro default)
  const shippingThreshold = settings.shipping.free_shipping_threshold_nairobi;
  const shipping = subtotal >= shippingThreshold ? 0 : 500;
  const total = subtotal + shipping;

  const handleUpdateQuantity = async (itemId: string, delta: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  if (loading || cartLoading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <div className="container-custom py-8">
          <Skeleton className="h-64 w-full bg-netflix-dark-gray" />
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-netflix-black">
        <div className="container-custom py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-12 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">Your cart is empty</h2>
              <p className="text-gray-400 mb-6">Add some products to get started</p>
              <Link to="/">
                <Button className="bg-netflix-red hover:bg-netflix-red/90 text-white">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  if (!item.product) return null;
                  
                  const product = item.product;
                  const price = product.price;
                  const compareAtPrice = product.compare_at_price;
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6"
                    >
                      <div className="flex gap-4">
                        <Link to={`/product/${product.product_id}`} className="flex-shrink-0">
                          <img
                            src={product.images?.[0] || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-24 h-32 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-product.jpg';
                            }}
                          />
                        </Link>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <Link
                                to={`/product/${product.product_id}`}
                                className="text-white font-semibold hover:text-netflix-red transition-colors"
                              >
                                {product.name}
                              </Link>
                              {(() => {
                                const vendor = vendorsData.find((v) => v.vendor_id === product.vendor_id);
                                return vendor ? (
                                  <Link
                                    to={`/vendors/${vendor.slug}`}
                                    className="text-gray-400 text-sm hover:text-white transition-colors block mt-1"
                                  >
                                    {vendor.name}
                                  </Link>
                                ) : (
                                  <div className="text-gray-400 text-sm mt-1">Vendor</div>
                                );
                              })()}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 border border-netflix-medium-gray rounded">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-white hover:bg-netflix-medium-gray"
                                  onClick={() => handleUpdateQuantity(item.id, -1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-white font-medium w-8 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-white hover:bg-netflix-medium-gray"
                                  onClick={() => handleUpdateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-bold text-lg">
                                {product.currency} {(price * item.quantity).toLocaleString()}
                              </div>
                              {compareAtPrice && compareAtPrice > price && (
                                <div className="text-gray-400 text-sm line-through">
                                  {product.currency} {(compareAtPrice * item.quantity).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 sticky top-24">
                  <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-gray-400">
                      <span>Subtotal</span>
                      <span>KES {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Shipping</span>
                      <span>
                        {shipping === 0 ? (
                          <span className="text-green-500">Free</span>
                        ) : (
                          `KES ${shipping.toLocaleString()}`
                        )}
                      </span>
                    </div>
                    {subtotal < shippingThreshold && (
                      <div className="text-sm text-gray-500">
                        Add {settings.currency.symbol} {(shippingThreshold - subtotal).toLocaleString()} more for free shipping
                      </div>
                    )}
                  </div>

                  <div className="border-t border-netflix-medium-gray pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold text-lg">Total</span>
                      <span className="text-white font-bold text-2xl">
                        KES {total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white mb-4"
                    size="lg"
                    asChild
                  >
                    <Link to="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>

                  <Link to="/" className="block text-center text-gray-400 hover:text-white text-sm">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

