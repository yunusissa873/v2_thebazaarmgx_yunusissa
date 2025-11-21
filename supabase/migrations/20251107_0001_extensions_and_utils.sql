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
