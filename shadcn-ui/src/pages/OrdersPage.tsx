import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, DollarSign, Eye, Truck, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useMockData';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-600',
  processing: 'bg-purple-600',
  shipped: 'bg-indigo-600',
  delivered: 'bg-green-600',
  cancelled: 'bg-red-600',
};

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  // Get orders for the current user (using first user as mock for now)
  const allOrders = useOrders(user?.id || 'usr_001');

  // Filter orders by status
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return allOrders;
    return allOrders.filter(order => order.status === activeTab);
  }, [allOrders, activeTab]);

  // Get order counts by status
  const orderCounts = useMemo(() => {
    return {
      all: allOrders.length,
      pending: allOrders.filter(o => o.status === 'pending').length,
      shipped: allOrders.filter(o => o.status === 'shipped').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      cancelled: allOrders.filter(o => o.status === 'cancelled').length,
    };
  }, [allOrders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <div className="container-custom py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-netflix-dark-gray" />
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
            <h1 className="text-3xl font-bold text-white">Purchase History</h1>
            <Button
              variant="outline"
              className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
              asChild
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-netflix-dark-gray border-netflix-medium-gray mb-6">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-netflix-red data-[state=active]:text-white text-gray-300"
              >
                All ({orderCounts.all})
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="data-[state=active]:bg-netflix-red data-[state=active]:text-white text-gray-300"
              >
                Active ({orderCounts.pending})
              </TabsTrigger>
              <TabsTrigger 
                value="shipped" 
                className="data-[state=active]:bg-netflix-red data-[state=active]:text-white text-gray-300"
              >
                Shipped ({orderCounts.shipped})
              </TabsTrigger>
              <TabsTrigger 
                value="delivered" 
                className="data-[state=active]:bg-netflix-red data-[state=active]:text-white text-gray-300"
              >
                Completed ({orderCounts.delivered})
              </TabsTrigger>
              <TabsTrigger 
                value="cancelled" 
                className="data-[state=active]:bg-netflix-red data-[state=active]:text-white text-gray-300"
              >
                Cancelled ({orderCounts.cancelled})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
          {filteredOrders.length === 0 ? (
            <div className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-600 mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">No orders yet</h2>
              <p className="text-gray-400 mb-6">Start shopping to see your orders here</p>
              <Link to="/">
                <Button className="bg-netflix-red hover:bg-netflix-red/90 text-white">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-semibold text-white">
                          Order {order.order_number}
                        </h2>
                        <Badge className={statusColors[order.status] || 'bg-gray-600'}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(order.order_date), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{order.currency} {order.total_amount.toLocaleString()}</span>
                        </div>
                        {order.tracking_number && (
                          <div className="flex items-center gap-1">
                            <Truck className="h-4 w-4" />
                            <span className="text-xs">{order.tracking_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-netflix-medium-gray text-white hover:bg-netflix-medium-gray"
                        asChild
                      >
                        <Link to={`/orders/${order.order_id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Track Order
                        </Link>
                      </Button>
                      {(order.status === 'shipped' || order.status === 'delivered') && (
                        <Button
                          variant="outline"
                          className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Return/Refund
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-netflix-medium-gray pt-4">
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.item_id} className="flex items-center gap-4">
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&q=80';
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{item.product_name}</h3>
                            <p className="text-gray-400 text-sm">
                              {item.variant_name && <span>{item.variant_name} • </span>}
                              Quantity: {item.quantity} × {order.currency} {item.unit_price.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-white font-semibold">
                            {order.currency} {item.total_price.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.status === 'shipped' && order.tracking_number && (
                    <div className="mt-4 pt-4 border-t border-netflix-medium-gray flex items-center gap-2 text-netflix-red">
                      <Truck className="h-4 w-4" />
                      <span className="text-sm">Order is on the way • {order.tracking_number}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
            </TabsContent>
          </Tabs>

          {/* Return / Refund Requests Section */}
          <div className="mt-12 bg-netflix-dark-gray rounded-lg border border-netflix-medium-gray p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Return / Refund Requests
              </h2>
              <Button
                variant="outline"
                className="border-netflix-red text-netflix-red hover:bg-netflix-red hover:text-white"
              >
                Request Return
              </Button>
            </div>
            <p className="text-gray-400 text-sm">
              No active return or refund requests at this time.
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

