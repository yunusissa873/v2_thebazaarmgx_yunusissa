# Supabase Migrations

This directory contains SQL migration files for The Bazaar database schema.

## Migration Files

### 1. `20250101000001_auth_setup.sql`
**Purpose**: Sets up automatic profile creation and auth triggers
**What it does**:
- Creates trigger to auto-create profile when auth user signs up
- Syncs email updates from auth.users to profiles
- Creates helper functions for super admin setup
- Sets up RLS policies for profiles

**When to run**: First, before any other migrations

### 2. `20250101000002_admin_portal_tables.sql`
**Purpose**: Creates admin portal tables and enhances audit_log
**What it does**:
- Enhances audit_log table with admin-specific fields
- Creates admin_permissions, system_settings, support_tickets
- Creates vendor_wallets, escrow_accounts, fraud_alerts
- Creates security_events, communication_logs, ad_revenue
- Sets up RLS policies for all new tables

**When to run**: After auth setup

### 3. `20250101000003_vendor_portal_enhancements.sql`
**Purpose**: Adds vendor portal RLS policies and missing tables
**What it does**:
- Creates missing tables (vendor_staff, vendor_wallets, escrow_accounts, chats, messages)
- Adds RLS policies for vendor access
- Enables vendors to update orders, view wallets, manage staff, etc.

**When to run**: After admin portal tables

### 4. `20250101000004_create_initial_super_admin.sql`
**Purpose**: Guide for creating the first super admin
**What it does**:
- Provides step-by-step instructions
- Includes SQL templates for super admin setup
- Verification queries

**When to run**: Manual setup guide (not a migration)

## Running Migrations

### In Supabase Dashboard

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of each migration file
3. Paste into SQL Editor
4. Click "Run"
5. Run migrations in order (by timestamp)

### Migration Order

Run migrations in this order:
1. `20250101000001_auth_setup.sql` (Auth triggers)
2. `20250101000002_admin_portal_tables.sql` (Admin tables)
3. `20250101000003_vendor_portal_enhancements.sql` (Vendor policies)
4. Follow guide in `20250101000004_create_initial_super_admin.sql` (Manual)

## Creating Auth Users

### For Regular Users (Buyers/Vendors)
- Users sign up via the main app or vendor portal
- Profile is automatically created by trigger
- No manual SQL needed

### For Admin Users
- **Super Admin**: Create via Supabase Dashboard → Authentication → Users
  - Then run SQL from `20250101000004_create_initial_super_admin.sql`
- **Staff Accounts**: Created by super admin via Admin Portal UI
  - No SQL needed, handled by `createStaffAccount()` function

## Important Notes

1. **Auth Users**: Created via Supabase Auth (Dashboard or API), NOT via SQL
2. **Profiles**: Auto-created by trigger when auth user signs up
3. **Super Admin**: Must be created manually (first time only)
4. **Staff Accounts**: Created by super admin via Admin Portal
5. **Migrations are idempotent**: Safe to run multiple times

## Troubleshooting

### Profile not created automatically
- Check if trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
- Verify function exists: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`
- Re-run `20250101000001_auth_setup.sql`

### Super admin permission not working
- Check admin_permissions table: `SELECT * FROM admin_permissions WHERE permission = 'super_admin';`
- Verify profile role: `SELECT * FROM profiles WHERE role = 'admin';`
- Re-run super admin setup SQL

### Migration errors
- Check if tables already exist
- Verify enum types exist
- Check for conflicting policies
- Review error messages in Supabase SQL Editor


