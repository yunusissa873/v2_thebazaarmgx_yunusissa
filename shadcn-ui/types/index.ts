// Enums
export type UserRole = 'buyer' | 'vendor' | 'admin';
export type SubscriptionTier = 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'paystack' | 'stripe' | 'mpesa' | 'card' | 'paypal';
export type Currency = 'KES' | 'USD';
export type StaffRole = 'manager' | 'staff' | 'viewer';
export type MessageType = 'text' | 'image' | 'file' | 'voice';

// Subscription Tier Definitions
export interface SubscriptionTierConfig {
  tier: SubscriptionTier;
  fee: number | 'TBD';
  skus: number;
  features: string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierConfig> = {
  basic: {
    tier: 'basic',
    fee: 'TBD',
    skus: 0,
    features: ['Directory only', 'Basic listing'],
  },
  bronze: {
    tier: 'bronze',
    fee: 2000,
    skus: 100,
    features: ['B2C selling', '1 user account', 'Basic analytics'],
  },
  silver: {
    tier: 'silver',
    fee: 3500,
    skus: 300,
    features: ['B2B/B2C selling', 'Chat support', 'Voice calls', 'Mini-storefront', '3 user accounts'],
  },
  gold: {
    tier: 'gold',
    fee: 'TBD',
    skus: 500,
    features: ['Advanced analytics', 'Featured listing', 'Priority support', '5 user accounts'],
  },
  platinum: {
    tier: 'platinum',
    fee: 'TBD',
    skus: Infinity,
    features: ['International shipping', 'Premium analytics', 'Carousel placement', 'Unlimited users', 'Dedicated support'],
  },
};

// Branch Discount Configuration
export interface BranchDiscountConfig {
  singleProfileMultipleBranches: number; // 40% discount
  separateProfilesPerBranch: number; // 20% discount
}

export const BRANCH_DISCOUNTS: BranchDiscountConfig = {
  singleProfileMultipleBranches: 0.4, // 40%
  separateProfilesPerBranch: 0.2, // 20%
};

// Database Types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  profile_id: string;
  business_name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  business_type?: string;
  business_registration_number?: string;
  tax_id?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  country: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  is_mega_brand: boolean;
  kyc_status: string;
  kyc_documents?: any;
  created_at: string;
  updated_at: string;
}

export interface VendorSubscription {
  id: string;
  vendor_id: string;
  tier: SubscriptionTier;
  status: string;
  sku_limit: number;
  current_sku_count: number;
  monthly_fee: number;
  currency: Currency;
  features?: any;
  branch_count: number;
  branch_discount_percentage: number;
  start_date: string;
  end_date?: string;
  auto_renew: boolean;
  payment_method?: PaymentMethod;
  last_payment_date?: string;
  next_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface VendorStaff {
  id: string;
  vendor_id: string;
  profile_id: string;
  role: StaffRole;
  permissions?: any;
  is_active: boolean;
  invited_by?: string;
  invited_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  level: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  category_id?: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  images?: any;
  price: number;
  compare_at_price?: number;
  currency: Currency;
  sku?: string;
  barcode?: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  weight?: number;
  dimensions?: any;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  view_count: number;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  sku?: string;
  price?: number;
  compare_at_price?: number;
  stock_quantity: number;
  attributes?: any;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  vendor_id: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  currency: Currency;
  shipping_address?: any;
  billing_address?: any;
  notes?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax: number;
  total: number;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id?: string;
  subscription_id?: string;
  payment_type: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  provider_transaction_id?: string;
  provider_response?: any;
  metadata?: any;
  paid_at?: string;
  refunded_at?: string;
  refund_amount?: number;
  refund_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  buyer_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: any;
  is_verified_purchase: boolean;
  helpful_count: number;
  is_approved: boolean;
  vendor_response?: string;
  vendor_responded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  buyer_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: string;
  buyer_id: string;
  product_id: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  vendor_id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  per_user_limit: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  applicable_products?: string[];
  applicable_categories?: string[];
  created_at: string;
  updated_at: string;
}

export interface LoyaltyProgram {
  id: string;
  vendor_id: string;
  buyer_id: string;
  points: number;
  tier?: string;
  lifetime_points: number;
  last_activity_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  buyer_id: string;
  vendor_id: string;
  last_message?: string;
  last_message_at?: string;
  unread_count_buyer: number;
  unread_count_vendor: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  translated_content?: any;
  message_type: MessageType;
  media_url?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface MegaBrand {
  id: string;
  vendor_id: string;
  brand_name: string;
  logo_url?: string;
  banner_url?: string;
  description?: string;
  featured_products?: string[];
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface ProductWithVendor extends Product {
  vendor: Vendor;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export interface VendorWithSubscription extends Vendor {
  subscription: VendorSubscription;
}

export interface ChatWithMessages extends Chat {
  messages: Message[];
  buyer: Profile;
  vendor: Vendor;
}

// Utility types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sortBy?: 'price' | 'rating' | 'newest' | 'popular';
  sortOrder?: 'asc' | 'desc';
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
}

export interface VendorOnboardingData {
  business_name: string;
  business_type: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  description?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  short_description?: string;
  category_id: string;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  sku?: string;
  images: File[];
  tags?: string[];
}

// Analytics types
export interface VendorAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Product[];
  revenueByMonth: { month: string; revenue: number }[];
}

export interface AdminAnalytics {
  monthlyActiveVendors: number;
  grossMerchandiseVolume: number;
  userRetentionRate: number;
  cartToPurchaseConversion: number;
  vendorSubscriptionRenewalRate: number;
  averageLoadTime: number;
}