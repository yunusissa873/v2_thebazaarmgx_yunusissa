# Complete Testing Guide 🧪

This guide covers all testing scenarios for the category migration and seeding process.

## Quick Start

### 1. Check Your Setup
```bash
cd workspace/shadcn-ui
npx tsx scripts/check-supabase-connection.ts
```

### 2. Run All Tests
```bash
npx tsx scripts/run-all-tests.ts
```

### 3. Run Individual Tests
See sections below for specific test scenarios.

---

## Test Scripts Overview

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `check-supabase-connection.ts` | Verify Supabase credentials and connection | Before any database operations |
| `test-uuid-generation.ts` | Test UUID generation from custom IDs | Before seeding |
| `run-migration-helper.ts` | Validate migration file and provide instructions | Before running migration |
| `seed-categories.ts` | Seed categories into database | After migration |
| `validate-seeding.ts` | Basic validation of seeded data | After seeding |
| `comprehensive-validation.ts` | Full validation of all aspects | After seeding |
| `run-all-tests.ts` | Run all tests in sequence | Anytime |

---

## Scenario 1: First Time Setup

### Step 1: Set Up Credentials

1. **Get Supabase Credentials**:
   - Go to Supabase Dashboard → Settings → API
   - Copy `Project URL` and `service_role` key

2. **Create `.env.local`**:
   ```bash
   cd workspace/shadcn-ui
   # Create .env.local file
   ```
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Verify Setup**:
   ```bash
   npx tsx scripts/check-supabase-connection.ts
   ```

### Step 2: Test UUID Generation

```bash
npx tsx scripts/test-uuid-generation.ts
```

**Expected:** ✅ All 16 tests passed

### Step 3: Prepare Migration

```bash
npx tsx scripts/run-migration-helper.ts
```

This will:
- Validate migration file
- Show migration SQL
- Provide instructions for running in Supabase

### Step 4: Run Migration

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy migration SQL** from `run-migration-helper.ts` output
3. **Paste and run** in SQL Editor
4. **Verify success**

### Step 5: Seed Categories

```bash
npx tsx scripts/seed-categories.ts
```

**Expected Output:**
```
✅ Success: 338
❌ Errors: 0
📦 Total: 338
```

### Step 6: Validate Results

```bash
# Basic validation
npx tsx scripts/validate-seeding.ts

# Comprehensive validation
npx tsx scripts/comprehensive-validation.ts
```

---

## Scenario 2: Testing Without Database

If you don't have Supabase set up yet, you can still test:

### Run UUID Generation Test
```bash
npx tsx scripts/test-uuid-generation.ts
```

### Validate Migration File
```bash
npx tsx scripts/run-migration-helper.ts
```

### Check JSON File
```bash
# PowerShell
Test-Path "src/data/the_bazaar_categories_flat.json"
```

---

## Scenario 3: Re-running Seeding

If you need to re-seed categories:

### Option 1: Clear and Re-seed
```sql
-- In Supabase SQL Editor
TRUNCATE TABLE categories CASCADE;
```

Then run:
```bash
npx tsx scripts/seed-categories.ts
```

### Option 2: Update Existing
The seeding script uses `upsert`, so it will update existing categories.

---

## Scenario 4: Troubleshooting

### Issue: "Cannot find module 'dotenv'"

**Solution:**
```bash
npm install --save-dev dotenv
```

### Issue: "Missing Supabase credentials"

**Solution:**
1. Check `.env.local` exists
2. Verify variable names (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
3. Restart terminal after creating file

### Issue: "Migration fails in Supabase"

**Solutions:**
1. Check if `categories` table exists
2. Verify you have admin permissions
3. Check Supabase logs for detailed errors
4. Run migration in smaller chunks if needed

### Issue: "Seeding fails with UUID error"

**Solutions:**
1. Verify migration ran successfully
2. Check if categories table has UUID type for `id`
3. Run UUID generation test: `npx tsx scripts/test-uuid-generation.ts`

### Issue: "Parent ID not found"

**Solutions:**
1. Ensure categories are seeded in level order
2. Check if parent categories exist
3. Verify UUID mapping is correct

---

## Test Results Interpretation

### ✅ Pass
- Test completed successfully
- No issues found
- Proceed to next step

### ⚠️ Warning
- Test completed but found minor issues
- May not be critical
- Review warnings and decide if action needed

### ❌ Fail
- Test failed
- Critical issue found
- Must fix before proceeding

### ⏭️ Skip
- Test skipped (not applicable)
- Usually because prerequisites not met
- Can proceed if not blocking

---

## Validation Checks

### Schema Validation
- ✅ Categories table exists
- ✅ SEO columns exist (path_slug, seo_title, seo_description, meta_keywords)
- ✅ Functions exist (generate_category_path_slug, etc.)
- ✅ Triggers exist (trigger_update_category_path_slug)
- ✅ Indexes exist (idx_categories_path_slug, etc.)

### Data Validation
- ✅ Total category count matches JSON (338)
- ✅ No NULL values in required fields
- ✅ All UUIDs are valid format
- ✅ Parent-child relationships correct
- ✅ Level consistency maintained

### SEO Validation
- ✅ All categories have SEO fields
- ✅ SEO titles are appropriate length (30-70 chars)
- ✅ SEO descriptions are appropriate length (100+ chars)
- ✅ Meta keywords are arrays with content

### Path Slug Validation
- ✅ All categories have path_slugs
- ✅ Root categories: path_slug = slug
- ✅ Child categories: path_slug includes parent path
- ✅ Path slugs are correctly formatted

### UUID Mapping Validation
- ✅ Custom IDs map to correct UUIDs
- ✅ UUIDs are deterministic (same input = same output)
- ✅ All test categories found with correct UUIDs

---

## Quick Reference Commands

```bash
# Check connection
npx tsx scripts/check-supabase-connection.ts

# Test UUID generation
npx tsx scripts/test-uuid-generation.ts

# Validate migration
npx tsx scripts/run-migration-helper.ts

# Seed categories
npx tsx scripts/seed-categories.ts

# Validate seeding
npx tsx scripts/validate-seeding.ts

# Comprehensive validation
npx tsx scripts/comprehensive-validation.ts

# Run all tests
npx tsx scripts/run-all-tests.ts
```

---

## Files Reference

### Test Scripts
- `scripts/check-supabase-connection.ts` - Connection test
- `scripts/test-uuid-generation.ts` - UUID generation test
- `scripts/run-migration-helper.ts` - Migration helper
- `scripts/seed-categories.ts` - Seeding script
- `scripts/validate-seeding.ts` - Basic validation
- `scripts/comprehensive-validation.ts` - Full validation
- `scripts/run-all-tests.ts` - Master test runner

### Documentation
- `TESTING_GUIDE.md` - Detailed testing guide
- `TEST_RESULTS.md` - Test results summary
- `QUICK_TEST_CHECKLIST.md` - Quick checklist
- `setup-credentials.md` - Credentials setup guide
- `COMPLETE_TESTING_GUIDE.md` - This file

### Migration Files
- `supabase/migrations/20250101000000_add_category_seo_fields.sql` - Category SEO migration
- `supabase/migrations/20250101000005_category_attributes_table.sql` - Attributes table migration

### Data Files
- `src/data/the_bazaar_categories_flat.json` - Category data (338 categories)
- `src/data/the_bazaar_category_attributes.json` - Attribute definitions

---

## Next Steps After Testing

1. ✅ All tests passed
2. ✅ Migration successful
3. ✅ Categories seeded
4. ✅ Validation passed
5. ⏭️ Update frontend to use new category structure
6. ⏭️ Test category pages with SEO metadata
7. ⏭️ Verify category filtering and search
8. ⏭️ Deploy to production

---

**Last Updated:** 2025-01-01
**Status:** Ready for Testing ✅

