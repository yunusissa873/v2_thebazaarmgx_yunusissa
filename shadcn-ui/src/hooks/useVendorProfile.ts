/**
 * Vendor Profile Hook
 * 
 * Fetches vendor profile data for authenticated user
 * 
 * @author The Bazaar Development Team
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Vendor = Database['public']['Tables']['vendors']['Row'];

export function useVendorProfile() {
  const { user } = useAuth();
  const [vendorProfile, setVendorProfile] = useState<Vendor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setVendorProfile(null);
      setIsLoading(false);
      return;
    }

    async function fetchVendorProfile() {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('vendors')
          .select('*')
          .eq('profile_id', user.id)
          .single();

        if (fetchError) {
          // If no vendor profile exists, that's okay - user might need to register
          if (fetchError.code === 'PGRST116') {
            setVendorProfile(null);
          } else {
            setError(fetchError as Error);
          }
        } else {
          setVendorProfile(data);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVendorProfile();
  }, [user]);

  return { vendorProfile, isLoading, error };
}
