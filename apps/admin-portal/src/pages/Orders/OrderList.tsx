import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrders } from '@thebazaar/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thebazaar/ui/card';
import { Button } from '@thebazaar/ui/button';
import { Input } from '@thebazaar/ui/input';
import { Badge } from '@thebazaar/ui/badge';
import { formatCurrency, formatDate } from '@thebazaar/utils';
import { Search, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { OrderFilters } from '@thebazaar/types/admin';

export default function OrderList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<OrderFilters>({});
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, filters],
    queryFn: () => getOrders(filters, page, 20),
  });

  const handleSearch = () => {
    setFilters({ ...filters, search });
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500',
      confirmed: 'bg-blue-500',
      processing: 'bg-purple-500',
      shipped: 'bg-indigo-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
      refunded: 'bg-gray-500',
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">Manage orders, disputes, and refunds</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <select
              className="px-4 py-2 border rounded-md"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>{data?.count || 0} total orders</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {data?.data?.map((order: any) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Package className="h-5 w-5" />
                      <div>
                        <h3 className="font-semibold">{order.order_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.created_at)} • {formatCurrency(order.total || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </Link>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No orders found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


