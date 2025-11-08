import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate credentials
const hasValidCredentials = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 0;

if (!hasValidCredentials) {
  console.warn('⚠️ Supabase credentials not found or invalid. App will work with mock data only.');
  console.warn('   Please check your .env.local file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
} else {
  console.log('✓ Supabase credentials loaded successfully');
}

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

// Export connection status for debugging
export const isSupabaseConfigured = hasValidCredentials;
