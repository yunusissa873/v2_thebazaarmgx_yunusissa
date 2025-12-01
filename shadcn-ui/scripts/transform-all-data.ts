/**
 * Master Data Transformation Script
 * Transforms all mock data for frontend and backend ingestion
 */

import { transformCategories } from './transform-categories';
import { transformVendors } from './transform-vendors';
import { transformProducts } from './transform-products';
import { transformAttributes } from './transform-attributes';

function transformAllData() {
  console.log('🔄 Starting data transformation...\n');
  
  try {
    console.log('1️⃣ Transforming Categories...');
    transformCategories();
    
    console.log('\n2️⃣ Transforming Vendors...');
    transformVendors();
    
    console.log('\n3️⃣ Transforming Products...');
    transformProducts();
    
    console.log('\n4️⃣ Transforming Attributes...');
    transformAttributes();
    
    console.log('\n✅ All transformations complete!');
    console.log('\n📁 Output directory: src/data/transformed');
    console.log('\n📋 Generated files:');
    console.log('   Frontend (TypeScript):');
    console.log('     - categories.ts');
    console.log('     - vendors.ts');
    console.log('     - products.ts');
    console.log('     - attributes.ts');
    console.log('   Backend (JSON):');
    console.log('     - categories_flat.json');
    console.log('     - vendors_flat.json');
    console.log('     - products_flat.json');
    console.log('     - variants_flat.json');
    console.log('     - attributes_flat.json');
  } catch (error) {
    console.error('❌ Transformation failed:', error);
    process.exit(1);
  }
}

transformAllData();

