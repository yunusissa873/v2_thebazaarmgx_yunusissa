import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, DollarSign, Truck, MapPin, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getOrder, type Order } from '@/lib/supabase/orders';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-600',
  processing: 'bg-purple-600',
  shipped: 'bg-indigo-600',
  delivered: 'bg-green-600',
  cancelled: 'bg-red-600',
  refunded: 'bg-gray-600',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-5 w-5" />,
  processing: <Package className="h-5 w-5" />,
  shipped: <Truck className="h-5 w-5" />,
  delivered: <CheckCircle className="h-5 w-5" />,
  cancelled: <XCircle className="h-5 w-5" />,
  refunded: <XCircle className="h-5 w-5" />,
};

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) {
        setError({ message: 'Order ID is required' });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getOrder(id);
        if (fetchError) {
          setError(fetchError);
        } else {
          setOrder(data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <div className="container-custom py-8">
          <Skeleton className="h-32 w-full bg-netflix-dark-gray mb-6" />
          <Skeleton className="h-64 w-full bg-netflix-dark-gray" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Order Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error?.message || "The order you're looking for doesn't exist."}
          </p>
          <Link to="/orders">
            <Button className="bg-netflix-red hover:bg-netflix-red/90 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/orders">
              <Button variant="ghost" size="icon" className="text-white hover:bg-netflix-medium-gray">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Order Details</h1>
              <p className="text-gray-400 mt-1">Order {order.order_number}</p>
            </div>
          </div>
          <Badge className={`${statusColors[order.status] || 'bg-gray-600'} text-white flex items-center gap-2 px-4 py-2`}>
            {statusIcons[order.status]}
            <span className="capitalize">{order.status}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items
              </h2>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-netflix-medium-gray last:border-0 last:pb-0">
                      <div className="w-20 h-20 bg-netflix-medium-gray rounded flex items-center justify-center flex-shrink-0">
                        <Package className="h-10 w-10 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{item.product_name}</h3>
                        {item.variant_name && (
                          <p className="text-gray-400 text-sm mb-1">Variant: {item.variant_name}</p>
                        )}
                        <p className="text-gray-400 text-sm">
                          Quantity: {item.quantity} × {order.currency} {item.unit_price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold text-lg">
                          {order.currency} {item.total.toLocaleString()}
                        </p>
                        {item.tax > 0 && (
                          <p className="text-gray-400 text-sm">Tax: {order.currency} {item.tax.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No items found</p>
              )}
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </h2>
                <div className="text-gray-300 space-y-1">
                  {order.shipping_address.fullName && (
                    <p className="font-medium text-white">{order.shipping_address.fullName}</p>
                  )}
                  {order.shipping_address.address && <p>{order.shipping_address.address}</p>}
                  {order.shipping_address.city && order.shipping_address.postalCode && (
                    <p>{order.shipping_address.city}, {order.shipping_address.postalCode}</p>
                  )}
                  {order.shipping_address.country && <p>{order.shipping_address.country}</p>}
                  {order.shipping_address.phone && <p className="mt-2">Phone: {order.shipping_address.phone}</p>}
                </div>
              </div>
            )}

            {/* Order Timeline */}
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">Order Placed</p>
                    <p className="text-gray-400 text-sm">{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
                {order.shipped_at && (
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 text-indigo-500 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Order Shipped</p>
                      <p className="text-gray-400 text-sm">{format(new Date(order.shipped_at), 'MMM dd, yyyy HH:mm')}</p>
                      {order.tracking_number && (
                        <p className="text-netflix-red text-sm mt-1">Tracking: {order.tracking_number}</p>
                      )}
                    </div>
                  </div>
                )}
                {order.delivered_at && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Order Delivered</p>
                      <p className="text-gray-400 text-sm">{format(new Date(order.delivered_at), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>
                )}
                {order.cancelled_at && (
                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Order Cancelled</p>
                      <p className="text-gray-400 text-sm">{format(new Date(order.cancelled_at), 'MMM dd, yyyy HH:mm')}</p>
                      {order.cancellation_reason && (
                        <p className="text-gray-400 text-sm mt-1">Reason: {order.cancellation_reason}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>{order.currency} {order.subtotal.toLocaleString()}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Tax</span>
                    <span>{order.currency} {order.tax.toLocaleString()}</span>
                  </div>
                )}
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Shipping</span>
                    <span>{order.currency} {order.shipping_cost.toLocaleString()}</span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-gray-300">
                    <span>Discount</span>
                    <span className="text-green-500">-{order.currency} {order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-netflix-medium-gray pt-3 flex justify-between text-white font-semibold text-lg">
                  <span>Total</span>
                  <span>{order.currency} {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Order Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Number</span>
                  <span className="text-white font-mono">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Date</span>
                  <span className="text-white">{format(new Date(order.created_at), 'MMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <Badge className={statusColors[order.status] || 'bg-gray-600'}>
                    {order.status}
                  </Badge>
                </div>
                {order.tracking_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tracking</span>
                    <span className="text-white font-mono text-xs">{order.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {(order.status === 'shipped' || order.status === 'delivered') && (
              <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Actions</h2>
                <div className="space-y-2">
                  {order.status === 'delivered' && (
                    <Button className="w-full bg-netflix-red hover:bg-netflix-red/90 text-white">
                      Leave a Review
                    </Button>
                  )}
                  <Button variant="outline" className="w-full border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white">
                    Request Return/Refund
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

