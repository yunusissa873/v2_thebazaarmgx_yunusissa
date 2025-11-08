/**
 * Seed Category Attributes from the_bazaar_category_attributes.json
 * 
 * This script reads the_bazaar_category_attributes.json and creates
 * a mapping table or stores attributes for product filtering.
 * 
 * Note: This assumes you have a category_attributes table or similar.
 * If not, you may want to store this in a JSONB column or create a separate table.
 * 
 * Usage:
 *   npx tsx scripts/seed-category-attributes.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

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

// Load attributes from JSON file
const attributesPath = path.join(__dirname, '../src/data/the_bazaar_category_attributes.json');
const attributesData = JSON.parse(fs.readFileSync(attributesPath, 'utf-8'));

interface AttributeDefinition {
  name: string;
  data_type: string;
  filterable: boolean;
  display_type: string;
  unit?: string;
}

interface CategoryAttribute {
  category_uuid: string;
  canonical_attributes: AttributeDefinition[];
  optional_attributes: AttributeDefinition[];
}

/**
 * Store category attributes in system_settings table as JSONB
 * This is a simple approach - you may want a dedicated table
 */
async function seedCategoryAttributes() {
  console.log('🌱 Starting category attributes seeding...');
  console.log(`   Found ${attributesData.length} category attribute mappings\n`);

  try {
    // Check if system_settings table exists and has a category_attributes key
    const { data: existing, error: fetchError } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'category_attributes')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is okay
      console.error('❌ Error checking existing settings:', fetchError.message);
      return;
    }

    // Store as JSONB in system_settings
    const { error: upsertError } = await supabase
      .from('system_settings')
      .upsert({
        key: 'category_attributes',
        value: attributesData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key',
      });

    if (upsertError) {
      console.error('❌ Error storing category attributes:', upsertError.message);
      return;
    }

    console.log('✅ Category attributes stored successfully!');
    console.log(`   Stored ${attributesData.length} category attribute mappings`);
    console.log('\n💡 Note: Attributes are stored in system_settings table.');
    console.log('   You can query them with:');
    console.log('   SELECT value FROM system_settings WHERE key = \'category_attributes\';');
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Alternative: Create a dedicated category_attributes table
async function createCategoryAttributesTable() {
  console.log('📋 Creating category_attributes table (if needed)...');

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS category_attributes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
      attribute_type TEXT NOT NULL CHECK (attribute_type IN ('canonical', 'optional')),
      attribute_name TEXT NOT NULL,
      data_type TEXT NOT NULL,
      filterable BOOLEAN DEFAULT true,
      display_type TEXT NOT NULL,
      unit TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(category_id, attribute_type, attribute_name)
    );

    CREATE INDEX IF NOT EXISTS idx_category_attributes_category_id ON category_attributes(category_id);
    CREATE INDEX IF NOT EXISTS idx_category_attributes_filterable ON category_attributes(filterable);
  `;

  // Note: This requires running SQL directly
  // You would need to use Supabase's SQL editor or a migration file
  console.log('   ⚠️  Table creation requires SQL migration.');
  console.log('   See: supabase/migrations/20250101000005_category_attributes_table.sql');
}

// Run the seeding
console.log('Choose storage method:');
console.log('1. Store in system_settings (JSONB) - Simple');
console.log('2. Create dedicated table - More structured');
console.log('\nRunning method 1 (system_settings)...\n');

seedCategoryAttributes().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


