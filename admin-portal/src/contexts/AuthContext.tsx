import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { AdminRole } from '@/types/admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  adminRole: AdminRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchAdminRole(session.user.id);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Auth error:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchAdminRole(session.user.id);
      } else {
        setAdminRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, id')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Check if user is admin
      if (data?.role === 'admin') {
        // Check if user has admin permissions
        const { data: permissions } = await supabase
          .from('admin_permissions')
          .select('permission')
          .eq('admin_id', userId);

        // Check if super admin (has 'super_admin' permission or is the first admin)
        const isSuperAdmin = permissions?.some(p => p.permission === 'super_admin') || false;
        
        setAdminRole(isSuperAdmin ? 'super_admin' : 'admin');
      } else {
        setAdminRole(null);
        toast.error('Access denied. Admin privileges required.');
      }
    } catch (error) {
      console.error('Error fetching admin role:', error);
      setAdminRole(null);
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        await fetchAdminRole(data.user.id);
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAdminRole(null);
  };

  const value = {
    user,
    session,
    adminRole,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
    isAuthenticated: !!user && !!adminRole,
    isAdmin: !!adminRole,
    isSuperAdmin: adminRole === 'super_admin',
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

