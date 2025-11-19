-- ============================================================================
-- Migration: Auth Setup & Profile Auto-Creation
-- Description: Sets up automatic profile creation for auth users and auth triggers
-- Date: 2025-01-01
-- Version: 1.0.0
-- ============================================================================

-- ============================================================================
-- 1. Function to Auto-Create Profile on User Signup
-- ============================================================================
-- This function automatically creates a profile when a new auth user is created
-- It extracts user metadata from auth.users and creates corresponding profile

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    role,
    is_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer'),
    COALESCE((NEW.raw_user_meta_data->>'is_verified')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. Trigger to Auto-Create Profile
-- ============================================================================
-- This trigger fires when a new user is created in auth.users

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 3. Function to Update Profile Email When Auth Email Changes
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.profiles
    SET email = NEW.email, updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. Trigger to Sync Email Updates
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;

CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_email_update();

-- ============================================================================
-- 5. Helper Function: Create Super Admin
-- ============================================================================
-- This function helps create a super admin after the auth user is created
-- Usage: SELECT create_super_admin('user-uuid-here');

CREATE OR REPLACE FUNCTION public.create_super_admin(admin_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  -- Check if user exists and is admin
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = admin_user_id AND role = 'admin'
  ) INTO admin_exists;

  IF NOT admin_exists THEN
    RAISE EXCEPTION 'User does not exist or is not an admin. User ID: %', admin_user_id;
  END IF;

  -- Grant super admin permission
  INSERT INTO public.admin_permissions (admin_id, permission, granted_by)
  VALUES (admin_user_id, 'super_admin', admin_user_id)
  ON CONFLICT DO NOTHING;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. Helper Function: Create Admin Staff Account
-- ============================================================================
-- This function helps create admin staff after auth user is created
-- Usage: SELECT create_admin_staff('user-uuid', 'permission1,permission2');

CREATE OR REPLACE FUNCTION public.create_admin_staff(
  staff_user_id UUID,
  permissions_list TEXT[]
)
RETURNS BOOLEAN AS $$
DECLARE
  perm TEXT;
BEGIN
  -- Check if user exists and is admin
  IF NOT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE id = staff_user_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'User does not exist or is not an admin. User ID: %', staff_user_id;
  END IF;

  -- Grant permissions
  FOREACH perm IN ARRAY permissions_list
  LOOP
    INSERT INTO public.admin_permissions (admin_id, permission, granted_by)
    VALUES (staff_user_id, perm, staff_user_id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 7. RLS Policies for Profiles (if not already exists)
-- ============================================================================

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

-- Users can update their own profile
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Profiles are viewable by everyone (for public profiles)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
  END IF;
END $$;

-- Admins can view all profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile when a new auth user signs up';
COMMENT ON FUNCTION public.handle_user_email_update() IS 'Syncs email changes from auth.users to profiles';
COMMENT ON FUNCTION public.create_super_admin(UUID) IS 'Grants super_admin permission to an admin user';
COMMENT ON FUNCTION public.create_admin_staff(UUID, TEXT[]) IS 'Grants permissions to an admin staff member';

-- ============================================================================
-- Rollback Script
-- ============================================================================
/*
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_email_update();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.create_super_admin(UUID);
DROP FUNCTION IF EXISTS public.create_admin_staff(UUID, TEXT[]);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
*/


