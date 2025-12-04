/**
 * Vendor Orders API Layer
 * 
 * Supabase functions for order management
 * 
 * @author The Bazaar Development Team
 */

import { supabase } from '../client';
import type { Database } from '@/types/database';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export interface OrderFilters {
  status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface OrderListParams {
  vendorId: string;
  filters?: OrderFilters;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'order_number' | 'subtotal';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get vendor orders with filters
 */
export async function getVendorOrders(params: OrderListParams) {
  const {
    vendorId,
    filters = {},
    page = 1,
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params;

  let query = supabase
    .from('orders')
    .select('*, order_items(*, products(name, images)), profiles(full_name, email, phone)', { count: 'exact' })
    .eq('vendor_id', vendorId);

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }

  if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  if (filters.search) {
    query = query.or(`order_number.ilike.%${filters.search}%,profiles.full_name.ilike.%${filters.search}%`);
  }

  // Apply sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  return {
    data: data as Order[],
    error,
    count: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get single order details
 */
export async function getOrder(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*, products(*)),
      profiles(*),
      payments(*)
    `)
    .eq('id', orderId)
    .single();

  return { data: data as Order, error };
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderUpdate['status']
) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  return { data: data as Order, error };
}

/**
 * Add tracking number
 */
export async function addTrackingNumber(orderId: string, trackingNumber: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ 
      tracking_number: trackingNumber,
      updated_at: new Date().toISOString() 
    })
    .eq('id', orderId)
    .select()
    .single();

  return { data: data as Order, error };
}

/**
 * Get order statistics
 */
export async function getOrderStats(vendorId: string, period?: { start: string; end: string }) {
  let query = supabase
    .from('orders')
    .select('status, subtotal, created_at')
    .eq('vendor_id', vendorId);

  if (period) {
    query = query.gte('created_at', period.start).lte('created_at', period.end);
  }

  const { data, error } = await query;

  if (error) {
    return { data: null, error };
  }

  const stats = {
    total: data?.length || 0,
    byStatus: {} as Record<string, number>,
    totalRevenue: 0,
    averageOrderValue: 0,
  };

  data?.forEach((order) => {
    stats.byStatus[order.status || 'unknown'] = (stats.byStatus[order.status || 'unknown'] || 0) + 1;
    stats.totalRevenue += parseFloat(order.subtotal?.toString() || '0');
  });

  stats.averageOrderValue = stats.total > 0 ? stats.totalRevenue / stats.total : 0;

  return { data: stats, error: null };
}
