import { useQuery } from '@tanstack/react-query';
import { supabaseAdmin } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard, TrendingUp } from 'lucide-react';

export default function Subscriptions() {
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions-revenue'],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from('vendor_subscriptions')
        .select('*, vendors(business_name)')
        .order('monthly_fee', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const totalMRR = subscriptions?.reduce((sum, s) => sum + Number(s.monthly_fee || 0), 0) || 0;
  const activeCount = subscriptions?.filter((s) => s.status === 'active').length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Revenue</h1>
        <p className="text-muted-foreground">Manage vendor subscriptions and MRR</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMRR)}</div>
            <p className="text-xs text-muted-foreground">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(activeCount > 0 ? totalMRR / activeCount : 0)}
            </div>
            <p className="text-xs text-muted-foreground">Per vendor</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>Vendor subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {subscriptions?.map((sub: any) => (
                <div key={sub.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{sub.vendors?.business_name || 'Unknown'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Tier: <span className="capitalize">{sub.tier}</span> • SKU Limit: {sub.sku_limit}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Started: {formatDate(sub.start_date)} • Next Payment: {formatDate(sub.next_payment_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(sub.monthly_fee || 0)}</p>
                      <Badge className={sub.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


