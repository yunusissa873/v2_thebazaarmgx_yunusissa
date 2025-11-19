import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPayments } from '@thebazaar/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thebazaar/ui/card';
import { Button } from '@thebazaar/ui/button';
import { Input } from '@thebazaar/ui/input';
import { Badge } from '@thebazaar/ui/badge';
import { formatCurrency, formatDate } from '@thebazaar/utils';
import { Search, CreditCard } from 'lucide-react';
import type { PaymentFilters } from '@thebazaar/types/admin';

export default function PaymentList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<PaymentFilters>({});
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, filters],
    queryFn: () => getPayments(filters, page, 20),
  });

  const handleSearch = () => {
    setFilters({ ...filters, search });
    setPage(1);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-500',
      pending: 'bg-yellow-500',
      failed: 'bg-red-500',
      refunded: 'bg-gray-500',
    };
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground">Track all payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search payments..."
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
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>{data?.count || 0} total payments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {data?.data?.map((payment: any) => (
                <div key={payment.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <h3 className="font-semibold">{formatCurrency(payment.amount || 0)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_method} • {formatDate(payment.created_at)}
                        </p>
                        <p className="text-sm text-muted-foreground">Order: {payment.order_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                </div>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">No payments found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


