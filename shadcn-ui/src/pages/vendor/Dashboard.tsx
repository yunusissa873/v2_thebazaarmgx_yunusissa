/**
 * Vendor Dashboard Page
 * 
 * Main dashboard with key metrics, charts, and quick actions
 * 
 * @author The Bazaar Development Team
 */

import { useEffect, useState } from 'react';
import { useVendorProfile } from '@/hooks/useVendorProfile';
import { getDashboardStats, getSalesTrend, getTopProducts, getRecentOrders, getOrderStatusCounts } from '@/lib/supabase/vendor/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  AlertCircle,
  Package 
} from 'lucide-react';
import { format } from 'date-fns';

export default function VendorDashboard() {
  const { vendorProfile } = useVendorProfile();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
  });

  useEffect(() => {
    async function loadDashboard() {
      if (!vendorProfile?.id) return;

      setLoading(true);
      try {
        const [statsData, salesData, topProductsData, recentOrdersData, statusCountsData] = await Promise.all([
          getDashboardStats(vendorProfile.id, period),
          getSalesTrend(vendorProfile.id, period),
          getTopProducts(vendorProfile.id, 5),
          getRecentOrders(vendorProfile.id, 5),
          getOrderStatusCounts(vendorProfile.id),
        ]);

        setStats({
          metrics: statsData.data,
          salesTrend: salesData.data,
          topProducts: topProductsData.data,
          recentOrders: recentOrdersData.data,
          statusCounts: statusCountsData.data,
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [vendorProfile, period]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-[#1F1F1F] border-[#2F2F2F]">
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back, {vendorProfile?.business_name || 'Vendor'}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-[#E50914]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {metrics.totalSales?.toLocaleString() || '0'}</div>
            <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-[#E50914]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalOrders || '0'}</div>
            <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#E50914]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {metrics.averageOrderValue?.toFixed(0) || '0'}</div>
            <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pending Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-[#E50914]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingOrders || '0'}</div>
            <p className="text-xs text-gray-400 mt-1">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="bg-[#1F1F1F] border-[#2F2F2F]">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from your store</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-[#141414] rounded-lg">
                  <div>
                    <p className="font-medium">#{order.order_number}</p>
                    <p className="text-sm text-gray-400">
                      {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">KES {parseFloat(order.subtotal?.toString() || '0').toLocaleString()}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No recent orders</p>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {metrics.lowStockCount > 0 && (
        <Card className="bg-[#1F1F1F] border-[#2F2F2F] border-orange-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-500" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>{metrics.lowStockCount} products are running low on stock</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
