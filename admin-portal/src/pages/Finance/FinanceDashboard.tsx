import { useQuery } from '@tanstack/react-query';
import { getFinancialReport, getPayments } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, TrendingUp, Wallet, CreditCard, Receipt, BarChart3 } from 'lucide-react';
import { useState } from 'react';

export default function FinanceDashboard() {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['financial-report', dateRange],
    queryFn: () => getFinancialReport(dateRange.from, dateRange.to),
  });

  const { data: recentPayments } = useQuery({
    queryKey: ['recent-payments'],
    queryFn: () => getPayments({}, 1, 10),
  });

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(report?.revenue || 0),
      icon: DollarSign,
      description: 'Gross revenue',
      trend: '+15%',
    },
    {
      title: 'Commissions',
      value: formatCurrency(report?.commissions || 0),
      icon: Receipt,
      description: 'Platform commissions',
      trend: '+12%',
    },
    {
      title: 'Payouts',
      value: formatCurrency(report?.payouts || 0),
      icon: Wallet,
      description: 'Vendor payouts',
      trend: '+18%',
    },
    {
      title: 'Subscriptions',
      value: formatCurrency(report?.subscriptions || 0),
      icon: CreditCard,
      description: 'MRR',
      trend: '+5%',
    },
    {
      title: 'Ads Revenue',
      value: formatCurrency(report?.ads_revenue || 0),
      icon: BarChart3,
      description: 'Advertisement revenue',
      trend: '+25%',
    },
    {
      title: 'Net Profit',
      value: formatCurrency(report?.net_profit || 0),
      icon: TrendingUp,
      description: 'After payouts',
      trend: '+20%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finance Dashboard</h1>
          <p className="text-muted-foreground">Revenue, payouts, and financial overview</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-4 py-2 border rounded-md"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-4 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                  {stat.description}
                  {stat.trend && <span className="text-green-600 font-medium">{stat.trend}</span>}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Period: {dateRange.from} to {dateRange.to}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Product Sales</span>
              <span className="font-medium">{formatCurrency(report?.revenue || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Subscriptions</span>
              <span className="font-medium">{formatCurrency(report?.subscriptions || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Ads Revenue</span>
              <span className="font-medium">{formatCurrency(report?.ads_revenue || 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Promotions</span>
              <span className="font-medium">{formatCurrency(report?.promotions_revenue || 0)}</span>
            </div>
            <div className="border-t pt-4 flex items-center justify-between">
              <span className="font-semibold">Total Revenue</span>
              <span className="font-bold text-lg">{formatCurrency(report?.revenue || 0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments?.data?.slice(0, 5).map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="text-sm font-medium">{formatCurrency(payment.amount || 0)}</p>
                    <p className="text-xs text-muted-foreground">
                      {payment.payment_method} • {formatDate(payment.created_at)}
                    </p>
                  </div>
                  <Badge
                    className={
                      payment.status === 'completed'
                        ? 'bg-green-500'
                        : payment.status === 'pending'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

