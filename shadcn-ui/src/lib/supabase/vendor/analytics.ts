/**
 * Vendor Analytics API Layer
 * 
 * Supabase functions for analytics and reporting
 * 
 * @author The Bazaar Development Team
 */

import { supabase } from '../client';
import type { Database } from '@/types/database';

export interface AnalyticsPeriod {
  start: string;
  end: string;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(vendorId: string, period?: AnalyticsPeriod) {
  let orderQuery = supabase
    .from('orders')
    .select('subtotal, created_at, status')
    .eq('vendor_id', vendorId);

  if (period) {
    orderQuery = orderQuery.gte('created_at', period.start).lte('created_at', period.end);
  }

  const { data: orders, error: ordersError } = await orderQuery;

  if (ordersError) {
    return { data: null, error: ordersError };
  }

  // Calculate stats
  const totalSales = orders?.reduce((sum: number, order: any) => sum + parseFloat(order.subtotal?.toString() || '0'), 0) || 0;
  const totalOrders = orders?.length || 0;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const pendingOrders = orders?.filter((o: any) => o.status === 'pending').length || 0;

  // Get low stock products
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('id, name, stock_quantity, low_stock_threshold')
    .eq('vendor_id', vendorId)
    .lte('stock_quantity', supabase.raw('low_stock_threshold'))
    .eq('is_active', true)
    .limit(10);

  return {
    data: {
      totalSales,
      totalOrders,
      averageOrderValue,
      pendingOrders,
      lowStockCount: lowStockProducts?.length || 0,
    },
    error: null,
  };
}

/**
 * Get sales trend over time
 */
export async function getSalesTrend(vendorId: string, period: AnalyticsPeriod) {
  const { data, error } = await supabase
    .from('orders')
    .select('created_at, subtotal')
    .eq('vendor_id', vendorId)
    .gte('created_at', period.start)
    .lte('created_at', period.end)
    .order('created_at', { ascending: true });

  if (error) {
    return { data: null, error };
  }

  // Group by date
  const trendMap = new Map<string, number>();
  data?.forEach((order: any) => {
    const date = new Date(order.created_at).toISOString().split('T')[0];
    const current = trendMap.get(date) || 0;
    trendMap.set(date, current + parseFloat(order.subtotal?.toString() || '0'));
  });

  const trend = Array.from(trendMap.entries()).map(([date, value]) => ({
    date,
    value,
  }));

  return { data: trend, error: null };
}

/**
 * Get top products
 */
export async function getTopProducts(vendorId: string, limit: number = 10) {
  const { data, error } = await supabase
    .from('order_items')
    .select('product_id, quantity, products(name, images, price)')
        .eq('order_id', 
          supabase
            .from('orders')
            .select('id')
            .eq('vendor_id', vendorId)
        )
    .limit(limit);

  if (error) {
    return { data: null, error };
  }

  // Aggregate by product
  const productMap = new Map<string, { name: string; images: any; price: number; totalQuantity: number }>();
  
  data?.forEach((item: any) => {
    const productId = item.product_id;
    const existing = productMap.get(productId) || {
      name: '',
      images: null,
      price: 0,
      totalQuantity: 0,
    };
    productMap.set(productId, {
      ...existing,
      totalQuantity: existing.totalQuantity + (item.quantity || 0),
    });
  });

  const topProducts = Array.from(productMap.entries())
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity);

  return { data: topProducts.slice(0, limit), error: null };
}

/**
 * Get recent orders
 */
export async function getRecentOrders(vendorId: string, limit: number = 10) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), profiles(full_name)')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data: data as any[], error };
}

/**
 * Get order status counts
 */
export async function getOrderStatusCounts(vendorId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('status')
    .eq('vendor_id', vendorId);

  if (error) {
    return { data: null, error };
  }

  const counts: Record<string, number> = {};
  data?.forEach((order: any) => {
    const status = order.status || 'unknown';
    counts[status] = (counts[status] || 0) + 1;
  });

  return { data: counts, error: null };
}
