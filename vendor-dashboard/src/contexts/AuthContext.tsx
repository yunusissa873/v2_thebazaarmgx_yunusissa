import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { signIn, signOut as authSignOut, getVendorProfile } from '@/lib/supabase/auth';
import type { SignInData } from '@/lib/supabase/auth';

interface VendorProfile {
  id: string;
  business_name: string;
  is_verified: boolean;
  kyc_status: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  vendorProfile: VendorProfile | null;
  loading: boolean;
  signIn: (data: SignInData) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isVendor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isSupabaseConfigured = supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co';

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchVendorProfile(session.user.id);
      }
      setLoading(false);
    }).catch((error) => {
      console.warn('Vendor Portal auth error:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchVendorProfile(session.user.id);
      } else {
        setVendorProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchVendorProfile = async (userId: string) => {
    try {
      const { data, error } = await getVendorProfile(userId);
      if (error) {
        console.error('Error fetching vendor profile:', error);
        setVendorProfile(null);
        return;
      }
      setVendorProfile(data);
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      setVendorProfile(null);
    }
  };

  const handleSignIn = async (data: SignInData) => {
    const result = await signIn(data);
    if (!result.error && result.data?.user) {
      await fetchVendorProfile(result.data.user.id);
    }
    return { error: result.error };
  };

  const handleSignOut = async () => {
    await authSignOut();
    setUser(null);
    setSession(null);
    setVendorProfile(null);
  };

  const value = {
    user,
    session,
    vendorProfile,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!user && !!vendorProfile,
    isVendor: !!vendorProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


