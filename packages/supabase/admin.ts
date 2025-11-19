import { supabaseAdmin, supabase } from './client';
import type {
  PlatformKPI,
  VendorFilters,
  UserFilters,
  OrderFilters,
  PaymentFilters,
  FinancialReport,
} from '@thebazaar/types/admin';

/**
 * Get platform KPIs for dashboard
 */
export async function getPlatformKPIs(): Promise<PlatformKPI> {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get total vendors
    const { count: totalVendors } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true });

    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get total revenue (sum of all completed payments)
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed');

    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

    // Get pending vendor approvals
    const { count: pendingApprovals } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', false)
      .eq('kyc_status', 'pending');

    // Get pending KYC reviews
    const { count: pendingKYC } = await supabase
      .from('vendors')
      .select('*', { count: 'exact', head: true })
      .eq('kyc_status', 'pending');

    // Get pending disputes
    const { count: pendingDisputes } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['disputed', 'cancelled']);

    // Get pending refunds
    const { data: refundPayments } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'refunded');

    const pendingRefunds = refundPayments?.length || 0;

    // Get active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('vendor_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Calculate MRR (Monthly Recurring Revenue)
    const { data: subscriptions } = await supabase
      .from('vendor_subscriptions')
      .select('monthly_fee')
      .eq('status', 'active');

    const monthlyRecurringRevenue =
      subscriptions?.reduce((sum, s) => sum + Number(s.monthly_fee || 0), 0) || 0;

    return {
      total_users: totalUsers || 0,
      total_vendors: totalVendors || 0,
      total_products: totalProducts || 0,
      total_orders: totalOrders || 0,
      total_revenue: totalRevenue,
      pending_vendor_approvals: pendingApprovals || 0,
      pending_kyc_reviews: pendingKYC || 0,
      pending_disputes: pendingDisputes || 0,
      pending_refunds: pendingRefunds,
      active_subscriptions: activeSubscriptions || 0,
      monthly_recurring_revenue: monthlyRecurringRevenue,
    };
  } catch (error) {
    console.error('Error fetching platform KPIs:', error);
    return {
      total_users: 0,
      total_vendors: 0,
      total_products: 0,
      total_orders: 0,
      total_revenue: 0,
      pending_vendor_approvals: 0,
      pending_kyc_reviews: 0,
      pending_disputes: 0,
      pending_refunds: 0,
      active_subscriptions: 0,
      monthly_recurring_revenue: 0,
    };
  }
}

/**
 * Get vendors with filters
 */
export async function getVendors(filters: VendorFilters = {}, page = 1, limit = 20) {
  try {
    let query = supabaseAdmin.from('vendors').select('*', { count: 'exact' });

    if (filters.status) {
      if (filters.status === 'pending') {
        query = query.eq('is_verified', false).eq('kyc_status', 'pending');
      } else if (filters.status === 'approved') {
        query = query.eq('is_verified', true);
      } else if (filters.status === 'rejected') {
        query = query.eq('kyc_status', 'rejected');
      } else if (filters.status === 'suspended') {
        query = query.eq('is_verified', false).neq('kyc_status', 'pending');
      }
    }

    if (filters.verification !== undefined) {
      query = query.eq('is_verified', filters.verification);
    }

    if (filters.search) {
      query = query.or(
        `business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const offset = (page - 1) * limit;
    const { data, error, count } = await query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    if (error) throw error;

    return { data, count, error: null };
  } catch (error: any) {
    return { data: null, count: 0, error };
  }
}

/**
 * Get single vendor
 */
export async function getVendor(vendorId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Approve vendor
 */
export async function approveVendor(vendorId: string, adminId: string, notes?: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('vendors')
      .update({
        is_verified: true,
        kyc_status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (error) throw error;

    // Log audit action
    await logAuditAction({
      admin_id: adminId,
      action: 'vendor_approved',
      resource_type: 'vendor',
      resource_id: vendorId,
      changes: { is_verified: true, kyc_status: 'approved', notes },
    });

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Reject vendor
 */
export async function rejectVendor(vendorId: string, adminId: string, reason: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('vendors')
      .update({
        is_verified: false,
        kyc_status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (error) throw error;

    // Log audit action
    await logAuditAction({
      admin_id: adminId,
      action: 'vendor_rejected',
      resource_type: 'vendor',
      resource_id: vendorId,
      changes: { is_verified: false, kyc_status: 'rejected', reason },
    });

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Suspend vendor
 */
export async function suspendVendor(vendorId: string, adminId: string, reason: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('vendors')
      .update({
        is_verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendorId)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction({
      admin_id: adminId,
      action: 'vendor_suspended',
      resource_type: 'vendor',
      resource_id: vendorId,
      changes: { is_verified: false, reason },
    });

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Get users with filters
 */
export async function getUsers(filters: UserFilters = {}, page = 1, limit = 20) {
  try {
    let query = supabaseAdmin.from('profiles').select('*', { count: 'exact' });

    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.search) {
      query = query.or(
        `email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const offset = (page - 1) * limit;
    const { data, error, count } = await query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    if (error) throw error;

    return { data, count, error: null };
  } catch (error: any) {
    return { data: null, count: 0, error };
  }
}

/**
 * Get single user
 */
export async function getUser(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Update user
 */
export async function updateUser(userId: string, updates: any, adminId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction({
      admin_id: adminId,
      action: 'user_updated',
      resource_type: 'user',
      resource_id: userId,
      changes: updates,
    });

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Suspend user
 */
export async function suspendUser(userId: string, adminId: string, reason: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        is_verified: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction({
      admin_id: adminId,
      action: 'user_suspended',
      resource_type: 'user',
      resource_id: userId,
      changes: { is_verified: false, reason },
    });

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Get products with filters
 */
export async function getProducts(filters: any = {}, page = 1, limit = 20) {
  try {
    let query = supabaseAdmin.from('products').select('*', { count: 'exact' });

    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id);
    }

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const offset = (page - 1) * limit;
    const { data, error, count } = await query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    if (error) throw error;

    return { data, count, error: null };
  } catch (error: any) {
    return { data: null, count: 0, error };
  }
}

/**
 * Update product
 */
export async function updateProduct(productId: string, updates: any, adminId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction({
      admin_id: adminId,
      action: 'product_updated',
      resource_type: 'product',
      resource_id: productId,
      changes: updates,
    });

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Get orders with filters
 */
export async function getOrders(filters: OrderFilters = {}, page = 1, limit = 20) {
  try {
    let query = supabaseAdmin.from('orders').select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.vendor_id) {
      query = query.eq('vendor_id', filters.vendor_id);
    }

    if (filters.buyer_id) {
      query = query.eq('buyer_id', filters.buyer_id);
    }

    if (filters.search) {
      query = query.ilike('order_number', `%${filters.search}%`);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const offset = (page - 1) * limit;
    const { data, error, count } = await query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    if (error) throw error;

    return { data, count, error: null };
  } catch (error: any) {
    return { data: null, count: 0, error };
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string, adminId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    await logAuditAction({
      admin_id: adminId,
      action: 'order_status_updated',
      resource_type: 'order',
      resource_id: orderId,
      changes: { status },
    });

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Get payments with filters
 */
export async function getPayments(filters: PaymentFilters = {}, page = 1, limit = 20) {
  try {
    let query = supabaseAdmin.from('payments').select('*', { count: 'exact' });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.method) {
      query = query.eq('payment_method', filters.method);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const offset = (page - 1) * limit;
    const { data, error, count } = await query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    if (error) throw error;

    return { data, count, error: null };
  } catch (error: any) {
    return { data: null, count: 0, error };
  }
}

/**
 * Process payout
 */
export async function processPayout(vendorId: string, amount: number, adminId: string) {
  try {
    // This would integrate with payment gateway
    // For now, we'll just log the action
    await logAuditAction({
      admin_id: adminId,
      action: 'payout_processed',
      resource_type: 'vendor',
      resource_id: vendorId,
      changes: { amount, status: 'processed' },
    });

    return { data: { success: true }, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

/**
 * Get financial report
 */
export async function getFinancialReport(dateFrom: string, dateTo: string): Promise<FinancialReport> {
  try {
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('amount, status, payment_method')
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo);

    const revenue = payments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;
    const commissions = revenue * 0.1; // 10% commission
    const payouts = revenue - commissions;

    const { data: subscriptions } = await supabaseAdmin
      .from('vendor_subscriptions')
      .select('monthly_fee')
      .eq('status', 'active')
      .gte('start_date', dateFrom)
      .lte('start_date', dateTo);

    const subscriptionsRevenue = subscriptions?.reduce((sum, s) => sum + Number(s.monthly_fee || 0), 0) || 0;

    return {
      period: `${dateFrom} to ${dateTo}`,
      revenue,
      commissions,
      payouts,
      subscriptions: subscriptionsRevenue,
      ads_revenue: 0, // To be implemented
      promotions_revenue: 0, // To be implemented
      net_profit: revenue - payouts,
    };
  } catch (error) {
    console.error('Error generating financial report:', error);
    return {
      period: `${dateFrom} to ${dateTo}`,
      revenue: 0,
      commissions: 0,
      payouts: 0,
      subscriptions: 0,
      ads_revenue: 0,
      promotions_revenue: 0,
      net_profit: 0,
    };
  }
}

/**
 * Log audit action
 */
export async function logAuditAction(action: {
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, any>;
}) {
  try {
    const { error } = await supabaseAdmin.from('audit_log').insert({
      ...action,
      ip_address: null, // Can be added from request headers
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error logging audit action:', error);
    }
  } catch (error) {
    console.error('Error logging audit action:', error);
  }
}

/**
 * Get audit logs
 */
export async function getAuditLogs(filters: any = {}, page = 1, limit = 50) {
  try {
    let query = supabaseAdmin.from('audit_log').select('*', { count: 'exact' });

    if (filters.admin_id) {
      query = query.eq('admin_id', filters.admin_id);
    }

    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    if (filters.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }

    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const offset = (page - 1) * limit;
    const { data, error, count } = await query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    if (error) throw error;

    return { data, count, error: null };
  } catch (error: any) {
    return { data: null, count: 0, error };
  }
}
