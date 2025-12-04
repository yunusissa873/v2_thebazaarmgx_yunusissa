export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support' | 'analyst';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  permissions: string[];
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface AdminPermission {
  id: string;
  admin_id: string;
  permission: string;
  resource_type?: string;
  granted_at: string;
  granted_by: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface PlatformKPI {
  total_users: number;
  total_vendors: number;
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_vendor_approvals: number;
  pending_kyc_reviews: number;
  pending_disputes: number;
  pending_refunds: number;
  active_subscriptions: number;
  monthly_recurring_revenue: number;
}

export interface VendorFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
  tier?: string;
  verification?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface UserFilters {
  role?: 'buyer' | 'vendor' | 'admin';
  status?: 'active' | 'suspended' | 'banned';
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface OrderFilters {
  status?: string;
  vendor_id?: string;
  buyer_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PaymentFilters {
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  method?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface FinancialReport {
  period: string;
  revenue: number;
  commissions: number;
  payouts: number;
  subscriptions: number;
  ads_revenue: number;
  promotions_revenue: number;
  net_profit: number;
}

export interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'suspicious_activity' | 'unauthorized_access' | 'data_breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address?: string;
  user_agent?: string;
  user_id?: string;
  resolved: boolean;
  created_at: string;
}

export interface FraudAlert {
  id: string;
  type: 'suspicious_transaction' | 'duplicate_order' | 'fake_review' | 'vendor_fraud' | 'buyer_fraud';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  related_entity_type: 'order' | 'vendor' | 'user' | 'product';
  related_entity_id: string;
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface EscrowAccount {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'held' | 'released' | 'refunded';
  held_until?: string;
  released_at?: string;
  created_at: string;
}

export interface VendorWallet {
  id: string;
  vendor_id: string;
  balance: number;
  currency: string;
  pending_payouts: number;
  total_earnings: number;
  total_payouts: number;
  last_payout_at?: string;
  updated_at: string;
}

export interface SubscriptionRevenue {
  vendor_id: string;
  vendor_name: string;
  tier: string;
  monthly_fee: number;
  status: string;
  start_date: string;
  next_payment_date: string;
}

export interface AdRevenue {
  id: string;
  vendor_id?: string;
  ad_type: 'banner' | 'featured' | 'promotion';
  amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface CommunicationLog {
  id: string;
  type: 'vendor_to_buyer' | 'buyer_to_vendor' | 'admin_to_vendor' | 'admin_to_buyer';
  from_id: string;
  to_id: string;
  subject?: string;
  message: string;
  channel: 'chat' | 'email' | 'sms' | 'notification';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
}


