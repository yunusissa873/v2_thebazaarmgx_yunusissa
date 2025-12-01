/**
 * Test Supabase connection
 * Run this to verify Supabase credentials are working
 */

import { supabase } from './client';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('Supabase URL:', supabaseUrl ? '✓ Configured' : '✗ Missing');
  console.log('Supabase Anon Key:', supabaseAnonKey ? '✓ Configured' : '✗ Missing');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase credentials are missing!');
    return { success: false, error: 'Missing credentials' };
  }

  try {
    // Test 1: Check if we can query a simple table
    console.log('\n1. Testing database connection...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);

    if (productsError) {
      console.warn('⚠️ Products table query failed:', productsError.message);
      console.log('   This might be expected if the table doesn\'t exist yet or RLS is blocking access.');
    } else {
      console.log('✓ Products table accessible');
      console.log('   Sample products:', products?.length || 0);
    }

    // Test 2: Check authentication
    console.log('\n2. Testing authentication...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.warn('⚠️ Auth check failed:', authError.message);
    } else {
      console.log('✓ Authentication service accessible');
      console.log('   Current session:', session ? 'Active' : 'No active session');
    }

    // Test 3: Check if tables exist (by trying to query them)
    console.log('\n3. Testing table access...');
    const tables = ['products', 'orders', 'reviews', 'cart_items', 'wishlists'];
    const tableStatus: Record<string, boolean> = {};

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);
        tableStatus[table] = !error;
        if (error) {
          console.warn(`   ⚠️ ${table}: ${error.message}`);
        } else {
          console.log(`   ✓ ${table}: Accessible`);
        }
      } catch (err: any) {
        tableStatus[table] = false;
        console.warn(`   ✗ ${table}: ${err.message}`);
      }
    }

    console.log('\n✅ Supabase connection test completed!');
    console.log('\nSummary:');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Tables accessible: ${Object.values(tableStatus).filter(Boolean).length}/${tables.length}`);

    return {
      success: true,
      url: supabaseUrl,
      tables: tableStatus,
      hasSession: !!session,
    };
  } catch (error: any) {
    console.error('❌ Connection test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Auto-run if imported directly (for testing in browser console)
if (import.meta.hot) {
  // Only in development
  (window as any).testSupabase = testSupabaseConnection;
}

