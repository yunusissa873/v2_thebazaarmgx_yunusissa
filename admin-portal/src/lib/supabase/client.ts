import { createClient } from '@supabase/supabase-js';

/**
 * Admin Portal Supabase Client (SAFE)
 *
 * IMPORTANT:
 * - The service_role key MUST NEVER be used in frontend code.
 * - The admin portal still uses RLS and the anon key.
 * - Admin authorization should be enforced using the admin role system,
 *   not elevated client keys.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing.');
  console.error('   Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY exist in .env');
} else {
  console.log('✓ Supabase client loaded.');
}

/**
 * SINGLE SAFE CLIENT
 * ------------------
 * Admin portal does NOT get elevated DB permissions.
 * Admin authorization is enforced through:
 *   - profiles.role (admin / super_admin)
 *   - admin_permissions table
 *   - proper RLS policies
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// No service key, no unsafe export
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;
