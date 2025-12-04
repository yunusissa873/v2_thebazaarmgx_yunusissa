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
