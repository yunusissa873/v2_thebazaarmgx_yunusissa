/**
 * Validate Category Seeding Results
 * 
 * This script validates that categories were seeded correctly
 * into the Supabase database.
 * 
 * Usage:
 *   npx tsx scripts/validate-seeding.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Load categories from JSON
const categoriesPath = path.join(__dirname, '../src/data/the_bazaar_categories_flat.json');
const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

// UUID generation function (same as in seed-categories.ts)
function generateUUIDFromString(input: string): string {
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const hash = createHash('md5').update(namespace + input).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '5' + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) + hash.substring(17, 20),
    hash.substring(20, 32)
  ].join('-');
}

async function validateSeeding() {
  console.log('🔍 Validating Category Seeding Results\n');
  console.log('='.repeat(80));

  // Test 1: Check total count
  console.log('\n📋 Test 1: Total Category Count');
  const { count, error: countError } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error(`   ❌ Error counting categories: ${countError.message}`);
    return;
  }

  const expectedCount = categoriesData.length;
  if (count === expectedCount) {
    console.log(`   ✅ Found ${count} categories (expected ${expectedCount})`);
  } else {
    console.log(`   ⚠️  Found ${count} categories (expected ${expectedCount})`);
    console.log(`   Difference: ${Math.abs(count! - expectedCount)}`);
  }

  // Test 2: Check required columns exist
  console.log('\n📋 Test 2: Required Columns Check');
  const { data: sampleCategory, error: sampleError } = await supabase
    .from('categories')
    .select('id, name, slug, path_slug, seo_title, seo_description, meta_keywords, level, parent_id')
    .limit(1)
    .single();

  if (sampleError) {
    console.error(`   ❌ Error fetching sample: ${sampleError.message}`);
  } else if (sampleCategory) {
    const requiredFields = ['id', 'name', 'slug', 'path_slug', 'seo_title', 'seo_description', 'meta_keywords'];
    const missingFields = requiredFields.filter(field => !(field in sampleCategory));
    
    if (missingFields.length === 0) {
      console.log(`   ✅ All required columns exist`);
      console.log(`   Sample category: ${sampleCategory.name}`);
    } else {
      console.log(`   ❌ Missing columns: ${missingFields.join(', ')}`);
    }
  }

  // Test 3: Check UUID format
  console.log('\n📋 Test 3: UUID Format Validation');
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name')
    .limit(10);

  if (categoriesError) {
    console.error(`   ❌ Error fetching categories: ${categoriesError.message}`);
  } else if (categories) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidUUIDs = categories.filter(cat => !uuidRegex.test(cat.id));
    
    if (invalidUUIDs.length === 0) {
      console.log(`   ✅ All ${categories.length} sample categories have valid UUIDs`);
    } else {
      console.log(`   ❌ Found ${invalidUUIDs.length} invalid UUIDs:`);
      invalidUUIDs.forEach(cat => {
        console.log(`      - ${cat.name}: ${cat.id}`);
      });
    }
  }

  // Test 4: Check parent-child relationships
  console.log('\n📋 Test 4: Parent-Child Relationships');
  const { data: categoriesWithParents, error: parentsError } = await supabase
    .from('categories')
    .select('id, name, parent_id, level')
    .not('parent_id', 'is', null)
    .limit(20);

  if (parentsError) {
    console.error(`   ❌ Error checking relationships: ${parentsError.message}`);
  } else if (categoriesWithParents) {
    // Check if parent IDs exist
    const parentIds = [...new Set(categoriesWithParents.map(c => c.parent_id))];
    const { data: parentsExist, error: parentsExistError } = await supabase
      .from('categories')
      .select('id')
      .in('id', parentIds);

    if (parentsExistError) {
      console.error(`   ❌ Error checking parent existence: ${parentsExistError.message}`);
    } else if (parentsExist && parentsExist.length === parentIds.length) {
      console.log(`   ✅ All ${parentIds.length} parent categories exist`);
    } else {
      const foundParentIds = new Set(parentsExist?.map(p => p.id) || []);
      const missingParents = parentIds.filter(id => !foundParentIds.has(id));
      console.log(`   ⚠️  Found ${foundParentIds.size}/${parentIds.length} parent categories`);
      if (missingParents.length > 0) {
        console.log(`   Missing parents: ${missingParents.slice(0, 5).join(', ')}${missingParents.length > 5 ? '...' : ''}`);
      }
    }
  }

  // Test 5: Check path_slug values
  console.log('\n📋 Test 5: Path Slug Values');
  const { data: categoriesWithSlugs, error: slugsError } = await supabase
    .from('categories')
    .select('id, name, slug, path_slug, level')
    .limit(20);

  if (slugsError) {
    console.error(`   ❌ Error checking path_slugs: ${slugsError.message}`);
  } else if (categoriesWithSlugs) {
    const missingSlugs = categoriesWithSlugs.filter(c => !c.path_slug || c.path_slug === '');
    const validSlugs = categoriesWithSlugs.filter(c => c.path_slug && c.path_slug.includes('/') || c.path_slug === c.slug);
    
    if (missingSlugs.length === 0) {
      console.log(`   ✅ All ${categoriesWithSlugs.length} sample categories have path_slugs`);
    } else {
      console.log(`   ⚠️  ${missingSlugs.length} categories missing path_slugs:`);
      missingSlugs.slice(0, 5).forEach(cat => {
        console.log(`      - ${cat.name} (level ${cat.level})`);
      });
    }
  }

  // Test 6: Check SEO fields
  console.log('\n📋 Test 6: SEO Fields');
  const { data: categoriesWithSEO, error: seoError } = await supabase
    .from('categories')
    .select('id, name, seo_title, seo_description, meta_keywords')
    .limit(20);

  if (seoError) {
    console.error(`   ❌ Error checking SEO fields: ${seoError.message}`);
  } else if (categoriesWithSEO) {
    const missingSEO = categoriesWithSEO.filter(c => 
      !c.seo_title || !c.seo_description || !c.meta_keywords || c.meta_keywords.length === 0
    );
    
    if (missingSEO.length === 0) {
      console.log(`   ✅ All ${categoriesWithSEO.length} sample categories have SEO fields`);
    } else {
      console.log(`   ⚠️  ${missingSEO.length} categories missing SEO fields:`);
      missingSEO.slice(0, 5).forEach(cat => {
        console.log(`      - ${cat.name}`);
      });
    }
  }

  // Test 7: Verify specific categories from JSON
  console.log('\n📋 Test 7: Verify Specific Categories');
  const testCategories = [
    { id: '51df0b3228', name: 'Fashion & Apparel', expectedUUID: generateUUIDFromString('51df0b3228') },
    { id: 'a82763ef71', name: "Women's Fashion", expectedUUID: generateUUIDFromString('a82763ef71') },
  ];

  for (const testCat of testCategories) {
    const { data: found, error: findError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('id', testCat.expectedUUID)
      .single();

    if (findError) {
      console.log(`   ⚠️  "${testCat.name}" not found (ID: ${testCat.expectedUUID})`);
    } else if (found) {
      console.log(`   ✅ Found "${found.name}" with UUID ${found.id}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('✨ Validation complete!');
  console.log('='.repeat(80));
}

// Run validation
validateSeeding().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

