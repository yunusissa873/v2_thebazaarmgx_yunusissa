/**
 * Migration Helper Script
 * 
 * This script helps you run the category SEO migration by:
 * 1. Reading the migration file
 * 2. Validating the SQL syntax
 * 3. Providing instructions for running in Supabase
 * 
 * Usage:
 *   npx tsx scripts/run-migration-helper.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationFile = path.join(__dirname, '../supabase/migrations/20250101000000_add_category_seo_fields.sql');

console.log('🚀 Category SEO Migration Helper\n');
console.log('='.repeat(80));

// Step 1: Read migration file
console.log('\n📋 Step 1: Reading Migration File');
console.log('─'.repeat(80));

try {
  const migrationSQL = fs.readFileSync(migrationFile, 'utf-8');
  console.log('✅ Migration file found');
  console.log(`   File: ${path.relative(process.cwd(), migrationFile)}`);
  console.log(`   Size: ${(migrationSQL.length / 1024).toFixed(2)} KB`);
  console.log(`   Lines: ${migrationSQL.split('\n').length}`);
} catch (error: any) {
  console.error('❌ Error reading migration file:', error.message);
  process.exit(1);
}

// Step 2: Validate SQL structure
console.log('\n📋 Step 2: Validating SQL Structure');
console.log('─'.repeat(80));

const migrationSQL = fs.readFileSync(migrationFile, 'utf-8');

const checks = [
  { name: 'ALTER TABLE categories', pattern: /ALTER TABLE categories/i, required: true },
  { name: 'CREATE FUNCTION generate_category_path_slug', pattern: /CREATE.*FUNCTION.*generate_category_path_slug/i, required: true },
  { name: 'CREATE FUNCTION populate_all_category_path_slugs', pattern: /CREATE.*FUNCTION.*populate_all_category_path_slugs/i, required: true },
  { name: 'CREATE FUNCTION update_category_path_slug', pattern: /CREATE.*FUNCTION.*update_category_path_slug/i, required: true },
  { name: 'CREATE TRIGGER', pattern: /CREATE TRIGGER.*trigger_update_category_path_slug/i, required: true },
  { name: 'CREATE INDEX path_slug', pattern: /CREATE INDEX.*idx_categories_path_slug/i, required: true },
  { name: 'CREATE INDEX meta_keywords', pattern: /CREATE INDEX.*idx_categories_meta_keywords/i, required: true },
];

let allChecksPassed = true;

checks.forEach(check => {
  if (check.pattern.test(migrationSQL)) {
    console.log(`✅ ${check.name}`);
  } else {
    if (check.required) {
      console.log(`❌ ${check.name} - REQUIRED`);
      allChecksPassed = false;
    } else {
      console.log(`⚠️  ${check.name} - Optional`);
    }
  }
});

if (!allChecksPassed) {
  console.log('\n❌ Migration file validation failed');
  process.exit(1);
}

// Step 3: Extract key information
console.log('\n📋 Step 3: Migration Summary');
console.log('─'.repeat(80));

const columnsToAdd = [
  'path_slug (TEXT)',
  'seo_title (TEXT)',
  'seo_description (TEXT)',
  'meta_keywords (TEXT[])',
];

console.log('Columns to add:');
columnsToAdd.forEach(col => console.log(`   • ${col}`));

console.log('\nFunctions to create:');
console.log('   • generate_category_path_slug(UUID) → TEXT');
console.log('   • populate_all_category_path_slugs() → INTEGER');
console.log('   • update_category_path_slug() → TRIGGER');

console.log('\nTriggers to create:');
console.log('   • trigger_update_category_path_slug (BEFORE INSERT OR UPDATE)');

console.log('\nIndexes to create:');
console.log('   • idx_categories_path_slug');
console.log('   • idx_categories_meta_keywords (GIN)');

// Step 4: Instructions
console.log('\n' + '='.repeat(80));
console.log('📋 Step 4: How to Run the Migration');
console.log('='.repeat(80));

console.log('\nOption 1: Supabase Dashboard (Recommended)');
console.log('─'.repeat(80));
console.log('1. Open Supabase Dashboard: https://app.supabase.com');
console.log('2. Select your project');
console.log('3. Go to SQL Editor (left sidebar)');
console.log('4. Click "New Query"');
console.log('5. Copy the migration file content:');
console.log(`   File: ${path.relative(process.cwd(), migrationFile)}`);
console.log('6. Paste into the SQL Editor');
console.log('7. Click "Run" or press Ctrl+Enter (Cmd+Enter on Mac)');
console.log('8. Verify success - you should see "Success. No rows returned"');

console.log('\nOption 2: Supabase CLI (if configured)');
console.log('─'.repeat(80));
console.log('1. Install Supabase CLI: npm install -g supabase');
console.log('2. Login: supabase login');
console.log('3. Link project: supabase link --project-ref your-project-ref');
console.log('4. Run migration: supabase db push');

// Step 5: Verification queries
console.log('\n' + '='.repeat(80));
console.log('📋 Step 5: Verification Queries');
console.log('='.repeat(80));
console.log('\nAfter running the migration, verify with these queries:\n');

const verificationQueries = [
  {
    name: 'Check if columns exist',
    sql: `SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name IN ('path_slug', 'seo_title', 'seo_description', 'meta_keywords')
ORDER BY column_name;`
  },
  {
    name: 'Check if functions exist',
    sql: `SELECT proname as function_name
FROM pg_proc 
WHERE proname IN ('generate_category_path_slug', 'populate_all_category_path_slugs', 'update_category_path_slug')
ORDER BY proname;`
  },
  {
    name: 'Check if trigger exists',
    sql: `SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'categories' 
AND trigger_name = 'trigger_update_category_path_slug';`
  },
  {
    name: 'Check if indexes exist',
    sql: `SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'categories' 
AND indexname IN ('idx_categories_path_slug', 'idx_categories_meta_keywords');`
  }
];

verificationQueries.forEach((query, index) => {
  console.log(`\n${index + 1}. ${query.name}:`);
  console.log('─'.repeat(80));
  console.log(query.sql);
});

// Step 6: Copy migration SQL to clipboard (if possible)
console.log('\n' + '='.repeat(80));
console.log('📋 Step 6: Migration SQL');
console.log('='.repeat(80));
console.log('\nMigration file content (copy this to Supabase SQL Editor):\n');
console.log('─'.repeat(80));
console.log(migrationSQL);
console.log('─'.repeat(80));

console.log('\n✨ Next Steps:');
console.log('   1. Copy the SQL above');
console.log('   2. Paste into Supabase SQL Editor');
console.log('   3. Run the migration');
console.log('   4. Verify with the queries in Step 5');
console.log('   5. Run seeding script: npx tsx scripts/seed-categories.ts');

