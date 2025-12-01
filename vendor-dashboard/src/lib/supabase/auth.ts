import { supabase } from './client';

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign in an existing vendor
 */
export async function signIn(data: SignInData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { data: null, error };
    }

    // Verify user is a vendor
    if (authData.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, id')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        return { data: null, error: profileError };
      }

      // Check if user is a vendor
      if (profile?.role !== 'vendor') {
        await supabase.auth.signOut();
        return { 
          data: null, 
          error: { 
            message: 'Access denied. Vendor account required.' 
          } 
        };
      }

      // Verify vendor profile exists
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('id, is_verified')
        .eq('profile_id', authData.user.id)
        .single();

      if (vendorError && vendorError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is okay for new vendors
        return { data: null, error: vendorError };
      }
    }

    return { data: authData, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error };
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get vendor profile for current user
 */
export async function getVendorProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('profile_id', userId)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
}


