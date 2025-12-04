-- ============================================================
-- THE BAZAAR - Migration 0001
-- Extensions and Utility Functions
-- ============================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS pg_trgm;          -- Trigram search
CREATE EXTENSION IF NOT EXISTS unaccent;         -- Remove accents for search
CREATE EXTENSION IF NOT EXISTS pgcrypto;         -- Encryption functions

-- ============================================================
-- Utility Functions
-- ============================================================

-- Function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_staff 
        WHERE profile_id = user_id 
        AND is_super_admin = TRUE 
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check if user is vendor
CREATE OR REPLACE FUNCTION is_vendor(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = user_id 
        AND role = 'vendor'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get vendor ID for user
CREATE OR REPLACE FUNCTION get_vendor_id(user_id UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM vendors 
        WHERE profile_id = user_id 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0001 complete: Extensions and utilities installed';
END $$;
-- ============================================================
-- THE BAZAAR - Migration 0002
-- Base Core Tables (Profiles, Vendors, Admin, Settings)
-- ============================================================

-- ============================================================
-- PROFILES TABLE
-- ============================================================
COMMENT ON TABLE profiles IS 'User accounts linked to Supabase Auth';

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('buyer', 'vendor', 'admin', 'super_admin')) DEFAULT 'buyer',
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    phone_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);

COMMENT ON COLUMN profiles.metadata IS 'User preferences: language, currency, notifications, etc.';

-- ============================================================
-- VENDORS TABLE
-- ============================================================
COMMENT ON TABLE vendors IS 'Vendor/seller business information and settings';

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Business Info
    business_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    business_type TEXT,
    business_registration_number TEXT,
    tax_id TEXT,
    
    -- Contact
    phone TEXT,
    email TEXT,
    website TEXT,
    
    -- Address
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'Kenya',
    postal_code TEXT,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    
    -- Ratings & Reviews
    rating NUMERIC(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'active', 'suspended', 'rejected', 'inactive')) DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT FALSE,
    is_mega_brand BOOLEAN DEFAULT FALSE,
    
    -- KYC
    kyc_status TEXT DEFAULT 'pending',
    kyc_documents JSONB DEFAULT '{}'::jsonb,
    kyc_verified_at TIMESTAMPTZ,
    kyc_verified_by UUID REFERENCES profiles(id),
    
    -- Settings
    settings JSONB DEFAULT '{}'::jsonb,
    payout_preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Analytics
    total_sales NUMERIC(12, 2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_slug ON vendors(slug);
CREATE INDEX idx_vendors_profile_id ON vendors(profile_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_is_verified ON vendors(is_verified);
CREATE INDEX idx_vendors_is_mega_brand ON vendors(is_mega_brand);
CREATE INDEX idx_vendors_rating ON vendors(rating DESC);

COMMENT ON COLUMN vendors.settings IS 'Vendor preferences: auto-accept orders, shipping settings, etc.';
COMMENT ON COLUMN vendors.payout_preferences IS 'Bank details, payout schedule, minimum threshold';

-- ============================================================
-- VENDOR SUBSCRIPTIONS TABLE
-- ============================================================
COMMENT ON TABLE vendor_subscriptions IS 'Vendor subscription tiers and billing';

CREATE TABLE vendor_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    tier TEXT CHECK (tier IN ('basic', 'bronze', 'silver', 'gold', 'platinum')) NOT NULL,
    status TEXT DEFAULT 'active',
    sku_limit INTEGER NOT NULL,
    current_sku_count INTEGER DEFAULT 0,
    monthly_fee NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    features JSONB,
    branch_count INTEGER DEFAULT 1,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_subscriptions_vendor_id ON vendor_subscriptions(vendor_id);
CREATE INDEX idx_vendor_subscriptions_tier ON vendor_subscriptions(tier);
CREATE INDEX idx_vendor_subscriptions_status ON vendor_subscriptions(status);

-- ============================================================
-- VENDOR STAFF TABLE
-- ============================================================
COMMENT ON TABLE vendor_staff IS 'Staff members assigned to vendor accounts';

CREATE TABLE vendor_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'manager', 'staff', 'viewer')) NOT NULL,
    permissions JSONB DEFAULT '{}'::jsonb,
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

-- ============================================================
-- ADMIN STAFF TABLE
-- ============================================================
COMMENT ON TABLE admin_staff IS 'Admin portal staff with role-based permissions';

CREATE TABLE admin_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    
    role TEXT CHECK (role IN ('super_admin', 'manager', 'staff', 'viewer')) NOT NULL,
    permissions JSONB DEFAULT '{}'::jsonb,
    
    -- Super Admin Flag
    is_super_admin BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_by UUID REFERENCES profiles(id),
    last_login_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_staff_profile_id ON admin_staff(profile_id);
CREATE INDEX idx_admin_staff_role ON admin_staff(role);
CREATE INDEX idx_admin_staff_is_super_admin ON admin_staff(is_super_admin);
CREATE INDEX idx_admin_staff_is_active ON admin_staff(is_active);

COMMENT ON COLUMN admin_staff.is_super_admin IS 'Super admin has full undiluted control over all 3 portals';

-- ============================================================
-- SYSTEM SETTINGS TABLE
-- ============================================================
COMMENT ON TABLE system_settings IS 'Global system configuration';

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_settings_key ON system_settings(key);

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0002 complete: Base core tables created';
END $$;
-- ============================================================
-- THE BAZAAR - Migration 0003
-- Categories with SEO, Path Slug, and Ancestry
-- ============================================================

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
COMMENT ON TABLE categories IS '5-level category hierarchy with SEO and path tracking';

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Basic Info
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Hierarchy
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
    path_slug TEXT, -- e.g., "electronics/smartphones/apple-iphone"
    full_slug TEXT, -- Same as path_slug (for compatibility)
    ancestry UUID[], -- Array of parent UUIDs [root_id, parent_id, ...]
    depth INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    
    -- SEO
    seo_title TEXT,
    meta_title TEXT, -- Alias for seo_title
    seo_description TEXT,
    meta_description TEXT, -- Alias for seo_description
    meta_keywords TEXT[],
    search_tags TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_leaf BOOLEAN DEFAULT FALSE, -- True if no children
    
    -- Metadata
    total_products INTEGER DEFAULT 0,
    product_count INTEGER DEFAULT 0, -- Alias
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_level ON categories(level);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_is_featured ON categories(is_featured);
CREATE INDEX idx_categories_is_leaf ON categories(is_leaf);
CREATE INDEX idx_categories_path_slug ON categories(path_slug);
CREATE INDEX idx_categories_full_slug ON categories(full_slug);
CREATE INDEX idx_categories_ancestry ON categories USING GIN (ancestry);
CREATE INDEX idx_categories_meta_keywords ON categories USING GIN (meta_keywords);
CREATE INDEX idx_categories_search_tags ON categories USING GIN (search_tags);
CREATE INDEX idx_categories_active_products ON categories(product_count) WHERE is_active = true;

COMMENT ON COLUMN categories.ancestry IS 'Array of parent category UUIDs from root to immediate parent';
COMMENT ON COLUMN categories.path_slug IS 'Full hierarchical path: parent-slug/child-slug';
COMMENT ON COLUMN categories.is_leaf IS 'True if this is a final category with no children';

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0003 complete: Categories table created with SEO and hierarchy support';
END $$;
-- ============================================================
-- THE BAZAAR - Migration 0004
-- Category Attributes System
-- ============================================================

-- ============================================================
-- CATEGORY ATTRIBUTES TABLE
-- ============================================================
COMMENT ON TABLE category_attributes IS 'Attribute definitions per category (e.g., brand, color, size)';

CREATE TABLE category_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    
    -- Attribute Info
    name TEXT NOT NULL, -- e.g., "brand", "color", "size"
    label TEXT, -- Display name e.g., "Brand", "Color", "Size"
    display_name TEXT, -- Alias for label
    description TEXT,
    
    -- Type & Display
    data_type TEXT CHECK (data_type IN ('string', 'number', 'boolean', 'array')) NOT NULL,
    display_type TEXT CHECK (display_type IN ('text', 'select', 'multiselect', 'range', 'checkbox', 'color', 'number')) NOT NULL,
    unit TEXT, -- e.g., "kg", "cm", "L", "GB"
    
    -- Behavior
    canonical BOOLEAN DEFAULT FALSE, -- Required attribute
    required BOOLEAN DEFAULT FALSE, -- Alias for canonical
    is_filterable BOOLEAN DEFAULT TRUE,
    filterable BOOLEAN DEFAULT TRUE, -- Alias
    is_searchable BOOLEAN DEFAULT FALSE,
    is_variant BOOLEAN DEFAULT FALSE, -- Used for product variants
    
    -- Constraints
    options JSONB, -- For select/multiselect types: ["Red", "Blue", "Green"]
    allowed_values TEXT[], -- Array version
    min_value NUMERIC(10, 2), -- For range/number types
    max_value NUMERIC(10, 2),
    
    -- Metadata
    position INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0, -- Alias
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(category_id, name)
);

CREATE INDEX idx_category_attributes_category_id ON category_attributes(category_id);
CREATE INDEX idx_category_attributes_canonical ON category_attributes(canonical);
CREATE INDEX idx_category_attributes_required ON category_attributes(required);
CREATE INDEX idx_category_attributes_filterable ON category_attributes(filterable);
CREATE INDEX idx_category_attributes_display_type ON category_attributes(display_type);
CREATE INDEX idx_category_attributes_is_variant ON category_attributes(is_variant);

COMMENT ON COLUMN category_attributes.canonical IS 'Required attributes (5-7 per category)';
COMMENT ON COLUMN category_attributes.is_variant IS 'Used to create product variants (e.g., size, color)';
COMMENT ON COLUMN category_attributes.options IS 'JSONB array of allowed values for select/multiselect types';

-- ============================================================
-- CATEGORY ATTRIBUTE VALUES TABLE (Optional)
-- ============================================================
COMMENT ON TABLE category_attribute_values IS 'Predefined values for category attributes';

CREATE TABLE category_attribute_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attribute_id UUID NOT NULL REFERENCES category_attributes(id) ON DELETE CASCADE,
    
    value TEXT NOT NULL,
    display_value TEXT,
    color_hex TEXT, -- For color attributes
    image_url TEXT, -- For visual attributes
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(attribute_id, value)
);

CREATE INDEX idx_category_attribute_values_attribute_id ON category_attribute_values(attribute_id);
CREATE INDEX idx_category_attribute_values_is_active ON category_attribute_values(is_active);

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0004 complete: Category attributes system created';
END $$;
-- ============================================================
-- THE BAZAAR - Migration 0005
-- Products, Variants, Brands, Price History
-- ============================================================

-- ============================================================
-- BRANDS TABLE
-- ============================================================
COMMENT ON TABLE brands IS 'Product brands (can be linked to vendors or independent)';

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    website TEXT,
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    meta_keywords TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    country_of_origin TEXT,
    founded_year INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_vendor_id ON brands(vendor_id);
CREATE INDEX idx_brands_is_active ON brands(is_active);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
COMMENT ON TABLE products IS 'Product catalog with SEO, attributes, and inventory tracking';

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    
    -- Basic Info
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    vendor_sku TEXT, -- Vendor's internal SKU
    description TEXT,
    short_description TEXT,
    
    -- Media
    images JSONB, -- Array of image URLs
    video_url TEXT,
    
    -- Pricing
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),
    cost_price NUMERIC(10, 2), -- Vendor's cost
    currency TEXT DEFAULT 'KES',
    
    -- Inventory
    sku TEXT,
    barcode TEXT,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 3,
    track_inventory BOOLEAN DEFAULT TRUE,
    
    -- Physical
    weight NUMERIC(10, 2),
    dimensions JSONB, -- {length, width, height, unit}
    
    -- Attributes (Dynamic JSONB)
    attributes JSONB DEFAULT '{}'::jsonb,
    
    -- SEO
    path_slug TEXT, -- Full path including category
    seo_title TEXT,
    meta_title TEXT,
    seo_description TEXT,
    meta_description TEXT,
    search_keywords TEXT[],
    tags TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_on_sale BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    
    -- Metadata
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(vendor_id, slug),
    UNIQUE(vendor_id, vendor_sku)
);

-- Indexes
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_vendor_sku ON products(vendor_sku);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_path_slug ON products(path_slug);
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);
CREATE INDEX idx_products_search_keywords ON products USING GIN (search_keywords);
CREATE INDEX idx_products_tags ON products USING GIN (tags);
CREATE INDEX idx_products_active_featured ON products(is_featured) WHERE is_active = true;
CREATE INDEX idx_products_trgm_name ON products USING GIN (name gin_trgm_ops);

COMMENT ON COLUMN products.attributes IS 'Dynamic product attributes as JSONB: {brand: "Apple", color: "Black", storage: "256GB"}';
COMMENT ON COLUMN products.vendor_sku IS 'Vendor-specific SKU (unique per vendor)';

-- ============================================================
-- PRODUCT VARIANTS TABLE
-- ============================================================
COMMENT ON TABLE product_variants IS 'Product variations (size, color, etc.)';

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    -- Variant Info
    name TEXT NOT NULL, -- e.g., "Large / Red"
    sku TEXT,
    barcode TEXT,
    
    -- Pricing
    price NUMERIC(10, 2),
    compare_at_price NUMERIC(10, 2),
    cost_price NUMERIC(10, 2),
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    
    -- Variant Attributes
    attributes JSONB DEFAULT '{}'::jsonb, -- {size: "L", color: "Red"}
    
    -- Media
    image_url TEXT,
    
    -- Physical
    weight NUMERIC(10, 2),
    dimensions JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(product_id, sku)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_is_active ON product_variants(is_active);
CREATE INDEX idx_product_variants_attributes ON product_variants USING GIN (attributes);

-- ============================================================
-- PRICE HISTORY TABLE
-- ============================================================
COMMENT ON TABLE price_history IS 'Track product price changes over time';

CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    -- Price Data
    old_price NUMERIC(10, 2),
    new_price NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    
    -- Reason
    change_reason TEXT,
    changed_by UUID REFERENCES profiles(id),
    
    effective_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_variant_id ON price_history(variant_id);
CREATE INDEX idx_price_history_effective_date ON price_history(effective_date DESC);

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0005 complete: Products, variants, brands, and price history created';
END $$;
-- ============================================================
-- THE BAZAAR - Migration 0006
-- Vendor Wallets, Payouts, and Financial Tracking
-- ============================================================

-- ============================================================
-- VENDOR WALLETS TABLE
-- ============================================================
COMMENT ON TABLE vendor_wallets IS 'Current vendor balance and payout tracking';

CREATE TABLE vendor_wallets (
    vendor_id UUID PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Balance
    balance NUMERIC(12, 2) DEFAULT 0, -- Current available balance
    pending_balance NUMERIC(12, 2) DEFAULT 0, -- In pending orders
    reserved_balance NUMERIC(12, 2) DEFAULT 0, -- Held for disputes/refunds
    
    -- Totals
    total_earned NUMERIC(12, 2) DEFAULT 0,
    total_paid_out NUMERIC(12, 2) DEFAULT 0,
    
    currency TEXT DEFAULT 'KES',
    
    last_payout_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_wallets_vendor_id ON vendor_wallets(vendor_id);

-- ============================================================
-- VENDOR PAYOUT REQUESTS TABLE
-- ============================================================
COMMENT ON TABLE vendor_payout_requests IS 'Vendor-initiated payout requests';

CREATE TABLE vendor_payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Request Details
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
    
    -- Payout Method
    payout_method TEXT, -- 'bank_transfer', 'mpesa', 'paypal'
    details JSONB, -- Bank account, M-Pesa number, etc.
    payout_details JSONB, -- Alias
    
    -- Processing
    processed_by UUID REFERENCES profiles(id),
    processed_at TIMESTAMPTZ,
    transaction_reference TEXT,
    
    -- Metadata
    notes TEXT,
    admin_notes TEXT,
    rejection_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_payout_requests_vendor_id ON vendor_payout_requests(vendor_id);
CREATE INDEX idx_vendor_payout_requests_status ON vendor_payout_requests(status);
CREATE INDEX idx_vendor_payout_requests_created_at ON vendor_payout_requests(created_at DESC);

-- ============================================================
-- VENDOR PAYOUT TRANSACTIONS TABLE
-- ============================================================
COMMENT ON TABLE vendor_payout_transactions IS 'Completed payout transactions';

CREATE TABLE vendor_payout_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_request_id UUID REFERENCES vendor_payout_requests(id) ON DELETE SET NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Transaction Details
    amount NUMERIC(10, 2) NOT NULL,
    fee NUMERIC(10, 2) DEFAULT 0,
    net_amount NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    
    -- Payment Details
    payment_method TEXT,
    transaction_reference TEXT,
    gateway_response JSONB,
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'completed',
    
    -- Metadata
    description TEXT,
    processed_by UUID REFERENCES profiles(id),
    
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_payout_transactions_vendor_id ON vendor_payout_transactions(vendor_id);
CREATE INDEX idx_vendor_payout_transactions_payout_request_id ON vendor_payout_transactions(payout_request_id);
CREATE INDEX idx_vendor_payout_transactions_completed_at ON vendor_payout_transactions(completed_at DESC);

-- ============================================================
-- VENDOR STATEMENT ENTRIES TABLE
-- ============================================================
COMMENT ON TABLE vendor_statement_entries IS 'Detailed vendor financial statement';

CREATE TABLE vendor_statement_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Entry Type
    entry_type TEXT NOT NULL, -- 'sale', 'refund', 'payout', 'fee', 'adjustment'
    
    -- References
    order_id UUID, -- Link to orders table (will be created in next migration)
    payout_id UUID REFERENCES vendor_payout_transactions(id) ON DELETE SET NULL,
    
    -- Amount
    amount NUMERIC(10, 2) NOT NULL, -- Positive for credits, negative for debits
    balance_after NUMERIC(12, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    
    -- Description
    description TEXT,
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_statement_entries_vendor_id ON vendor_statement_entries(vendor_id);
CREATE INDEX idx_vendor_statement_entries_entry_type ON vendor_statement_entries(entry_type);
CREATE INDEX idx_vendor_statement_entries_created_at ON vendor_statement_entries(created_at DESC);

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0006 complete: Vendor wallets and payout system created';
END $$;
-- ============================================================
-- THE BAZAAR - Migration 0007
-- Orders, Reviews, Chats, and Audit Logs
-- ============================================================

-- ============================================================
-- ORDERS TABLE
-- ============================================================
COMMENT ON TABLE orders IS 'Customer orders';

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Pricing
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    shipping_fee NUMERIC(10, 2) DEFAULT 0,
    shipping_amount NUMERIC(10, 2) DEFAULT 0, -- Alias
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL, -- Alias
    currency TEXT DEFAULT 'KES',
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')) DEFAULT 'pending',
    payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
    fulfillment_status TEXT DEFAULT 'unfulfilled',
    
    -- Shipping
    shipping_address JSONB,
    billing_address JSONB,
    shipping_info JSONB, -- Alias
    shipping_method TEXT,
    tracking_number TEXT,
    tracking_url TEXT,
    
    -- Payment
    payment_info JSONB,
    payment_method TEXT,
    
    -- Metadata
    notes TEXT,
    customer_notes TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
    fulfilled_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_paid_at ON orders(paid_at DESC);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
COMMENT ON TABLE order_items IS 'Line items in orders';

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    
    -- Product Info (snapshot at time of order)
    product_name TEXT NOT NULL,
    product_sku TEXT,
    variant_name TEXT,
    
    -- Pricing
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    
    -- Fulfillment
    fulfillment_status TEXT DEFAULT 'unfulfilled',
    fulfilled_at TIMESTAMPTZ,
    
    -- Metadata
    attributes JSONB, -- Snapshot of product attributes
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_vendor_id ON order_items(vendor_id);
CREATE INDEX idx_order_items_fulfillment_status ON order_items(fulfillment_status);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
COMMENT ON TABLE reviews IS 'Product reviews and ratings';

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    order_id UUID, -- Link to order (verified purchase)
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    content TEXT,
    comment TEXT, -- Alias
    images JSONB, -- Array of image URLs
    
    -- Status
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Helpfulness
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    -- Vendor Response
    vendor_response TEXT,
    vendor_responded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(product_id, buyer_id, order_id)
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================================
-- CHAT THREADS TABLE
-- ============================================================
COMMENT ON TABLE chat_threads IS 'Chat conversations between buyers and vendors';

CREATE TABLE chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    
    last_message TEXT,
    last_timestamp TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_threads_buyer_id ON chat_threads(buyer_id);
CREATE INDEX idx_chat_threads_vendor_id ON chat_threads(vendor_id);
CREATE INDEX idx_chat_threads_last_timestamp ON chat_threads(last_timestamp DESC);

-- ============================================================
-- CHAT MESSAGES TABLE
-- ============================================================
COMMENT ON TABLE chat_messages IS 'Individual messages in chat threads';

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    message TEXT NOT NULL,
    attachments JSONB,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============================================================
-- AUDIT LOGS TABLE
-- ============================================================
COMMENT ON TABLE audit_logs IS 'System-wide audit trail';

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Resource
    resource_type TEXT NOT NULL, -- 'product', 'order', 'vendor', 'user'
    resource_id UUID NOT NULL,
    
    -- Action
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject'
    
    -- Actor
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_role TEXT,
    
    -- Changes
    changes JSONB, -- {field: {old: value, new: value}}
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource_lookup ON audit_logs(resource_type, resource_id);

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0007 complete: Orders, reviews, chats, and audit logs created';
END $$;
-- ============================================================
-- THE BAZAAR - Migration 0008
-- Triggers and Helper Functions
-- ============================================================

-- ============================================================
-- TIMESTAMP TRIGGERS
-- ============================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER trigger_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendors_updated_at 
    BEFORE UPDATE ON vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendor_subscriptions_updated_at 
    BEFORE UPDATE ON vendor_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendor_staff_updated_at 
    BEFORE UPDATE ON vendor_staff 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_admin_staff_updated_at 
    BEFORE UPDATE ON admin_staff 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_category_attributes_updated_at 
    BEFORE UPDATE ON category_attributes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_brands_updated_at 
    BEFORE UPDATE ON brands 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_product_variants_updated_at 
    BEFORE UPDATE ON product_variants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_order_items_updated_at 
    BEFORE UPDATE ON order_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_chat_threads_updated_at 
    BEFORE UPDATE ON chat_threads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendor_wallets_updated_at 
    BEFORE UPDATE ON vendor_wallets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendor_payout_requests_updated_at 
    BEFORE UPDATE ON vendor_payout_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- CATEGORY HIERARCHY TRIGGERS
-- ============================================================

-- Function: Auto-generate category path_slug and ancestry
CREATE OR REPLACE FUNCTION update_category_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT;
    parent_ancestry UUID[];
    parent_depth INTEGER;
BEGIN
    IF NEW.parent_id IS NULL THEN
        -- Root category
        NEW.path_slug := NEW.slug;
        NEW.full_slug := NEW.slug;
        NEW.ancestry := ARRAY[]::UUID[];
        NEW.depth := 0;
        NEW.level := 1;
    ELSE
        -- Child category
        SELECT path_slug, ancestry, depth
        INTO parent_path, parent_ancestry, parent_depth
        FROM categories
        WHERE id = NEW.parent_id;
        
        NEW.path_slug := parent_path || '/' || NEW.slug;
        NEW.full_slug := NEW.path_slug;
        NEW.ancestry := parent_ancestry || NEW.parent_id;
        NEW.depth := parent_depth + 1;
        NEW.level := parent_depth + 2;
    END IF;
    
    -- Auto-populate meta_title if empty
    IF NEW.seo_title IS NULL OR NEW.seo_title = '' THEN
        NEW.seo_title := NEW.name || ' – The Bazaar';
    END IF;
    
    IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
        NEW.meta_title := NEW.seo_title;
    END IF;
    
    -- Auto-populate meta_description if empty
    IF (NEW.seo_description IS NULL OR NEW.seo_description = '') AND NEW.description IS NOT NULL THEN
        NEW.seo_description := LEFT(NEW.description, 160);
    END IF;
    
    IF NEW.meta_description IS NULL OR NEW.meta_description = '' THEN
        NEW.meta_description := NEW.seo_description;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_category_hierarchy
    BEFORE INSERT OR UPDATE OF slug, parent_id ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_category_hierarchy();

-- ============================================================
-- PRODUCT PATH SLUG TRIGGER
-- ============================================================

-- Function: Auto-generate product path_slug
CREATE OR REPLACE FUNCTION update_product_path_slug()
RETURNS TRIGGER AS $$
DECLARE
    category_path TEXT;
BEGIN
    IF NEW.category_id IS NOT NULL THEN
        SELECT path_slug INTO category_path FROM categories WHERE id = NEW.category_id;
        IF category_path IS NOT NULL THEN
            NEW.path_slug := category_path || '/' || NEW.slug;
        ELSE
            NEW.path_slug := NEW.slug;
        END IF;
    ELSE
        NEW.path_slug := NEW.slug;
    END IF;
    
    -- Auto-populate SEO fields
    IF NEW.seo_title IS NULL OR NEW.seo_title = '' THEN
        NEW.seo_title := NEW.name || ' – The Bazaar';
    END IF;
    
    IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
        NEW.meta_title := NEW.seo_title;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_path_slug
    BEFORE INSERT OR UPDATE OF slug, category_id ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_path_slug();

-- ============================================================
-- PRODUCT RATING UPDATE TRIGGER
-- ============================================================

-- Function: Update product rating from reviews
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true), 0),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true)
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_rating
    AFTER INSERT OR UPDATE OF rating, is_approved ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();

-- ============================================================
-- VENDOR WALLET UPDATE TRIGGER
-- ============================================================

-- Function: Update vendor wallet balance after order payment
CREATE OR REPLACE FUNCTION update_vendor_wallet_on_order()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    wallet_balance NUMERIC;
BEGIN
    IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
        -- Order was just paid
        FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
            -- Add to vendor wallet balance
            INSERT INTO vendor_wallets (vendor_id, balance, pending_balance, total_earned)
            VALUES (item.vendor_id, item.total_price, 0, item.total_price)
            ON CONFLICT (vendor_id) DO UPDATE
            SET 
                balance = vendor_wallets.balance + item.total_price,
                total_earned = vendor_wallets.total_earned + item.total_price,
                updated_at = NOW();
            
            -- Get updated balance
            SELECT balance INTO wallet_balance FROM vendor_wallets WHERE vendor_id = item.vendor_id;
            
            -- Create statement entry
            INSERT INTO vendor_statement_entries (
                vendor_id, 
                entry_type, 
                order_id, 
                amount, 
                balance_after, 
                description
            )
            VALUES (
                item.vendor_id,
                'sale',
                NEW.id,
                item.total_price,
                wallet_balance,
                'Sale: ' || item.product_name || ' (Order #' || NEW.order_number || ')'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vendor_wallet_on_order
    AFTER UPDATE OF payment_status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_wallet_on_order();

-- ============================================================
-- CHAT THREAD UPDATE TRIGGER
-- ============================================================

-- Function: Update chat thread last message
CREATE OR REPLACE FUNCTION update_chat_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_threads
    SET 
        last_message = NEW.message,
        last_timestamp = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.thread_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_thread
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_thread_last_message();

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0008 complete: Triggers and functions created';
END $$;
-- ============================================================
-- THE BAZAAR - Migration 0009
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payout_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_statement_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (is_admin(auth.uid()));

-- ============================================================
-- VENDORS POLICIES
-- ============================================================

CREATE POLICY "Active vendors are viewable by everyone"
    ON vendors FOR SELECT
    USING (status = 'active' OR profile_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Vendors can update own vendor"
    ON vendors FOR UPDATE
    USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM vendor_staff 
        WHERE vendor_id = vendors.id 
        AND profile_id = auth.uid() 
        AND role IN ('owner', 'manager')
    ));

CREATE POLICY "Admins can manage all vendors"
    ON vendors FOR ALL
    USING (is_admin(auth.uid()));

-- ============================================================
-- VENDOR STAFF POLICIES
-- ============================================================

CREATE POLICY "Vendor staff can view own vendor staff"
    ON vendor_staff FOR SELECT
    USING (
        vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Vendor owners can manage staff"
    ON vendor_staff FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM vendor_staff vs
            WHERE vs.vendor_id = vendor_staff.vendor_id
            AND vs.profile_id = auth.uid()
            AND vs.role = 'owner'
        )
        OR is_admin(auth.uid())
    );

-- ============================================================
-- ADMIN STAFF POLICIES
-- ============================================================

CREATE POLICY "Only admins can view admin staff"
    ON admin_staff FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Only super admins can manage admin staff"
    ON admin_staff FOR ALL
    USING (is_super_admin(auth.uid()));

-- ============================================================
-- CATEGORIES POLICIES
-- ============================================================

CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Only admins can manage categories"
    ON categories FOR ALL
    USING (is_admin(auth.uid()));

-- ============================================================
-- CATEGORY ATTRIBUTES POLICIES
-- ============================================================

CREATE POLICY "Category attributes are viewable by everyone"
    ON category_attributes FOR SELECT
    USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Only admins can manage category attributes"
    ON category_attributes FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Category attribute values are viewable by everyone"
    ON category_attribute_values FOR SELECT
    USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Only admins can manage category attribute values"
    ON category_attribute_values FOR ALL
    USING (is_admin(auth.uid()));

-- ============================================================
-- BRANDS POLICIES
-- ============================================================

CREATE POLICY "Active brands are viewable by everyone"
    ON brands FOR SELECT
    USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Vendors can manage own brands"
    ON brands FOR ALL
    USING (vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()) OR is_admin(auth.uid()));

-- ============================================================
-- PRODUCTS POLICIES
-- ============================================================

CREATE POLICY "Active products are viewable by everyone"
    ON products FOR SELECT
    USING (is_active = true OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Vendors can manage own products"
    ON products FOR ALL
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid() AND role IN ('owner', 'manager', 'staff'))
        OR is_admin(auth.uid())
    );

-- ============================================================
-- PRODUCT VARIANTS POLICIES
-- ============================================================

CREATE POLICY "Product variants are viewable with products"
    ON product_variants FOR SELECT
    USING (
        is_active = true 
        OR product_id IN (SELECT id FROM products WHERE vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()))
        OR is_admin(auth.uid())
    );

CREATE POLICY "Vendors can manage own product variants"
    ON product_variants FOR ALL
    USING (
        product_id IN (SELECT id FROM products WHERE vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()))
        OR is_admin(auth.uid())
    );

-- ============================================================
-- ORDERS POLICIES
-- ============================================================

CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (
        buyer_id = auth.uid()
        OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Vendors can update own orders"
    ON orders FOR UPDATE
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

-- ============================================================
-- ORDER ITEMS POLICIES
-- ============================================================

CREATE POLICY "Order items viewable with orders"
    ON order_items FOR SELECT
    USING (
        order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid())
        OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

-- ============================================================
-- REVIEWS POLICIES
-- ============================================================

CREATE POLICY "Approved reviews are viewable by everyone"
    ON reviews FOR SELECT
    USING (is_approved = true OR buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (buyer_id = auth.uid() OR is_admin(auth.uid()));

-- ============================================================
-- CHAT POLICIES
-- ============================================================

CREATE POLICY "Users can view own chats"
    ON chat_threads FOR SELECT
    USING (
        buyer_id = auth.uid()
        OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Users can create chat threads"
    ON chat_threads FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can view own chat messages"
    ON chat_messages FOR SELECT
    USING (
        thread_id IN (SELECT id FROM chat_threads WHERE buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()))
        OR is_admin(auth.uid())
    );

CREATE POLICY "Users can send chat messages"
    ON chat_messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

-- ============================================================
-- VENDOR WALLET POLICIES
-- ============================================================

CREATE POLICY "Vendors can view own wallet"
    ON vendor_wallets FOR SELECT
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid() AND role IN ('owner', 'manager'))
        OR is_admin(auth.uid())
    );

CREATE POLICY "Only system can update wallets"
    ON vendor_wallets FOR UPDATE
    USING (is_admin(auth.uid()));

-- ============================================================
-- VENDOR PAYOUT POLICIES
-- ============================================================

CREATE POLICY "Vendors can view own payout requests"
    ON vendor_payout_requests FOR SELECT
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Vendors can create payout requests"
    ON vendor_payout_requests FOR INSERT
    WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()));

CREATE POLICY "Admins can manage payout requests"
    ON vendor_payout_requests FOR UPDATE
    USING (is_admin(auth.uid()));

CREATE POLICY "Vendors can view own payout transactions"
    ON vendor_payout_transactions FOR SELECT
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Vendors can view own statement entries"
    ON vendor_statement_entries FOR SELECT
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

-- ============================================================
-- AUDIT LOG POLICIES
-- ============================================================

CREATE POLICY "Only admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "System can create audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================================
-- SYSTEM SETTINGS POLICIES
-- ============================================================

CREATE POLICY "Public settings are viewable by everyone"
    ON system_settings FOR SELECT
    USING (is_public = true OR is_admin(auth.uid()));

CREATE POLICY "Only super admins can manage settings"
    ON system_settings FOR ALL
    USING (is_super_admin(auth.uid()));

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0009 complete: RLS policies created';
END $$;
-- ============================================================
-- THE BAZAAR - Migration 0010
-- Additional Performance Indexes and Optimizations
-- ============================================================

-- ============================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================

-- Products: Active + Featured + Category
CREATE INDEX idx_products_active_category_featured 
    ON products(category_id, is_featured DESC, created_at DESC) 
    WHERE is_active = true;

-- Products: Active + Price Range
CREATE INDEX idx_products_active_price 
    ON products(price) 
    WHERE is_active = true;

-- Products: Vendor + Active
CREATE INDEX idx_products_vendor_active 
    ON products(vendor_id, created_at DESC) 
    WHERE is_active = true;

-- Orders: Buyer + Status + Date
CREATE INDEX idx_orders_buyer_status_date 
    ON orders(buyer_id, status, created_at DESC);

-- Orders: Vendor + Status + Date
CREATE INDEX idx_orders_vendor_status_date 
    ON orders(vendor_id, status, created_at DESC);

-- Orders: Payment Status + Date
CREATE INDEX idx_orders_payment_status_date 
    ON orders(payment_status, created_at DESC);

-- Reviews: Product + Approved + Rating
CREATE INDEX idx_reviews_product_approved_rating 
    ON reviews(product_id, rating DESC) 
    WHERE is_approved = true;

-- Vendor Payout Requests: Status + Date
CREATE INDEX idx_vendor_payout_requests_status_date 
    ON vendor_payout_requests(status, created_at DESC);

-- ============================================================
-- PARTIAL INDEXES (Active Records Only)
-- ============================================================

-- Active categories only
CREATE INDEX idx_categories_active_level 
    ON categories(level, sort_order) 
    WHERE is_active = true;

-- Active products with stock
CREATE INDEX idx_products_active_in_stock 
    ON products(category_id, created_at DESC) 
    WHERE is_active = true AND stock_quantity > 0;

-- Active vendors only
CREATE INDEX idx_vendors_active_rating 
    ON vendors(rating DESC, total_reviews DESC) 
    WHERE status = 'active' AND is_verified = true;

-- Active product variants
CREATE INDEX idx_product_variants_active_stock 
    ON product_variants(product_id) 
    WHERE is_active = true AND stock_quantity > 0;

-- ============================================================
-- FULL TEXT SEARCH INDEXES
-- ============================================================

-- Products: Full text search on name and description
CREATE INDEX idx_products_fulltext_search 
    ON products USING GIN (
        to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(short_description, ''))
    );

-- Vendors: Full text search
CREATE INDEX idx_vendors_fulltext_search 
    ON vendors USING GIN (
        to_tsvector('english', COALESCE(business_name, '') || ' ' || COALESCE(description, ''))
    );

-- Categories: Full text search
CREATE INDEX idx_categories_fulltext_search 
    ON categories USING GIN (
        to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
    );

-- ============================================================
-- TRIGRAM INDEXES FOR FUZZY SEARCH
-- ============================================================

-- Already created in previous migrations, but adding more:

-- Vendor business name trigram
CREATE INDEX idx_vendors_business_name_trgm 
    ON vendors USING GIN (business_name gin_trgm_ops);

-- Category name trigram
CREATE INDEX idx_categories_name_trgm 
    ON categories USING GIN (name gin_trgm_ops);

-- Brand name trigram
CREATE INDEX idx_brands_name_trgm 
    ON brands USING GIN (name gin_trgm_ops);

-- ============================================================
-- JSONB INDEXES FOR ATTRIBUTE QUERIES
-- ============================================================

-- Product attributes: Specific keys
CREATE INDEX idx_products_attributes_brand 
    ON products ((attributes->>'brand'));

CREATE INDEX idx_products_attributes_color 
    ON products ((attributes->>'color'));

CREATE INDEX idx_products_attributes_size 
    ON products ((attributes->>'size'));

-- Product variant attributes
CREATE INDEX idx_product_variants_attributes_color 
    ON product_variants ((attributes->>'color'));

CREATE INDEX idx_product_variants_attributes_size 
    ON product_variants ((attributes->>'size'));

-- ============================================================
-- ARRAY INDEXES FOR TAGS AND KEYWORDS
-- ============================================================

-- Products: Tags (already created, but ensuring)
CREATE INDEX IF NOT EXISTS idx_products_tags_gin 
    ON products USING GIN (tags);

-- Products: Search keywords (already created)
CREATE INDEX IF NOT EXISTS idx_products_search_keywords_gin 
    ON products USING GIN (search_keywords);

-- Categories: Meta keywords (already created)
CREATE INDEX IF NOT EXISTS idx_categories_meta_keywords_gin 
    ON categories USING GIN (meta_keywords);

-- ============================================================
-- COVERING INDEXES (Include commonly selected columns)
-- ============================================================

-- Products: List view with all needed columns
CREATE INDEX idx_products_list_covering 
    ON products(category_id, created_at DESC) 
    INCLUDE (name, slug, price, images, rating, is_featured)
    WHERE is_active = true;

-- Vendors: List view
CREATE INDEX idx_vendors_list_covering 
    ON vendors(status, rating DESC) 
    INCLUDE (business_name, slug, logo_url, city, country)
    WHERE is_verified = true;

-- ============================================================
-- STATISTICS AND ANALYZE
-- ============================================================

-- Update table statistics for query planner
ANALYZE profiles;
ANALYZE vendors;
ANALYZE categories;
ANALYZE products;
ANALYZE orders;
ANALYZE reviews;

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0010 complete: Performance indexes and optimizations applied';
END $$;
-- ============================================================
-- THE BAZAAR - Migration 0011
-- Seed Initial Data (Idempotent)
-- ============================================================

-- ============================================================
-- SUPER ADMIN SETUP
-- ============================================================

-- Insert Super Admin profile (if not exists)
INSERT INTO profiles (id, email, full_name, role, is_verified)
SELECT 
    auth.uid(),
    'zakariamusa53@gmail.com',
    'Super Admin',
    'super_admin',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'zakariamusa53@gmail.com'
);

-- Insert Super Admin staff record
INSERT INTO admin_staff (profile_id, role, is_super_admin, is_active, permissions)
SELECT 
    p.id,
    'super_admin',
    true,
    true,
    jsonb_build_object(
        'manage_admins', true,
        'manage_vendors', true,
        'manage_customers', true,
        'manage_products', true,
        'manage_orders', true,
        'manage_payments', true,
        'view_analytics', true,
        'system_settings', true,
        'cannot_be_deleted', true
    )
FROM profiles p
WHERE p.email = 'zakariamusa53@gmail.com'
ON CONFLICT (profile_id) DO UPDATE
SET 
    is_super_admin = true,
    is_active = true,
    permissions = EXCLUDED.permissions;

-- ============================================================
-- SYSTEM SETTINGS
-- ============================================================

INSERT INTO system_settings (key, value, description, is_public)
VALUES
    ('site_name', '"The Bazaar"', 'Marketplace name', true),
    ('site_url', '"https://thebazaar.com"', 'Main site URL', true),
    ('currency', '"KES"', 'Default currency', true),
    ('tax_rate', '0.16', 'VAT rate (16%)', false),
    ('commission_rate', '0.10', 'Platform commission (10%)', false),
    ('min_payout_amount', '1000', 'Minimum payout amount in KES', false),
    ('max_sku_per_tier', jsonb_build_object(
        'basic', 50,
        'bronze', 100,
        'silver', 500,
        'gold', 2000,
        'platinum', 10000
    ), 'SKU limits per subscription tier', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- STORAGE BUCKETS (via SQL)
-- ============================================================

-- Note: Storage buckets are typically created via Supabase Dashboard or API
-- This is a placeholder for documentation purposes

-- Buckets needed:
-- 1. product-images (public)
-- 2. vendor-logos (public)
-- 3. vendor-banners (public)
-- 4. user-avatars (public)
-- 5. review-images (public)
-- 6. kyc-documents (private)

-- ============================================================
-- SAMPLE VENDOR (Optional - for testing)
-- ============================================================

-- Insert sample vendor profile
DO $$
DECLARE
    sample_vendor_profile_id UUID;
    sample_vendor_id UUID;
BEGIN
    -- Create vendor profile if not exists
    INSERT INTO profiles (id, email, full_name, role, is_verified)
    VALUES (
        gen_random_uuid(),
        'vendor@example.com',
        'Sample Vendor',
        'vendor',
        true
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO sample_vendor_profile_id;

    -- Get profile ID if already exists
    IF sample_vendor_profile_id IS NULL THEN
        SELECT id INTO sample_vendor_profile_id FROM profiles WHERE email = 'vendor@example.com';
    END IF;

    -- Create vendor record
    INSERT INTO vendors (
        id,
        profile_id,
        business_name,
        slug,
        description,
        phone,
        email,
        city,
        country,
        status,
        is_verified
    )
    VALUES (
        gen_random_uuid(),
        sample_vendor_profile_id,
        'Sample Electronics Store',
        'sample-electronics',
        'Your trusted electronics retailer',
        '+254700000000',
        'vendor@example.com',
        'Nairobi',
        'Kenya',
        'active',
        true
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO sample_vendor_id;

    -- Get vendor ID if already exists
    IF sample_vendor_id IS NULL THEN
        SELECT id INTO sample_vendor_id FROM vendors WHERE slug = 'sample-electronics';
    END IF;

    -- Create vendor wallet
    INSERT INTO vendor_wallets (vendor_id, balance, currency)
    VALUES (sample_vendor_id, 0, 'KES')
    ON CONFLICT (vendor_id) DO NOTHING;

    -- Create vendor subscription
    INSERT INTO vendor_subscriptions (
        vendor_id,
        tier,
        status,
        sku_limit,
        monthly_fee,
        features
    )
    VALUES (
        sample_vendor_id,
        'basic',
        'active',
        50,
        0,
        jsonb_build_object(
            'max_products', 50,
            'analytics', false,
            'priority_support', false
        )
    )
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================================
-- SAMPLE BUYER (Optional - for testing)
-- ============================================================

INSERT INTO profiles (id, email, full_name, role, is_verified)
VALUES (
    gen_random_uuid(),
    'buyer@example.com',
    'Sample Buyer',
    'buyer',
    true
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0011 complete: Initial data seeded';
    RAISE NOTICE '📧 Super Admin: zakariamusa53@gmail.com';
    RAISE NOTICE '🏪 Sample Vendor: vendor@example.com';
    RAISE NOTICE '🛒 Sample Buyer: buyer@example.com';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 All migrations complete! The Bazaar database is ready.';
END $$;
