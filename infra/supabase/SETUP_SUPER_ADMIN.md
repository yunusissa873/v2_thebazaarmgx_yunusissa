# How to Create Your First Super Admin

## Overview

The super admin account is the master administrator who can create and manage all other admin staff accounts. This must be set up manually the first time.

## Step 1: Create Auth User

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"** → **"Create new user"**
4. Fill in:
   - **Email**: `superadmin@thebazaar.com` (or your preferred email)
   - **Password**: Generate a strong password (save it securely!)
   - **Auto Confirm User**: ✅ Check this box
5. Click **"Create User"**
6. **Copy the User ID** (UUID) - you'll need this in Step 2

### Option B: Via Supabase API

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/admin/users' \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@thebazaar.com",
    "password": "YourSecurePassword123!",
    "email_confirm": true,
    "user_metadata": {
      "full_name": "Super Admin",
      "role": "admin"
    }
  }'
```

The response will include the user `id` (UUID) - save this!

## Step 2: Grant Super Admin Permission

After creating the auth user, run this SQL in Supabase SQL Editor:

```sql
-- Replace 'YOUR_USER_ID_HERE' with the UUID from Step 1
DO $$
DECLARE
  user_uuid UUID := 'YOUR_USER_ID_HERE'; -- Paste your user ID here
BEGIN
  -- Ensure profile exists and is admin
  UPDATE public.profiles
  SET role = 'admin', is_verified = true
  WHERE id = user_uuid;
  
  -- Grant super admin permission
  INSERT INTO public.admin_permissions (admin_id, permission, granted_by)
  VALUES (user_uuid, 'super_admin', user_uuid)
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Super admin created successfully!';
END $$;
```

### Quick Copy-Paste Template

```sql
-- 1. Replace this UUID with your user ID from Step 1
\set user_id '00000000-0000-0000-0000-000000000000'

-- 2. Run this
DO $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin', is_verified = true
  WHERE id = :'user_id'::UUID;
  
  INSERT INTO public.admin_permissions (admin_id, permission, granted_by)
  VALUES (:'user_id'::UUID, 'super_admin', :'user_id'::UUID)
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Super admin setup complete!';
END $$;
```

## Step 3: Verify Setup

Run these queries to verify:

```sql
-- Check profile
SELECT id, email, full_name, role, is_verified
FROM public.profiles
WHERE email = 'superadmin@thebazaar.com';

-- Check super admin permission
SELECT ap.*, p.email, p.full_name
FROM public.admin_permissions ap
JOIN public.profiles p ON ap.admin_id = p.id
WHERE ap.permission = 'super_admin';
```

You should see:
- Profile with `role = 'admin'` and `is_verified = true`
- Permission record with `permission = 'super_admin'`

## Step 4: Test Login

1. Go to Admin Portal: `http://localhost:3001/login`
2. Enter your super admin email and password
3. You should be logged in and see the "Admin Staff" menu item

## What's Next?

Once logged in as super admin:
- Navigate to **Admin Staff** (in sidebar)
- Create staff accounts for your team
- Assign roles and permissions
- Manage all admin accounts

## Troubleshooting

### "Access denied" error
- Check if profile exists: `SELECT * FROM profiles WHERE email = 'your-email';`
- Check if role is admin: `SELECT role FROM profiles WHERE email = 'your-email';`
- Check super admin permission: `SELECT * FROM admin_permissions WHERE admin_id = 'your-user-id';`

### Profile not created automatically
- The trigger should auto-create it, but if not:
  ```sql
  INSERT INTO public.profiles (id, email, full_name, role, is_verified)
  VALUES (
    'your-user-id',
    'your-email@example.com',
    'Super Admin',
    'admin',
    true
  );
  ```

### Can't see "Admin Staff" menu
- Verify super admin permission exists
- Check browser console for errors
- Refresh the page

## Security Reminder

- **Never share** your super admin credentials
- **Use strong passwords** (minimum 16 characters, mixed case, numbers, symbols)
- **Enable 2FA** when available
- **Limit super admin accounts** to essential personnel only


