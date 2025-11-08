-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('buyer', 'vendor', 'admin');
CREATE TYPE subscription_tier AS ENUM ('basic', 'bronze', 'silver', 'gold', 'platinum');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('paystack', 'stripe', 'mpesa', 'card', 'paypal');
CREATE TYPE currency AS ENUM ('KES', 'USD');
CREATE TYPE staff_role AS ENUM ('manager', 'staff', 'viewer');

-- 1. Profiles Table (User Accounts)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'buyer' NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- 2. Vendors Table (Business Information)
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    business_type TEXT,
    business_registration_number TEXT,
    tax_id TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'Kenya',
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_mega_brand BOOLEAN DEFAULT FALSE,
    kyc_status TEXT DEFAULT 'pending',
    kyc_documents JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_slug ON vendors(slug);
CREATE INDEX idx_vendors_profile_id ON vendors(profile_id);
CREATE INDEX idx_vendors_is_verified ON vendors(is_verified);
CREATE INDEX idx_vendors_is_mega_brand ON vendors(is_mega_brand);
CREATE INDEX idx_vendors_rating ON vendors(rating DESC);

-- 3. Vendor Subscriptions Table
CREATE TABLE vendor_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL,
    status TEXT DEFAULT 'active',
    sku_limit INTEGER NOT NULL,
    current_sku_count INTEGER DEFAULT 0,
    monthly_fee DECIMAL(10, 2) NOT NULL,
    currency currency DEFAULT 'KES',
    features JSONB,
    branch_count INTEGER DEFAULT 1,
    branch_discount_percentage DECIMAL(5, 2) DEFAULT 0,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method payment_method,
    last_payment_date TIMESTAMPTZ,
    next_payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_subscriptions_vendor_id ON vendor_subscriptions(vendor_id);
CREATE INDEX idx_vendor_subscriptions_tier ON vendor_subscriptions(tier);
CREATE INDEX idx_vendor_subscriptions_status ON vendor_subscriptions(status);

-- 4. Vendor Staff Table
CREATE TABLE vendor_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role staff_role NOT NULL,
    permissions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    invited_by UUID REFERENCES profiles(id),
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vendor_id, profile_id)
);

CREATE INDEX idx_vendor_staff_vendor_id ON vendor_staff(vendor_id);
CREATE INDEX idx_vendor_staff_profile_id ON vendor_staff(profile_id);

-- 5. Categories Table (4-level hierarchy)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 4),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_level ON categories(level);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- 6. Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    images JSONB,
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    currency currency DEFAULT 'KES',
    sku TEXT,
    barcode TEXT,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    weight DECIMAL(10, 2),
    dimensions JSONB,
    tags TEXT[],
    meta_title TEXT,
    meta_description TEXT,
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vendor_id, slug)
);

CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- 7. Product Variants Table
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT,
    price DECIMAL(10, 2),
    compare_at_price DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    attributes JSONB,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

-- 8. Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID REFERENCES profiles(id),
    vendor_id UUID REFERENCES vendors(id),
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    currency currency DEFAULT 'KES',
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    tracking_number TEXT,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- 9. Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    product_name TEXT NOT NULL,
    variant_name TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 10. Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    subscription_id UUID REFERENCES vendor_subscriptions(id),
    payment_type TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency currency DEFAULT 'KES',
    status payment_status DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    provider_transaction_id TEXT,
    provider_response JSONB,
    metadata JSONB,
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    refund_amount DECIMAL(10, 2),
    refund_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- 11. Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id),
    order_id UUID REFERENCES orders(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    comment TEXT,
    images JSONB,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT TRUE,
    vendor_response TEXT,
    vendor_response_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- 12. Cart Items Table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(buyer_id, product_id, variant_id)
);

CREATE INDEX idx_cart_items_buyer_id ON cart_items(buyer_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- 13. Wishlists Table
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(buyer_id, product_id)
);

CREATE INDEX idx_wishlists_buyer_id ON wishlists(buyer_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);

-- 14. Coupons Table
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase_amount DECIMAL(10, 2),
    max_discount_amount DECIMAL(10, 2),
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_products UUID[],
    applicable_categories UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_vendor_id ON coupons(vendor_id);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);

-- 15. Loyalty Programs Table
CREATE TABLE loyalty_programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    tier TEXT,
    lifetime_points INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vendor_id, buyer_id)
);

CREATE INDEX idx_loyalty_programs_vendor_id ON loyalty_programs(vendor_id);
CREATE INDEX idx_loyalty_programs_buyer_id ON loyalty_programs(buyer_id);

-- 16. Chats Table
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    unread_count_buyer INTEGER DEFAULT 0,
    unread_count_vendor INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(buyer_id, vendor_id)
);

CREATE INDEX idx_chats_buyer_id ON chats(buyer_id);
CREATE INDEX idx_chats_vendor_id ON chats(vendor_id);
CREATE INDEX idx_chats_last_message_at ON chats(last_message_at DESC);

-- 17. Messages Table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    content TEXT NOT NULL,
    translated_content JSONB,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'voice')),
    media_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- 18. Mega Brands Table
CREATE TABLE mega_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    featured_products UUID[],
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_mega_brands_vendor_id ON mega_brands(vendor_id);
CREATE INDEX idx_mega_brands_display_order ON mega_brands(display_order);
CREATE INDEX idx_mega_brands_is_active ON mega_brands(is_active);

-- 19. Audit Log Table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin-specific (alias for profile_id when admin)
    action TEXT NOT NULL,
    target_resource TEXT, -- Legacy column (use resource_type)
    target_resource_id UUID, -- Legacy column (use resource_id)
    resource_type TEXT, -- Type of resource affected (vendor, user, product, order)
    resource_id UUID, -- ID of the resource affected
    details JSONB, -- Legacy column (use changes)
    changes JSONB, -- Changes made (alias for details)
    ip_address INET, -- IP address for security tracking
    user_agent TEXT, -- User agent for security tracking
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_profile_id ON audit_log(profile_id);
CREATE INDEX idx_audit_log_admin_id ON audit_log(admin_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_target_resource ON audit_log(target_resource, target_resource_id);
CREATE INDEX idx_audit_log_resource_type ON audit_log(resource_type);
CREATE INDEX idx_audit_log_resource_id ON audit_log(resource_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

COMMENT ON TABLE audit_log IS 'Logs all admin actions for security and compliance';
COMMENT ON COLUMN audit_log.admin_id IS 'Admin user who performed the action (alias for profile_id when admin)';
COMMENT ON COLUMN audit_log.resource_type IS 'Type of resource affected (vendor, user, product, order)';
COMMENT ON COLUMN audit_log.changes IS 'JSON object containing the changes made (alias for details)';
COMMENT ON COLUMN audit_log.ip_address IS 'IP address of the admin who performed the action';
COMMENT ON COLUMN audit_log.user_agent IS 'User agent of the admin who performed the action';

-- 20. Admin Permissions Table
CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL,
    resource_type TEXT,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_admin_permissions_admin_id ON admin_permissions(admin_id);
CREATE INDEX idx_admin_permissions_permission ON admin_permissions(permission);

-- 21. System Settings Table
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_system_settings_key ON system_settings(key);

-- 22. Support Tickets Table
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_vendor_id ON support_tickets(vendor_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- 23. Vendor Wallets Table
CREATE TABLE vendor_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0,
    currency currency DEFAULT 'KES',
    pending_payouts DECIMAL(12, 2) DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    total_payouts DECIMAL(12, 2) DEFAULT 0,
    last_payout_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_wallets_vendor_id ON vendor_wallets(vendor_id);

-- 24. Escrow Accounts Table
CREATE TABLE escrow_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    amount DECIMAL(12, 2) NOT NULL,
    currency currency DEFAULT 'KES',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'released', 'refunded')),
    held_until TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_escrow_accounts_order_id ON escrow_accounts(order_id);
CREATE INDEX idx_escrow_accounts_status ON escrow_accounts(status);

-- 25. Fraud Alerts Table
CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('suspicious_transaction', 'duplicate_order', 'fake_review', 'vendor_fraud', 'buyer_fraud')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    related_entity_type TEXT NOT NULL CHECK (related_entity_type IN ('order', 'vendor', 'user', 'product')),
    related_entity_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'false_positive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_fraud_alerts_type ON fraud_alerts(type);
CREATE INDEX idx_fraud_alerts_severity ON fraud_alerts(severity);
CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX idx_fraud_alerts_related_entity ON fraud_alerts(related_entity_type, related_entity_id);
CREATE INDEX idx_fraud_alerts_created_at ON fraud_alerts(created_at DESC);

-- 26. Security Events Table
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('failed_login', 'suspicious_activity', 'unauthorized_access', 'data_breach_attempt')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_events_type ON security_events(type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_resolved ON security_events(resolved);
CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);

-- 27. Communication Logs Table
CREATE TABLE communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('vendor_to_buyer', 'buyer_to_vendor', 'admin_to_vendor', 'admin_to_buyer')),
    from_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    subject TEXT,
    message TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('chat', 'email', 'sms', 'notification')),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_communication_logs_type ON communication_logs(type);
CREATE INDEX idx_communication_logs_from_id ON communication_logs(from_id);
CREATE INDEX idx_communication_logs_to_id ON communication_logs(to_id);
CREATE INDEX idx_communication_logs_channel ON communication_logs(channel);
CREATE INDEX idx_communication_logs_created_at ON communication_logs(created_at DESC);

-- 28. Ad Revenue Table
CREATE TABLE ad_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'featured', 'promotion')),
    amount DECIMAL(12, 2) NOT NULL,
    currency currency DEFAULT 'KES',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ad_revenue_vendor_id ON ad_revenue(vendor_id);
CREATE INDEX idx_ad_revenue_ad_type ON ad_revenue(ad_type);
CREATE INDEX idx_ad_revenue_status ON ad_revenue(status);
CREATE INDEX idx_ad_revenue_dates ON ad_revenue(start_date, end_date);


-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE mega_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_revenue ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can do anything with profiles" ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Vendors Policies
CREATE POLICY "Vendors are viewable by everyone" ON vendors FOR SELECT USING (is_verified = true OR profile_id = auth.uid());
CREATE POLICY "Vendors can update own data" ON vendors FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Vendors can insert own data" ON vendors FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Admins can do anything with vendors" ON vendors FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Vendor Subscriptions Policies
CREATE POLICY "Vendors can view own subscriptions" ON vendor_subscriptions FOR SELECT USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Admins can view all subscriptions" ON vendor_subscriptions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products Policies
CREATE POLICY "Active products are viewable by everyone" ON products FOR SELECT USING (is_active = true OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()));
CREATE POLICY "Vendors can manage own products" ON products FOR ALL USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Vendors can delete own products" ON products FOR DELETE USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Admins can do anything with products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders Policies
CREATE POLICY "Buyers can view own orders" ON orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Vendors can view orders for their products" ON orders FOR SELECT USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Vendors can update own orders" ON orders FOR UPDATE USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Cart Items Policies
CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (buyer_id = auth.uid());

-- Wishlists Policies
CREATE POLICY "Users can view own wishlist" ON wishlists FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Users can manage own wishlist" ON wishlists FOR ALL USING (buyer_id = auth.uid());

-- Reviews Policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Vendors can view reviews for own products" ON reviews FOR SELECT USING (
    product_id IN (
        SELECT id FROM products 
        WHERE vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    )
);
CREATE POLICY "Buyers can create reviews" ON reviews FOR INSERT WITH CHECK (buyer_id = auth.uid());
CREATE POLICY "Buyers can update own reviews" ON reviews FOR UPDATE USING (buyer_id = auth.uid());
CREATE POLICY "Vendors can respond to reviews" ON reviews FOR UPDATE USING (
    product_id IN (SELECT id FROM products WHERE vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()))
);

-- Chats Policies
CREATE POLICY "Users can view own chats" ON chats FOR SELECT USING (
    buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Users can create chats" ON chats FOR INSERT WITH CHECK (
    buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Users can update own chats" ON chats FOR UPDATE USING (
    buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Vendors can update own chats" ON chats FOR UPDATE USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);

-- Messages Policies
CREATE POLICY "Users can view messages in their chats" ON messages FOR SELECT USING (
    chat_id IN (
        SELECT id FROM chats WHERE buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    )
);
CREATE POLICY "Users can send messages in their chats" ON messages FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND chat_id IN (
        SELECT id FROM chats WHERE buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    )
);

-- Categories Policies (Public read)
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Product Variants Policies
CREATE POLICY "Product variants are viewable with products" ON product_variants FOR SELECT USING (
    is_active = true OR product_id IN (SELECT id FROM products WHERE vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()))
);
CREATE POLICY "Vendors can manage own product variants" ON product_variants FOR ALL USING (
    product_id IN (SELECT id FROM products WHERE vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()))
);

-- Order Items Policies
CREATE POLICY "Order items viewable with orders" ON order_items FOR SELECT USING (
    order_id IN (
        SELECT id FROM orders WHERE buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    )
);

-- Payments Policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid()) OR
    subscription_id IN (SELECT id FROM vendor_subscriptions WHERE vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()))
);
CREATE POLICY "Vendors can view payments for own orders" ON payments FOR SELECT USING (
    order_id IN (
        SELECT id FROM orders 
        WHERE vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    )
);
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Coupons Policies
CREATE POLICY "Active coupons are viewable by everyone" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Vendors can manage own coupons" ON coupons FOR ALL USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Admins can manage all coupons" ON coupons FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Loyalty Programs Policies
CREATE POLICY "Users can view own loyalty programs" ON loyalty_programs FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Vendors can view loyalty programs for their customers" ON loyalty_programs FOR SELECT USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);

-- Mega Brands Policies
CREATE POLICY "Active mega brands are viewable by everyone" ON mega_brands FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage mega brands" ON mega_brands FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Vendor Staff Policies
CREATE POLICY "Vendor staff can view own vendor staff" ON vendor_staff FOR SELECT USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()) OR profile_id = auth.uid()
);
CREATE POLICY "Vendors can invite staff" ON vendor_staff FOR INSERT WITH CHECK (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Vendors can update staff" ON vendor_staff FOR UPDATE USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Vendors can remove staff" ON vendor_staff FOR DELETE USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);

-- Audit Log Policies
CREATE POLICY "Admins can view audit logs" ON audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Audit logs are immutable" ON audit_log FOR UPDATE USING (false);
CREATE POLICY "Audit logs are permanent" ON audit_log FOR DELETE USING (false);

-- Admin Portal Tables Policies
-- Only admins can manage permissions
CREATE POLICY "Admins can manage permissions" ON admin_permissions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can manage system settings
CREATE POLICY "Admins can manage system settings" ON system_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admins and assigned support staff can view tickets
CREATE POLICY "Admins can view all tickets" ON support_tickets FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (
    user_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);

-- Vendor wallet access
CREATE POLICY "Vendors can view own wallet" ON vendor_wallets FOR SELECT USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);
CREATE POLICY "Admins can view vendor wallets" ON vendor_wallets FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Escrow account access
CREATE POLICY "Vendors can view escrow for own orders" ON escrow_accounts FOR SELECT USING (
    order_id IN (
        SELECT id FROM orders 
        WHERE vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
    )
);
CREATE POLICY "Admins can view escrow accounts" ON escrow_accounts FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can view fraud alerts
CREATE POLICY "Admins can view fraud alerts" ON fraud_alerts FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can view security events
CREATE POLICY "Admins can view security events" ON security_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can view communication logs
CREATE POLICY "Admins can view communication logs" ON communication_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can view ad revenue
CREATE POLICY "Admins can view ad revenue" ON ad_revenue FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
-- NOTE: Inserts into this table should be handled by SECURITY DEFINER functions or triggers.

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_subscriptions_updated_at BEFORE UPDATE ON vendor_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_staff_updated_at BEFORE UPDATE ON vendor_staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON loyalty_programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mega_brands_updated_at BEFORE UPDATE ON mega_brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();