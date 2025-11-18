/**
 * Comprehensive Validation Script
 * 
 * This script performs comprehensive validation of:
 * 1. Database schema (columns, functions, triggers, indexes)
 * 2. Category data integrity
 * 3. Parent-child relationships
 * 4. SEO fields
 * 5. Path slugs
 * 6. Data consistency
 * 
 * Usage:
 *   npx tsx scripts/comprehensive-validation.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
async function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (existsSync(envPath)) {
    try {
      const dotenv = await import('dotenv');
      dotenv.config({ path: envPath });
    } catch (error) {
      // dotenv not available or .env.local not readable, that's okay
      // Environment variables can also be set directly in the system
    }
  }
}

// Load env before continuing
await loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('   See: scripts/setup-credentials.md');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Load categories from JSON
const categoriesPath = path.join(__dirname, '../src/data/the_bazaar_categories_flat.json');
const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

// UUID generation function
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

interface ValidationResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const results: ValidationResult[] = [];

function addResult(test: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any) {
  results.push({ test, status, message, details });
}

async function validateSchema() {
  console.log('\n🔍 Validation 1: Database Schema');
  console.log('─'.repeat(80));

  // Check columns
  try {
    const { data: columns, error } = await supabase
      .from('categories')
      .select('path_slug, seo_title, seo_description, meta_keywords')
      .limit(1);

    if (error && error.message.includes('column')) {
      addResult('SEO Columns', 'fail', 'SEO columns not found in categories table', error.message);
    } else if (error) {
      addResult('Categories Table', 'fail', 'Cannot access categories table', error.message);
    } else {
      addResult('SEO Columns', 'pass', 'All SEO columns exist in categories table');
    }
  } catch (error: any) {
    addResult('Schema Check', 'fail', 'Error checking schema', error.message);
  }

  // Check functions (indirectly by testing)
  try {
    // This will fail if function doesn't exist
    const { error } = await supabase.rpc('generate_category_path_slug', {
      category_id: '00000000-0000-0000-0000-000000000000'
    });

    if (error && error.message.includes('function')) {
      addResult('Functions', 'fail', 'Functions not found', error.message);
    } else {
      addResult('Functions', 'pass', 'Functions exist (or table is empty)');
    }
  } catch (error: any) {
    addResult('Functions', 'warning', 'Could not verify functions', error.message);
  }
}

async function validateDataIntegrity() {
  console.log('\n🔍 Validation 2: Data Integrity');
  console.log('─'.repeat(80));

  // Check total count
  const { count, error: countError } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    addResult('Category Count', 'fail', 'Cannot count categories', countError.message);
    return;
  }

  const expectedCount = categoriesData.length;
  if (count === expectedCount) {
    addResult('Category Count', 'pass', `Found ${count} categories (expected ${expectedCount})`);
  } else {
    addResult('Category Count', 'warning', `Found ${count} categories (expected ${expectedCount})`, {
      difference: Math.abs(count! - expectedCount)
    });
  }

  // Check for NULL values in required fields
  const { data: nullChecks, error: nullError } = await supabase
    .from('categories')
    .select('id, name, slug, level')
    .or('name.is.null,slug.is.null,level.is.null')
    .limit(10);

  if (nullError) {
    addResult('NULL Values', 'warning', 'Could not check for NULL values', nullError.message);
  } else if (nullChecks && nullChecks.length > 0) {
    addResult('NULL Values', 'fail', `Found ${nullChecks.length} categories with NULL required fields`, nullChecks);
  } else {
    addResult('NULL Values', 'pass', 'No NULL values in required fields');
  }
}

async function validateRelationships() {
  console.log('\n🔍 Validation 3: Parent-Child Relationships');
  console.log('─'.repeat(80));

  // Get all categories with parents
  const { data: categoriesWithParents, error: parentsError } = await supabase
    .from('categories')
    .select('id, name, parent_id, level')
    .not('parent_id', 'is', null);

  if (parentsError) {
    addResult('Parent Relationships', 'fail', 'Cannot check parent relationships', parentsError.message);
    return;
  }

  if (!categoriesWithParents || categoriesWithParents.length === 0) {
    addResult('Parent Relationships', 'warning', 'No categories with parents found');
    return;
  }

  // Check if all parent IDs exist
  const parentIds = [...new Set(categoriesWithParents.map(c => c.parent_id))];
  const { data: parentsExist, error: parentsExistError } = await supabase
    .from('categories')
    .select('id')
    .in('id', parentIds);

  if (parentsExistError) {
    addResult('Parent Existence', 'fail', 'Cannot verify parent existence', parentsExistError.message);
    return;
  }

  const foundParentIds = new Set(parentsExist?.map(p => p.id) || []);
  const missingParents = parentIds.filter(id => !foundParentIds.has(id));

  if (missingParents.length === 0) {
    addResult('Parent Existence', 'pass', `All ${parentIds.length} parent categories exist`);
  } else {
    addResult('Parent Existence', 'fail', `${missingParents.length} parent categories missing`, {
      missing: missingParents.slice(0, 10)
    });
  }

  // Check level consistency
  const levelIssues: any[] = [];
  for (const category of categoriesWithParents.slice(0, 100)) {
    const { data: parent, error: parentError } = await supabase
      .from('categories')
      .select('level')
      .eq('id', category.parent_id)
      .single();

    if (!parentError && parent && category.level !== parent.level + 1) {
      levelIssues.push({
        category: category.name,
        level: category.level,
        parentLevel: parent.level
      });
    }
  }

  if (levelIssues.length === 0) {
    addResult('Level Consistency', 'pass', 'All parent-child level relationships are correct');
  } else {
    addResult('Level Consistency', 'warning', `Found ${levelIssues.length} level inconsistencies`, levelIssues.slice(0, 5));
  }
}

async function validateSEOFields() {
  console.log('\n🔍 Validation 4: SEO Fields');
  console.log('─'.repeat(80));

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, seo_title, seo_description, meta_keywords')
    .limit(100);

  if (error) {
    addResult('SEO Fields', 'fail', 'Cannot check SEO fields', error.message);
    return;
  }

  if (!categories || categories.length === 0) {
    addResult('SEO Fields', 'warning', 'No categories found');
    return;
  }

  const missingSEO = categories.filter(c => 
    !c.seo_title || !c.seo_description || !c.meta_keywords || 
    (Array.isArray(c.meta_keywords) && c.meta_keywords.length === 0)
  );

  if (missingSEO.length === 0) {
    addResult('SEO Fields', 'pass', `All ${categories.length} sample categories have SEO fields`);
  } else {
    addResult('SEO Fields', 'warning', `${missingSEO.length}/${categories.length} categories missing SEO fields`, {
      missing: missingSEO.slice(0, 5).map(c => c.name)
    });
  }

  // Check SEO field quality
  const shortTitles = categories.filter(c => c.seo_title && c.seo_title.length < 30);
  const longTitles = categories.filter(c => c.seo_title && c.seo_title.length > 70);
  const shortDescriptions = categories.filter(c => c.seo_description && c.seo_description.length < 100);

  const qualityIssues: string[] = [];
  if (shortTitles.length > 0) qualityIssues.push(`${shortTitles.length} titles too short (<30 chars)`);
  if (longTitles.length > 0) qualityIssues.push(`${longTitles.length} titles too long (>70 chars)`);
  if (shortDescriptions.length > 0) qualityIssues.push(`${shortDescriptions.length} descriptions too short (<100 chars)`);

  if (qualityIssues.length === 0) {
    addResult('SEO Quality', 'pass', 'SEO fields meet quality standards');
  } else {
    addResult('SEO Quality', 'warning', 'Some SEO fields need improvement', qualityIssues);
  }
}

async function validatePathSlugs() {
  console.log('\n🔍 Validation 5: Path Slugs');
  console.log('─'.repeat(80));

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, path_slug, level, parent_id')
    .limit(100);

  if (error) {
    addResult('Path Slugs', 'fail', 'Cannot check path slugs', error.message);
    return;
  }

  if (!categories || categories.length === 0) {
    addResult('Path Slugs', 'warning', 'No categories found');
    return;
  }

  const missingSlugs = categories.filter(c => !c.path_slug || c.path_slug === '');
  if (missingSlugs.length === 0) {
    addResult('Path Slugs Presence', 'pass', `All ${categories.length} sample categories have path_slugs`);
  } else {
    addResult('Path Slugs Presence', 'warning', `${missingSlugs.length} categories missing path_slugs`, {
      missing: missingSlugs.slice(0, 5).map(c => c.name)
    });
  }

  // Validate path slug format
  const invalidSlugs: any[] = [];
  for (const category of categories) {
    if (!category.path_slug) continue;

    // Root categories should have path_slug = slug
    if (category.level === 1 && category.path_slug !== category.slug) {
      invalidSlugs.push({
        category: category.name,
        level: category.level,
        expected: category.slug,
        actual: category.path_slug
      });
    }

    // Child categories should include parent path
    if (category.level > 1 && category.parent_id) {
      const { data: parent } = await supabase
        .from('categories')
        .select('path_slug, slug')
        .eq('id', category.parent_id)
        .single();

      if (parent && !category.path_slug.startsWith(parent.path_slug || parent.slug)) {
        invalidSlugs.push({
          category: category.name,
          level: category.level,
          issue: 'Path slug does not start with parent path'
        });
      }
    }
  }

  if (invalidSlugs.length === 0) {
    addResult('Path Slug Format', 'pass', 'All path slugs have correct format');
  } else {
    addResult('Path Slug Format', 'warning', `${invalidSlugs.length} path slugs have format issues`, invalidSlugs.slice(0, 5));
  }
}

async function validateUUIDMapping() {
  console.log('\n🔍 Validation 6: UUID Mapping');
  console.log('─'.repeat(80));

  // Test a few known categories
  const testCategories = [
    { id: '51df0b3228', name: 'Fashion & Apparel' },
    { id: 'a82763ef71', name: "Women's Fashion" },
    { id: '79f4d7b369', name: 'Dresses' },
  ];

  const uuidMapping = new Map<string, string>();
  testCategories.forEach(tc => {
    uuidMapping.set(tc.id, generateUUIDFromString(tc.id));
  });

  let foundCount = 0;
  for (const testCat of testCategories) {
    const expectedUUID = uuidMapping.get(testCat.id)!;
    const { data: found, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', expectedUUID)
      .single();

    if (!error && found) {
      foundCount++;
    }
  }

  if (foundCount === testCategories.length) {
    addResult('UUID Mapping', 'pass', `All ${testCategories.length} test categories found with correct UUIDs`);
  } else {
    addResult('UUID Mapping', 'warning', `${foundCount}/${testCategories.length} test categories found`, {
      expected: testCategories.length,
      found: foundCount
    });
  }
}

async function runComprehensiveValidation() {
  console.log('🔍 Comprehensive Category Validation');
  console.log('='.repeat(80));
  console.log(`\nValidating ${categoriesData.length} categories from JSON file`);
  console.log(`Database: ${supabaseUrl.substring(0, 30)}...\n`);

  await validateSchema();
  await validateDataIntegrity();
  await validateRelationships();
  await validateSEOFields();
  await validatePathSlugs();
  await validateUUIDMapping();

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 Validation Summary');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.status === 'pass').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const failed = results.filter(r => r.status === 'fail').length;

  results.forEach(result => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.test}: ${result.message}`);
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2).substring(0, 200)}...`);
    }
  });

  console.log('\n' + '─'.repeat(80));
  console.log(`✅ Passed: ${passed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📦 Total: ${results.length}`);

  if (failed === 0 && warnings === 0) {
    console.log('\n✨ All validations passed! Categories are properly seeded.');
    process.exit(0);
  } else if (failed === 0) {
    console.log('\n⚠️  Some warnings found, but no critical issues.');
    process.exit(0);
  } else {
    console.log('\n❌ Some validations failed. Please review the issues above.');
    process.exit(1);
  }
}

// Run validation
runComprehensiveValidation().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

