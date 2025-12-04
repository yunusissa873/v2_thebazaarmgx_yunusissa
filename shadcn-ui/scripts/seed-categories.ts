/**
 * Seed Categories from the_bazaar_categories_flat.json
 * 
 * This script reads the_bazaar_categories_flat.json and inserts/updates
 * categories in the Supabase database.
 * 
 * Usage:
 *   npx tsx scripts/seed-categories.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (support both VITE_ and standard prefixes)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_ prefixed versions)');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Load categories from JSON file
const categoriesPath = path.join(__dirname, '../src/data/the_bazaar_categories_flat.json');
const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  path_slug: string;
  level: number;
  sort_order: number;
  image_url: string;
  seo_title: string;
  seo_description: string;
  meta_keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Convert custom hex string ID to UUID format (deterministic)
 * Since JSON has custom IDs like "51df0b3228", we need to generate UUIDs
 * and maintain a mapping for parent_id references.
 * Uses MD5 hash to create deterministic UUIDs from custom IDs.
 */
function generateUUIDFromString(input: string): string {
  // Create a deterministic UUID v5-like format using MD5 hash
  // Use a namespace UUID for The Bazaar categories
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS namespace
  const hash = createHash('md5').update(namespace + input).digest('hex');
  
  // Format as UUID: xxxxxxxx-xxxx-5xxx-xxxx-xxxxxxxxxxxx
  // Version 5 uses bits 12-15 of the time_hi_and_version field = 0x50xx
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '5' + hash.substring(13, 16), // Version 5
    ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.substring(17, 20), // Variant
    hash.substring(20, 32)
  ].join('-');
}

async function seedCategories() {
  console.log('🌱 Starting category seeding...');
  console.log(`   Found ${categoriesData.length} categories to seed\n`);

  // Step 1: Create ID mapping from custom IDs to UUIDs
  console.log('📋 Step 1: Generating UUID mappings...');
  const idMapping = new Map<string, string>();
  
  for (const category of categoriesData) {
    const categoryData: CategoryData = category;
    // Generate UUID for each custom ID
    const uuid = generateUUIDFromString(categoryData.id);
    idMapping.set(categoryData.id, uuid);
  }
  
  console.log(`   ✅ Generated ${idMapping.size} UUID mappings\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ id: string; name: string; error: string }> = [];

  // Step 2: Process categories in batches, ordered by level to ensure parents exist first
  console.log('📦 Step 2: Seeding categories (ordered by level)...');
  const sortedCategories = [...categoriesData].sort((a, b) => a.level - b.level);
  
  const batchSize = 50;
  for (let i = 0; i < sortedCategories.length; i += batchSize) {
    const batch = sortedCategories.slice(i, i + batchSize);
    
    console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(sortedCategories.length / batchSize)}...`);

    for (const category of batch) {
      try {
        const categoryData: CategoryData = category;
        const categoryUUID = idMapping.get(categoryData.id)!;
        const parentUUID = categoryData.parent_id ? idMapping.get(categoryData.parent_id) || null : null;

        // Prepare data for insert/update with UUIDs
        const insertData = {
          id: categoryUUID,
          name: categoryData.name,
          slug: categoryData.slug,
          parent_id: parentUUID,
          path_slug: categoryData.path_slug,
          level: categoryData.level,
          sort_order: categoryData.sort_order,
          image_url: categoryData.image_url,
          seo_title: categoryData.seo_title,
          seo_description: categoryData.seo_description,
          meta_keywords: categoryData.meta_keywords,
          is_active: categoryData.is_active,
          created_at: categoryData.created_at,
          updated_at: categoryData.updated_at,
        };

        // Use upsert to insert or update
        const { error } = await supabase
          .from('categories')
          .upsert(insertData, {
            onConflict: 'id',
            ignoreDuplicates: false,
          });

        if (error) {
          errorCount++;
          errors.push({
            id: categoryData.id,
            name: categoryData.name,
            error: error.message,
          });
          console.error(`   ❌ Failed: ${categoryData.name} - ${error.message}`);
        } else {
          successCount++;
        }
      } catch (error: any) {
        errorCount++;
        errors.push({
          id: category.id || 'unknown',
          name: category.name || 'unknown',
          error: error.message || 'Unknown error',
        });
        console.error(`   ❌ Error processing category: ${error.message}`);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Seeding Summary');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total: ${categoriesData.length}`);

  if (errors.length > 0) {
    console.log('\n⚠️  Errors encountered:');
    errors.slice(0, 10).forEach((err) => {
      console.log(`   - ${err.name} (${err.id}): ${err.error}`);
    });
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }

  // After seeding, populate path_slugs using the function
  console.log('\n🔄 Populating path_slugs for all categories...');
  const { data: functionResult, error: functionError } = await supabase.rpc('populate_all_category_path_slugs');

  if (functionError) {
    console.error('   ⚠️  Could not auto-populate path_slugs:', functionError.message);
    console.log('   ℹ️  Path slugs should already be set from the JSON data');
  } else {
    console.log(`   ✅ Updated ${functionResult || 'all'} category path slugs`);
  }

  console.log('\n✨ Category seeding complete!');
}

// Run the seeding
seedCategories().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


