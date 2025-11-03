import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, CreditCard, Package, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSystemSettings, useUser } from '@/hooks/useMockData';
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
  paymentMethod: 'paystack' | 'mpesa' | 'stripe';
}

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items: cartItems, loading: cartLoading, getSubtotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
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
      paymentMethod: (mockUser?.preferred_payment_method || settings.payments.default_method) as 'paystack' | 'mpesa' | 'stripe',
    },
  });

  const subtotal = getSubtotal();
  // Use system settings for shipping threshold (Nairobi Metro default)
  const shippingThreshold = settings.shipping.free_shipping_threshold_nairobi;
  const shipping = subtotal >= shippingThreshold ? 0 : 500;
  const tax = settings.tax.enabled ? subtotal * (settings.tax.rate / 100) : 0;
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    try {
      // TODO: Process payment and create order
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate payment
      toast.success('Order placed successfully!');
      // Navigate to order confirmation page
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
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
                                  <RadioGroupItem value="stripe" id="stripe" />
                                  <Label htmlFor="stripe" className="text-white cursor-pointer flex-1">
                                    Stripe (International Cards)
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

