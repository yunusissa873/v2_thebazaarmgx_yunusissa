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
