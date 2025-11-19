import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Admin portal uses service role key for elevated permissions
// This should ONLY be used server-side or in a secure admin environment
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For admin operations, we may need service role key
// But for client-side, we use anon key with RLS policies
const adminKey = supabaseServiceKey || supabaseAnonKey;

const hasValidCredentials = 
  supabaseUrl && 
  adminKey && 
  supabaseUrl.startsWith('https://') &&
  adminKey.length > 0;

if (!hasValidCredentials) {
  console.error('⚠️ Admin Portal: Supabase credentials not found or invalid.');
  console.error('   Please check your .env.local file has VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY');
} else {
  console.log('✓ Admin Portal: Supabase credentials loaded successfully');
}

// Admin client with service role key (if available) for elevated permissions
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  adminKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Regular client for standard operations
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

export const isSupabaseConfigured = hasValidCredentials;


