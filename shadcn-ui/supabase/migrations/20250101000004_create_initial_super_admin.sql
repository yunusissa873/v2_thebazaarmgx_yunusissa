-- ============================================================================
-- Migration: Create Initial Super Admin (Manual Setup Guide)
-- Description: Instructions and helper script for creating the first super admin
-- Date: 2025-01-01
-- Version: 1.0.0
-- ============================================================================
-- 
-- ⚠️ IMPORTANT: This is a GUIDE, not an executable migration
-- You must create the auth user FIRST via Supabase Dashboard or API
-- Then run the SQL commands below
--
-- ============================================================================
-- STEP-BY-STEP INSTRUCTIONS
-- ============================================================================
--
-- STEP 1: Create Auth User via Supabase Dashboard
-- ------------------------------------------------
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create new user"
-- 3. Enter:
--    - Email: superadmin@thebazaar.com (or your email)
--    - Password: [Generate strong password]
--    - Auto Confirm User: ✅ (check this)
-- 4. Click "Create User"
-- 5. Copy the User ID (UUID) - you'll need this for Step 2
--
-- OR use Supabase API:
-- ------------------------------------------------
-- POST https://your-project.supabase.co/auth/v1/admin/users
-- Headers:
--   Authorization: Bearer YOUR_SERVICE_ROLE_KEY
--   Content-Type: application/json
-- Body:
-- {
--   "email": "superadmin@thebazaar.com",
--   "password": "YourSecurePassword123!",
--   "email_confirm": true,
--   "user_metadata": {
--     "full_name": "Super Admin",
--     "role": "admin"
--   }
-- }
--
-- STEP 2: Create Profile and Grant Super Admin Permission
-- ------------------------------------------------
-- Replace 'YOUR_USER_ID_HERE' with the UUID from Step 1
-- Then run the SQL below in Supabase SQL Editor:

-- ============================================================================
-- SQL TO RUN AFTER CREATING AUTH USER
-- ============================================================================

-- Option A: If profile was auto-created by trigger, just grant permission
-- Replace 'YOUR_USER_ID_HERE' with actual UUID
/*
DO $$
DECLARE
  user_uuid UUID := 'YOUR_USER_ID_HERE'; -- Replace with actual user ID
BEGIN
  -- Ensure profile exists and is admin
  UPDATE public.profiles
  SET role = 'admin', is_verified = true
  WHERE id = user_uuid;
  
  -- Grant super admin permission
  INSERT INTO public.admin_permissions (admin_id, permission, granted_by)
  VALUES (user_uuid, 'super_admin', user_uuid)
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Super admin created successfully for user: %', user_uuid;
END $$;
*/

-- Option B: If profile doesn't exist, create it manually
-- Replace 'YOUR_USER_ID_HERE' and 'superadmin@thebazaar.com' with actual values
/*
INSERT INTO public.profiles (id, email, full_name, role, is_verified)
VALUES (
  'YOUR_USER_ID_HERE', -- Replace with UUID from Step 1
  'superadmin@thebazaar.com', -- Replace with actual email
  'Super Admin',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', is_verified = true;

-- Grant super admin permission
INSERT INTO public.admin_permissions (admin_id, permission, granted_by)
VALUES ('YOUR_USER_ID_HERE', 'super_admin', 'YOUR_USER_ID_HERE')
ON CONFLICT DO NOTHING;
*/

-- Option C: Use the helper function (recommended)
-- Replace 'YOUR_USER_ID_HERE' with actual UUID
/*
-- First ensure profile exists with admin role
UPDATE public.profiles
SET role = 'admin', is_verified = true
WHERE id = 'YOUR_USER_ID_HERE';

-- Then use helper function
SELECT create_super_admin('YOUR_USER_ID_HERE');
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the super admin was created correctly:

-- Check profile
/*
SELECT id, email, full_name, role, is_verified
FROM public.profiles
WHERE email = 'superadmin@thebazaar.com';
*/

-- Check super admin permission
/*
SELECT ap.*, p.email, p.full_name
FROM public.admin_permissions ap
JOIN public.profiles p ON ap.admin_id = p.id
WHERE ap.permission = 'super_admin';
*/

-- ============================================================================
-- QUICK SETUP SCRIPT (Copy and modify)
-- ============================================================================
-- Replace the values and run in Supabase SQL Editor:

/*
-- 1. Replace with your user ID from Supabase Auth
\set user_id 'YOUR_USER_ID_HERE'

-- 2. Replace with your email
\set user_email 'superadmin@thebazaar.com'

-- 3. Run the setup
DO $$
BEGIN
  -- Ensure profile exists
  INSERT INTO public.profiles (id, email, full_name, role, is_verified)
  VALUES (
    :'user_id'::UUID,
    :'user_email',
    'Super Admin',
    'admin',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin', is_verified = true;
  
  -- Grant super admin permission
  INSERT INTO public.admin_permissions (admin_id, permission, granted_by)
  VALUES (:'user_id'::UUID, 'super_admin', :'user_id'::UUID)
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Super admin setup complete!';
END $$;
*/

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. The auth user MUST be created first via Supabase Dashboard or API
-- 2. The profile will be auto-created by the trigger (from migration 20250101000001)
-- 3. You only need to grant the super_admin permission
-- 4. After setup, you can log in to admin portal at /login
-- 5. Only super admins can create other staff accounts


