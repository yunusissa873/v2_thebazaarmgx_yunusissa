import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@thebazaar/ui/card';
import { getPlatformKPIs } from '@thebazaar/supabase/admin';
import { formatCurrency, formatNumber } from '@thebazaar/utils';
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Shield,
} from 'lucide-react';

export default function Dashboard() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['platform-kpis'],
    queryFn: getPlatformKPIs,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: formatNumber(kpis?.total_users || 0),
      icon: Users,
      description: 'Registered users',
      trend: '+12%',
    },
    {
      title: 'Total Vendors',
      value: formatNumber(kpis?.total_vendors || 0),
      icon: Store,
      description: 'Active vendors',
      trend: '+5%',
    },
    {
      title: 'Total Products',
      value: formatNumber(kpis?.total_products || 0),
      icon: Package,
      description: 'Active products',
      trend: '+8%',
    },
    {
      title: 'Total Orders',
      value: formatNumber(kpis?.total_orders || 0),
      icon: ShoppingCart,
      description: 'All-time orders',
      trend: '+15%',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(kpis?.total_revenue || 0),
      icon: DollarSign,
      description: 'Gross revenue',
      trend: '+20%',
    },
    {
      title: 'Pending Approvals',
      value: formatNumber(kpis?.pending_vendor_approvals || 0),
      icon: AlertCircle,
      description: 'Vendor approvals',
      trend: null,
      variant: 'destructive' as const,
    },
    {
      title: 'Active Subscriptions',
      value: formatNumber(kpis?.active_subscriptions || 0),
      icon: TrendingUp,
      description: 'Monthly subscriptions',
      trend: '+3%',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(kpis?.monthly_recurring_revenue || 0),
      icon: DollarSign,
      description: 'MRR',
      trend: '+18%',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and key metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                  {stat.trend && (
                    <span className="text-green-600 font-medium">{stat.trend}</span>
                  )}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Vendor Approvals</p>
                <p className="text-sm text-muted-foreground">Pending KYC reviews</p>
              </div>
              <div className="text-2xl font-bold text-destructive">
                {kpis?.pending_vendor_approvals || 0}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Disputes</p>
                <p className="text-sm text-muted-foreground">Active disputes</p>
              </div>
              <div className="text-2xl font-bold text-destructive">
                {kpis?.pending_disputes || 0}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Refunds</p>
                <p className="text-sm text-muted-foreground">Pending refunds</p>
              </div>
              <div className="text-2xl font-bold text-destructive">
                {kpis?.pending_refunds || 0}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
              <p className="font-medium">Review Vendor Applications</p>
              <p className="text-sm text-muted-foreground">Approve or reject pending vendors</p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
              <p className="font-medium">Process Refunds</p>
              <p className="text-sm text-muted-foreground">Handle pending refund requests</p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors">
              <p className="font-medium">View Security Alerts</p>
              <p className="text-sm text-muted-foreground">Monitor security events</p>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


