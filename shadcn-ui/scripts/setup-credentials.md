# Setting Up Supabase Credentials

This guide will help you set up your Supabase credentials securely.

## Step 1: Get Your Supabase Credentials

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project** (or create a new one)
3. **Navigate to Settings** → **API**
4. **Copy the following**:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **service_role key** (⚠️ **SECRET** - keep this safe!)
   - **anon key** (optional, for frontend)

## Step 2: Create .env.local File

Create a file named `.env.local` in the project root (`workspace/shadcn-ui/.env.local`):

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Alternative (if using VITE_ prefix)
# VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
# VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 3: Verify .env.local is in .gitignore

Make sure `.env.local` is in your `.gitignore` file to prevent committing secrets:

```gitignore
# Environment variables
.env
.env.local
.env.production
.env.development
```

## Step 4: Test Your Configuration

Run the connection test:

```bash
cd workspace/shadcn-ui
npx tsx scripts/check-supabase-connection.ts
```

**Expected Output:**
```
✅ SUPABASE_URL: Found
✅ SUPABASE_SERVICE_ROLE_KEY: Found
✅ .env.local file exists
✅ Database connection successful
```

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env.local` to git
- Never share your `service_role` key publicly
- The `service_role` key has admin access - keep it secure
- Use `anon` key for frontend applications
- Use `service_role` key only for server-side scripts (like seeding)

## Troubleshooting

### Issue: "Cannot find module 'dotenv'"

**Solution:**
```bash
npm install dotenv
# or
pnpm add dotenv
```

### Issue: "Environment variables not found"

**Solutions:**
1. Check that `.env.local` is in the correct location (`workspace/shadcn-ui/.env.local`)
2. Verify file name is exactly `.env.local` (not `.env.local.txt`)
3. Restart your terminal/IDE after creating the file
4. Check for typos in variable names

### Issue: "Invalid API key"

**Solutions:**
1. Verify you copied the entire key (they're very long)
2. Check for extra spaces or newlines
3. Ensure you're using the `service_role` key (not `anon` key) for seeding
4. Regenerate keys in Supabase Dashboard if needed

### Issue: "Connection timeout"

**Solutions:**
1. Check your internet connection
2. Verify the Supabase URL is correct
3. Check if your IP is blocked in Supabase settings
4. Try accessing Supabase Dashboard to verify project is active

## Next Steps

After setting up credentials:

1. ✅ Run: `npx tsx scripts/check-supabase-connection.ts`
2. ✅ Run migration in Supabase SQL Editor
3. ✅ Run: `npx tsx scripts/seed-categories.ts`
4. ✅ Run: `npx tsx scripts/validate-seeding.ts`

