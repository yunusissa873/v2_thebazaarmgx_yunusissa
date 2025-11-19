# Category Files Location & Usage Guide

## 📁 File Locations

### 1. Frontend Category Data
**Location**: `workspace/shadcn-ui/src/data/the_bazaar_categories.ts`
- **Type**: TypeScript nested structure
- **Usage**: Imported in React components for category display
- **Status**: ✅ Already imported in:
  - `src/hooks/useMockData.ts`
  - `src/pages/CategoriesPage.tsx`

### 2. Backend Category Data (Flat JSON)
**Location**: `workspace/shadcn-ui/src/data/the_bazaar_categories_flat.json`
- **Type**: Flat JSON array
- **Usage**: Seed Supabase database
- **Status**: ✅ File exists
- **Seeding Script**: `workspace/shadcn-ui/scripts/seed-categories.ts`

### 3. Category Attributes
**Location**: `workspace/shadcn-ui/src/data/the_bazaar_category_attributes.json`
- **Type**: JSON array of attribute mappings
- **Usage**: Product filtering and search
- **Status**: ✅ File exists
- **Seeding Script**: `workspace/shadcn-ui/scripts/seed-category-attributes.ts`

## 🔄 Migration Files

### 1. Category SEO & Path Enhancement
**Location**: `workspace/shadcn-ui/supabase/migrations/20250101000000_add_category_seo_fields.sql`
- **Purpose**: Adds `path_slug`, `seo_title`, `seo_description`, `meta_keywords` to categories table
- **Status**: ✅ Created (was missing, now restored)
- **Run Order**: Should run BEFORE seeding categories

### 2. Category Attributes Table
**Location**: `workspace/shadcn-ui/supabase/migrations/20250101000005_category_attributes_table.sql`
- **Purpose**: Creates `category_attributes` table for storing attribute definitions
- **Status**: ✅ Created
- **Run Order**: Can run after category seeding

## 📋 Complete Migration Order

Run migrations in this order:

1. ✅ `20250101000000_add_category_seo_fields.sql` - **Category SEO fields**
2. ✅ `20250101000001_auth_setup.sql` - Auth triggers
3. ✅ `20250101000002_admin_portal_tables.sql` - Admin tables
4. ✅ `20250101000003_vendor_portal_enhancements.sql` - Vendor policies
5. ✅ `20250101000005_category_attributes_table.sql` - Category attributes table

## 🚀 Setup Instructions

### Step 1: Run Category SEO Migration

In Supabase SQL Editor, run:
```
workspace/shadcn-ui/supabase/migrations/20250101000000_add_category_seo_fields.sql
```

This adds:
- `path_slug` TEXT
- `seo_title` TEXT
- `seo_description` TEXT
- `meta_keywords` TEXT[]

### Step 2: Seed Categories to Database

```bash
cd workspace/shadcn-ui

# Set environment variables
export VITE_SUPABASE_URL="your-supabase-url"
export VITE_SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run seeding script
npx tsx scripts/seed-categories.ts
```

This will:
- Read `the_bazaar_categories_flat.json`
- Insert/update all 338 categories
- Populate path_slugs automatically

### Step 3: Seed Category Attributes (Optional)

**Option A: Store in system_settings (Simple)**
```bash
npx tsx scripts/seed-category-attributes.ts
```

**Option B: Use dedicated table (Recommended)**
1. Run migration: `20250101000005_category_attributes_table.sql`
2. Then run a script to populate from JSON (to be created)

### Step 4: Verify Frontend Integration

The frontend is already set up:
- ✅ `useMockData.ts` imports `the_bazaar_categories.ts`
- ✅ `CategoriesPage.tsx` uses the category data
- ✅ Categories are displayed in the UI

## 📊 Data Structure

### Category Structure (from the_bazaar_categories.ts)
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  path_slug: string;           // e.g., "electronics/smartphones/iphone"
  level: number;               // 1-4
  sort_order: number;
  image_url: string;
  seo_title: string;
  seo_description: string;
  meta_keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
}
```

### Attribute Structure (from the_bazaar_category_attributes.json)
```json
{
  "category_uuid": "category-id",
  "canonical_attributes": [
    {
      "name": "brand",
      "data_type": "string",
      "filterable": true,
      "display_type": "select"
    }
  ],
  "optional_attributes": [...]
}
```

## 🔍 Current Integration Status

### Frontend ✅
- [x] `the_bazaar_categories.ts` imported in `useMockData.ts`
- [x] `CategoriesPage.tsx` uses category data
- [x] Category display working

### Backend ⚠️
- [x] Migration file created (`20250101000000_add_category_seo_fields.sql`)
- [x] Seeding script created (`seed-categories.ts`)
- [ ] **Action Required**: Run migration in Supabase
- [ ] **Action Required**: Run seeding script

### Attributes ⚠️
- [x] Attribute file exists
- [x] Migration for attributes table created
- [ ] **Action Required**: Run attributes migration
- [ ] **Action Required**: Seed attributes data

## 📝 Next Steps

1. **Run Category SEO Migration**:
   - Open Supabase SQL Editor
   - Run `20250101000000_add_category_seo_fields.sql`

2. **Seed Categories**:
   ```bash
   cd workspace/shadcn-ui
   npx tsx scripts/seed-categories.ts
   ```

3. **Run Attributes Migration** (optional):
   - Run `20250101000005_category_attributes_table.sql` in Supabase

4. **Verify**:
   - Check categories in Supabase: `SELECT * FROM categories LIMIT 10;`
   - Check frontend displays categories correctly
   - Test category filtering

## 🛠️ Troubleshooting

### Categories not showing in frontend
- Check if `useMockData.ts` is importing correctly
- Verify `bazaarCategories` is exported from `the_bazaar_categories.ts`
- Check browser console for errors

### Seeding fails
- Verify Supabase credentials are set
- Check if migration was run first
- Verify JSON file is valid

### Path slugs not populated
- The trigger should auto-populate, but you can manually run:
  ```sql
  SELECT populate_all_category_path_slugs();
  ```

---

**Last Updated**: 2025-01-01


