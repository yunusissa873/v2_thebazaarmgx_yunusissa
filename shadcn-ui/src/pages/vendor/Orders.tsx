/**
 * Vendor Orders Page
 * 
 * Order management with status filtering and order details
 * 
 * @author The Bazaar Development Team
 */

import { useState, useEffect } from 'react';
import { useVendorProfile } from '@/hooks/useVendorProfile';
import { getVendorOrders } from '@/lib/supabase/vendor/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function VendorOrders() {
  const { vendorProfile } = useVendorProfile();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const statusOptions = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  useEffect(() => {
    async function loadOrders() {
      if (!vendorProfile?.id) return;

      setLoading(true);
      try {
        const result = await getVendorOrders({
          vendorId: vendorProfile.id,
          filters: {
            search,
            status: statusFilter !== 'all' ? statusFilter as any : undefined,
          },
          page,
          limit: 20,
        });
        setOrders(result.data || []);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [vendorProfile, search, statusFilter, page]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500',
      confirmed: 'bg-blue-500/20 text-blue-500',
      processing: 'bg-purple-500/20 text-purple-500',
      shipped: 'bg-indigo-500/20 text-indigo-500',
      delivered: 'bg-green-500/20 text-green-500',
      cancelled: 'bg-red-500/20 text-red-500',
      refunded: 'bg-gray-500/20 text-gray-500',
    };
    return variants[status] || 'bg-gray-500/20 text-gray-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-gray-400">Manage and track your orders</p>
      </div>

      {/* Filters */}
      <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#141414] border-[#2F2F2F] text-white"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {statusOptions.map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(status)}
                  className={`capitalize ${
                    statusFilter === status
                      ? 'bg-[#E50914] hover:bg-[#c11119]'
                      : 'border-[#2F2F2F]'
                  }`}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-[#1F1F1F] border-[#2F2F2F]">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-[#2F2F2F] rounded w-1/4" />
                  <div className="h-4 bg-[#2F2F2F] rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="bg-[#1F1F1F] border-[#2F2F2F] hover:border-[#E50914] transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <Link to={`/vendor/orders/${order.id}`} className="font-semibold hover:text-[#E50914]">
                        #{order.order_number}
                      </Link>
                      <Badge className={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">
                      {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                    {order.profiles && (
                      <p className="text-sm text-gray-400 mt-1">
                        Customer: {order.profiles.full_name || order.profiles.email}
                      </p>
                    )}
                    <p className="text-sm text-gray-400 mt-1">
                      Items: {order.order_items?.length || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold mb-2">
                      KES {parseFloat(order.subtotal?.toString() || '0').toLocaleString()}
                    </p>
                    <Link to={`/vendor/orders/${order.id}`}>
                      <Button variant="outline" className="border-[#2F2F2F]">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
          <CardContent className="py-12 text-center">
            <p className="text-gray-400">No orders found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
