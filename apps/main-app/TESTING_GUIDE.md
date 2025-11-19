# Testing Guide for Category Migration & Seeding

This guide provides step-by-step instructions to test the category migration and seeding changes.

## Prerequisites

1. **Supabase Project**: Access to your Supabase project
2. **Environment Variables**: Set up in your `.env.local` or environment
3. **Node.js**: Ensure Node.js and npm/pnpm are installed
4. **Dependencies**: Install required packages

## Step 1: Install Dependencies

```bash
cd workspace/shadcn-ui
npm install
# or
pnpm install
```

## Step 2: Set Environment Variables

Create or update `.env.local`:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# Or use VITE_ prefix (both work now)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Step 3: Test UUID Generation (Optional but Recommended)

Test that UUID generation works correctly:

```bash
npx tsx scripts/test-uuid-generation.ts
```

**Expected Output:**
```
🧪 Testing UUID Generation
================================================================================

📋 Test 1: UUID Format Validation
   ✅ "Fashion & Apparel" (51df0b3228) → a1b2c3d4-e5f6-5789-a0b1-c2d3e4f5a6b7
   ...

📋 Test 2: Deterministic Generation
   ✅ "Fashion & Apparel": Consistent (a1b2c3d4-e5f6-5789-a0b1-c2d3e4f5a6b7)
   ...

✨ All tests passed! UUID generation is working correctly.
```

## Step 4: Test Migration Syntax (Before Running)

Test the migration syntax in Supabase SQL Editor:

1. Open Supabase Dashboard → SQL Editor
2. Copy and run: `scripts/test-migration-syntax.sql`
3. Verify:
   - Categories table exists
   - Required columns are present (or will be added)
   - Functions exist (or will be created)

## Step 5: Run Migration

### Option A: Run in Supabase SQL Editor (Recommended)

1. Open Supabase Dashboard → SQL Editor
2. Open file: `supabase/migrations/20250101000000_add_category_seo_fields.sql`
3. Copy entire contents
4. Paste into SQL Editor
5. Click "Run" or press `Ctrl+Enter`

**Expected Result:**
- No errors
- Columns added to categories table
- Functions created
- Trigger created
- Indexes created

### Option B: Run via Supabase CLI (if configured)

```bash
supabase db push
```

## Step 6: Verify Migration

Run this query in Supabase SQL Editor:

```sql
-- Check if new columns exist
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'categories'
    AND column_name IN ('path_slug', 'seo_title', 'seo_description', 'meta_keywords');

-- Check if functions exist
SELECT proname 
FROM pg_proc 
WHERE proname IN ('generate_category_path_slug', 'populate_all_category_path_slugs', 'update_category_path_slug');

-- Check if trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'categories' 
    AND trigger_name = 'trigger_update_category_path_slug';
```

**Expected:**
- 4 columns (path_slug, seo_title, seo_description, meta_keywords)
- 3 functions
- 1 trigger

## Step 7: Test Seeding (Dry Run - Check First)

Before seeding, verify the script can read the JSON file:

```bash
# Check if JSON file exists and is readable
node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('src/data/the_bazaar_categories_flat.json', 'utf-8')); console.log('Categories:', data.length);"
```

**Expected Output:**
```
Categories: 338
```

## Step 8: Run Seeding Script

```bash
npx tsx scripts/seed-categories.ts
```

**Expected Output:**
```
🌱 Starting category seeding...
   Found 338 categories to seed

📋 Step 1: Generating UUID mappings...
   ✅ Generated 338 UUID mappings

📦 Step 2: Seeding categories (ordered by level)...
   Processing batch 1/7...
   Processing batch 2/7...
   ...

============================================================
📊 Seeding Summary
============================================================
✅ Success: 338
❌ Errors: 0
📦 Total: 338

🔄 Populating path_slugs for all categories...
   ✅ Updated 338 category path slugs

✨ Category seeding complete!
```

## Step 9: Validate Seeding Results

Run the validation script:

```bash
npx tsx scripts/validate-seeding.ts
```

**Expected Output:**
```
🔍 Validating Category Seeding Results
================================================================================

📋 Test 1: Total Category Count
   ✅ Found 338 categories (expected 338)

📋 Test 2: Required Columns Check
   ✅ All required columns exist
   Sample category: Fashion & Apparel

📋 Test 3: UUID Format Validation
   ✅ All 10 sample categories have valid UUIDs

📋 Test 4: Parent-Child Relationships
   ✅ All 237 parent categories exist

📋 Test 5: Path Slug Values
   ✅ All 20 sample categories have path_slugs

📋 Test 6: SEO Fields
   ✅ All 20 sample categories have SEO fields

📋 Test 7: Verify Specific Categories
   ✅ Found "Fashion & Apparel" with UUID a1b2c3d4-...
   ✅ Found "Women's Fashion" with UUID b2c3d4e5-...

================================================================================
✨ Validation complete!
================================================================================
```

## Step 10: Manual Verification

### Check Categories in Supabase

```sql
-- View sample categories
SELECT 
    id,
    name,
    slug,
    path_slug,
    level,
    parent_id,
    seo_title,
    seo_description,
    meta_keywords
FROM categories
ORDER BY level, name
LIMIT 20;
```

### Check Category Hierarchy

```sql
-- View category tree
WITH RECURSIVE category_tree AS (
    -- Root categories (level 1)
    SELECT 
        id,
        name,
        slug,
        path_slug,
        level,
        parent_id,
        ARRAY[name] as path
    FROM categories
    WHERE parent_id IS NULL
    
    UNION ALL
    
    -- Child categories
    SELECT 
        c.id,
        c.name,
        c.slug,
        c.path_slug,
        c.level,
        c.parent_id,
        ct.path || c.name
    FROM categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT 
    level,
    array_to_string(path, ' > ') as full_path,
    path_slug
FROM category_tree
ORDER BY level, path
LIMIT 50;
```

### Test Path Slug Generation

```sql
-- Test path slug for a specific category
SELECT 
    id,
    name,
    slug,
    path_slug,
    generate_category_path_slug(id) as calculated_path_slug
FROM categories
WHERE name = 'Dresses'
LIMIT 1;
```

**Expected:** `path_slug` should match `calculated_path_slug`

## Troubleshooting

### Issue: Migration Fails with "relation does not exist"

**Solution:** Ensure the `categories` table exists. If not, run the base schema migration first.

### Issue: Seeding Fails with "invalid input syntax for type uuid"

**Solution:** 
1. Verify UUID generation is working: `npx tsx scripts/test-uuid-generation.ts`
2. Check if migration ran successfully
3. Verify JSON file format

### Issue: Parent ID Not Found

**Solution:**
1. Ensure categories are seeded in level order (parents first)
2. Check if parent categories exist in database
3. Verify UUID mapping is correct

### Issue: Path Slug is NULL

**Solution:**
1. Check if trigger is active: `SELECT * FROM information_schema.triggers WHERE event_object_table = 'categories';`
2. Manually run: `SELECT populate_all_category_path_slugs();`
3. Verify parent categories have path_slugs

### Issue: Environment Variables Not Found

**Solution:**
1. Verify `.env.local` exists
2. Check variable names (SUPABASE_URL or VITE_SUPABASE_URL)
3. Restart terminal/IDE after changing environment variables

## Next Steps

After successful testing:

1. ✅ Run migration in production (if staging passed)
2. ✅ Seed categories in production
3. ✅ Update frontend to use new category structure
4. ✅ Test category filtering and search
5. ✅ Verify SEO metadata on category pages

## Rollback (If Needed)

If something goes wrong, you can rollback:

```sql
-- Remove trigger
DROP TRIGGER IF EXISTS trigger_update_category_path_slug ON categories;

-- Remove functions
DROP FUNCTION IF EXISTS update_category_path_slug();
DROP FUNCTION IF EXISTS populate_all_category_path_slugs();
DROP FUNCTION IF EXISTS generate_category_path_slug(UUID);

-- Remove indexes
DROP INDEX IF EXISTS idx_categories_meta_keywords;
DROP INDEX IF EXISTS idx_categories_path_slug;

-- Remove columns
ALTER TABLE categories 
DROP COLUMN IF EXISTS path_slug,
DROP COLUMN IF EXISTS seo_title,
DROP COLUMN IF EXISTS seo_description,
DROP COLUMN IF EXISTS meta_keywords;
```

---

**Last Updated**: 2025-01-01
**Status**: Ready for Testing ✅

