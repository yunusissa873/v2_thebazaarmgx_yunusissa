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
    vendor_responded_at TIMESTAMPTZ,
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
    action TEXT NOT NULL,
    target_resource TEXT,
    target_resource_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_profile_id ON audit_log(profile_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_target_resource ON audit_log(target_resource, target_resource_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);


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
CREATE POLICY "Admins can do anything with products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders Policies
CREATE POLICY "Buyers can view own orders" ON orders FOR SELECT USING (buyer_id = auth.uid());
CREATE POLICY "Vendors can view orders for their products" ON orders FOR SELECT USING (
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
CREATE POLICY "Vendor owners can manage staff" ON vendor_staff FOR ALL USING (
    vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);

-- Audit Log Policies
CREATE POLICY "Admins can view audit logs" ON audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Audit logs are immutable" ON audit_log FOR UPDATE USING (false);
CREATE POLICY "Audit logs are permanent" ON audit_log FOR DELETE USING (false);
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