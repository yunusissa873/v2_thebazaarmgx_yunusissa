/**
 * Check Supabase Connection
 * 
 * This script verifies that Supabase credentials are configured
 * and tests the connection to your Supabase database.
 * 
 * Usage:
 *   npx tsx scripts/check-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

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

// Load environment variables (support both formats)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('🔍 Checking Supabase Configuration\n');
console.log('='.repeat(80));

// Check 1: Environment Variables
console.log('\n📋 Check 1: Environment Variables');
console.log('─'.repeat(80));

let hasErrors = false;

if (!supabaseUrl) {
  console.log('❌ SUPABASE_URL: Not found');
  console.log('   Expected: SUPABASE_URL or VITE_SUPABASE_URL');
  hasErrors = true;
} else {
  console.log('✅ SUPABASE_URL: Found');
  console.log(`   Value: ${supabaseUrl.substring(0, 30)}...`);
}

if (!supabaseServiceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY: Not found');
  console.log('   Expected: SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY');
  hasErrors = true;
} else {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY: Found');
  console.log(`   Value: ${supabaseServiceKey.substring(0, 20)}... (hidden)`);
}

if (!supabaseAnonKey) {
  console.log('⚠️  SUPABASE_ANON_KEY: Not found (optional for seeding)');
} else {
  console.log('✅ SUPABASE_ANON_KEY: Found');
}

// Check 2: .env.local file
console.log('\n📋 Check 2: Environment File');
console.log('─'.repeat(80));

try {
  const envContent = readFileSync(envPath, 'utf-8');
  console.log('✅ .env.local file exists');
  
  // Check which variables are in the file
  const hasUrl = envContent.includes('SUPABASE_URL') || envContent.includes('VITE_SUPABASE_URL');
  const hasServiceKey = envContent.includes('SERVICE_ROLE_KEY');
  
  if (hasUrl && hasServiceKey) {
    console.log('✅ Environment variables found in .env.local');
  } else {
    console.log('⚠️  Some environment variables may be missing in .env.local');
  }
} catch (error) {
  console.log('⚠️  .env.local file not found');
  console.log('   You can create it in the project root with:');
  console.log('   SUPABASE_URL=your-url');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-key');
}

// Check 3: Test Connection
console.log('\n📋 Check 3: Database Connection Test');
console.log('─'.repeat(80));

if (hasErrors) {
  console.log('❌ Cannot test connection - missing credentials');
  console.log('\n💡 To fix:');
  console.log('   1. Create .env.local file in project root');
  console.log('   2. Add: SUPABASE_URL=your-project-url');
  console.log('   3. Add: SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  console.log('   4. Get credentials from: Supabase Dashboard → Settings → API');
  process.exit(1);
}

try {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Test 1: Check if we can query the database
  console.log('🔄 Testing database connection...');
  const { data, error } = await supabase
    .from('categories')
    .select('count')
    .limit(1);

  if (error) {
    // Check if it's because table doesn't exist
    if (error.message.includes('does not exist') || error.code === '42P01') {
      console.log('⚠️  categories table does not exist yet');
      console.log('   This is okay if you haven\'t run migrations yet');
      
      // Try to check if we can connect at all
      const { error: testError } = await supabase.rpc('version');
      if (testError) {
        console.log('❌ Database connection failed');
        console.log(`   Error: ${testError.message}`);
        hasErrors = true;
      } else {
        console.log('✅ Database connection successful');
        console.log('   Categories table will be created by migration');
      }
    } else {
      console.log('❌ Database connection failed');
      console.log(`   Error: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      hasErrors = true;
    }
  } else {
    console.log('✅ Database connection successful');
    console.log('✅ Categories table exists');
  }

  // Test 2: Check if categories table has SEO columns
  console.log('\n🔄 Checking categories table structure...');
  const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
    query: `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'categories' 
      AND column_name IN ('path_slug', 'seo_title', 'seo_description', 'meta_keywords')
    `
  }).catch(() => ({ data: null, error: { message: 'RPC not available' } }));

  if (!columnsError && columns) {
    const seoColumns = ['path_slug', 'seo_title', 'seo_description', 'meta_keywords'];
    const existingColumns = columns.map((c: any) => c.column_name);
    const missingColumns = seoColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('✅ All SEO columns exist in categories table');
      console.log('   Migration appears to have been run already');
    } else {
      console.log('⚠️  SEO columns not found in categories table');
      console.log(`   Missing: ${missingColumns.join(', ')}`);
      console.log('   You need to run the migration first');
    }
  } else {
    // Try alternative method
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('path_slug, seo_title')
      .limit(1);
    
    if (testError && testError.message.includes('column')) {
      console.log('⚠️  SEO columns not found in categories table');
      console.log('   You need to run the migration first');
    } else if (!testError) {
      console.log('✅ SEO columns exist in categories table');
    }
  }

} catch (error: any) {
  console.log('❌ Connection test failed');
  console.log(`   Error: ${error.message}`);
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(80));
console.log('📊 Summary');
console.log('='.repeat(80));

if (hasErrors) {
  console.log('❌ Configuration check failed');
  console.log('\n💡 Next Steps:');
  console.log('   1. Ensure .env.local file exists with correct credentials');
  console.log('   2. Get credentials from: Supabase Dashboard → Settings → API');
  console.log('   3. Run this script again to verify');
  process.exit(1);
} else {
  console.log('✅ All checks passed!');
  console.log('\n✨ You\'re ready to:');
  console.log('   1. Run the migration in Supabase SQL Editor');
  console.log('   2. Run the seeding script: npx tsx scripts/seed-categories.ts');
  console.log('   3. Validate results: npx tsx scripts/validate-seeding.ts');
  process.exit(0);
}

