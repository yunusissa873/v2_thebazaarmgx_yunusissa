import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Package, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSystemSettings, useUser } from '@/hooks/useMockData';
import { usePayment } from '@/hooks/usePayment';
import { createOrder } from '@/lib/supabase/orders';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface CheckoutFormData {
  // Shipping Address
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  
  // Payment Method
  paymentMethod: 'paystack' | 'flutterwave' | 'mpesa' | 'paypal';
}

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items: cartItems, loading: cartLoading, getSubtotal, clearCart } = useCart();
  const { initializePayment, pollStatus, isProcessing } = usePayment();
  const navigate = useNavigate();
  const settings = useSystemSettings();
  const mockUser = useUser('usr_001'); // Get user data for pre-filling

  const form = useForm<CheckoutFormData>({
    defaultValues: {
      fullName: mockUser?.full_name || '',
      phone: mockUser?.phone || '',
      address: mockUser?.address.street || '',
      city: mockUser?.address.city || '',
      postalCode: mockUser?.address.postal_code || '',
      country: mockUser?.address.country || 'Kenya',
      paymentMethod: (mockUser?.preferred_payment_method || settings.payments.default_method) as 'paystack' | 'flutterwave' | 'mpesa' | 'paypal',
    },
  });

  const subtotal = getSubtotal();
  // Use system settings for shipping threshold (Nairobi Metro default)
  const shippingThreshold = settings.shipping.free_shipping_threshold_nairobi;
  const shipping = subtotal >= shippingThreshold ? 0 : 500;
  const tax = settings.tax.enabled ? subtotal * (settings.tax.rate / 100) : 0;
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user || cartItems.length === 0) {
      toast.error('Please add items to your cart');
      return;
    }

    try {
      // Get the first vendor from cart items (assuming single vendor checkout for now)
      // In a multi-vendor marketplace, you'd need to group by vendor
      const firstItem = cartItems[0];
      if (!firstItem.product) {
        toast.error('Invalid cart items');
        return;
      }

      const vendorId = firstItem.product.vendor_id;

      // Prepare order items from cart
      const orderItems = cartItems.map((item) => {
        if (!item.product) throw new Error('Product not found');
        const product = item.product;
        const itemSubtotal = product.price * item.quantity;
        const itemTax = settings.tax.enabled ? itemSubtotal * (settings.tax.rate / 100) : 0;
        const itemTotal = itemSubtotal + itemTax;

        // Handle both Supabase and mock variant formats
        const variantName = item.variant_id && product.variants 
          ? product.variants.find(v => {
              const variantId = 'id' in v ? v.id : v.variant_id;
              return variantId === item.variant_id;
            })?.name
          : undefined;

        return {
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          quantity: item.quantity,
          unit_price: product.price,
        };
      });

      // Create shipping address object
      const shippingAddress = {
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        country: data.country,
      };

      // Create order
      const { data: order, error: orderError } = await createOrder({
        cartItems: orderItems,
        vendor_id: vendorId,
        shipping_address: shippingAddress,
        subtotal,
        tax,
        shipping_cost: shipping,
        discount: 0,
        total,
        currency: 'KES',
      });

      if (orderError || !order) {
        toast.error(orderError?.message || 'Failed to create order');
        return;
      }

      // Initialize payment
      const { data: paymentResponse, error: paymentError, redirect_url } = await initializePayment({
        order_id: order.id,
        amount: total,
        currency: 'KES',
        payment_method: data.paymentMethod,
        customer_phone: data.paymentMethod === 'mpesa' ? data.phone : undefined,
        metadata: {
          order_number: order.order_number,
        },
      });

      if (paymentError || !paymentResponse) {
        toast.error(paymentError?.message || 'Failed to initialize payment');
        return;
      }

      // Handle redirect URL for payment gateways
      if (redirect_url) {
        window.location.href = redirect_url;
        return;
      }

      // For M-Pesa, poll for payment status (STK Push)
      if (data.paymentMethod === 'mpesa' && paymentResponse.id) {
        toast.info('M-Pesa payment initiated. Please complete the payment on your phone.');
        
        // Start polling for payment status
        const { data: payment, error: pollError } = await pollStatus(paymentResponse.id);

        if (pollError || !payment) {
          toast.error('Payment verification timeout. Please check your payment status.');
          navigate(`/orders/${order.id}`);
          return;
        }

        if (payment.status === 'completed') {
          // Clear cart after successful payment
          await clearCart();
          toast.success('Payment completed successfully!');
          navigate(`/orders/${order.id}`);
        } else {
          toast.error('Payment failed. Please try again.');
          navigate(`/orders/${order.id}`);
        }
      } else {
        // For other payment methods without redirect, navigate to order page
        // The webhook will handle payment completion
        // Store order ID in sessionStorage for callback handling
        sessionStorage.setItem('pending_order_id', order.id);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    }
  };

  if (loading || cartLoading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <div className="container-custom py-8">
          <div className="max-w-4xl mx-auto">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-netflix-black">
        <div className="container-custom py-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checkout Form */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Shipping Address */}
                  <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Shipping Address
                    </h2>

                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        rules={{ required: 'Full name is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Full Name</FormLabel>
                            <FormControl>
                              <Input
                                className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        rules={{ required: 'Phone number is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+254 712 345 678"
                                className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        rules={{ required: 'Address is required' }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Street Address</FormLabel>
                            <FormControl>
                              <Input
                                className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          rules={{ required: 'City is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">City</FormLabel>
                              <FormControl>
                                <Input
                                  className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="postalCode"
                          rules={{ required: 'Postal code is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Postal Code</FormLabel>
                              <FormControl>
                                <Input
                                  className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Country</FormLabel>
                            <FormControl>
                              <Input
                                className="bg-netflix-medium-gray border-netflix-medium-gray text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </h2>

                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              {settings.payments.paystack_enabled && (
                                <div className="flex items-center space-x-2 border border-netflix-medium-gray rounded-lg p-4 hover:border-netflix-red transition-colors">
                                  <RadioGroupItem value="paystack" id="paystack" />
                                  <Label htmlFor="paystack" className="text-white cursor-pointer flex-1">
                                    Paystack (Card & Mobile Money)
                                  </Label>
                                </div>
                              )}
                              {settings.payments.mpesa_enabled && (
                                <div className="flex items-center space-x-2 border border-netflix-medium-gray rounded-lg p-4 hover:border-netflix-red transition-colors">
                                  <RadioGroupItem value="mpesa" id="mpesa" />
                                  <Label htmlFor="mpesa" className="text-white cursor-pointer flex-1">
                                    M-Pesa
                                  </Label>
                                </div>
                              )}
                              {settings.payments.stripe_enabled && (
                                <div className="flex items-center space-x-2 border border-netflix-medium-gray rounded-lg p-4 hover:border-netflix-red transition-colors">
                                  <RadioGroupItem value="flutterwave" id="flutterwave" />
                                  <Label htmlFor="flutterwave" className="text-white cursor-pointer flex-1">
                                    Flutterwave (Cards & Mobile Money)
                                  </Label>
                                </div>
                              )}
                              {settings.payments.stripe_enabled && (
                                <div className="flex items-center space-x-2 border border-netflix-medium-gray rounded-lg p-4 hover:border-netflix-red transition-colors">
                                  <RadioGroupItem value="paypal" id="paypal" />
                                  <Label htmlFor="paypal" className="text-white cursor-pointer flex-1">
                                    PayPal
                                  </Label>
                                </div>
                              )}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6 sticky top-24">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Summary
                    </h2>

                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {cartItems.map((item) => {
                        if (!item.product) return null;
                        const product = item.product;
                        return (
                          <div key={item.id} className="flex gap-3 text-sm">
                            <img
                              src={product.images?.[0] || '/placeholder-product.jpg'}
                              alt={product.name}
                              className="w-16 h-20 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder-product.jpg';
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-white font-medium line-clamp-2">{product.name}</p>
                              <p className="text-gray-400">Qty: {item.quantity}</p>
                              <p className="text-white font-semibold">
                                {product.currency} {(product.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-netflix-medium-gray pt-4 space-y-2 mb-6">
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
                      {settings.tax.enabled && (
                        <div className="flex justify-between text-gray-400">
                          <span>Tax ({settings.tax.rate}% {settings.tax.inclusive ? 'Inclusive' : 'VAT'})</span>
                          <span>KES {tax.toLocaleString()}</span>
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
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Place Order
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      Your payment information is secure and encrypted
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

