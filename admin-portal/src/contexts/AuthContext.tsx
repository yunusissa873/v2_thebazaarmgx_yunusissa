import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

type AdminRole = 'admin' | 'super_admin' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  adminRole: AdminRole;
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
  const [adminRole, setAdminRole] = useState<AdminRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          await verifyAdminAndSetRole(data.session.user.id);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      setSession(session ?? null);
      setUser(session?.user ?? null);
      setAdminRole(null); // reset while we check

      if (session?.user) {
        await verifyAdminAndSetRole(session.user.id);
      } else {
        setAdminRole(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  /**
   * verifyAdminAndSetRole
   * - Reads profiles.role for the user
   * - If role === 'super_admin' => set super_admin
   * - If role === 'admin' => read admin_permissions to see if super_admin permission exists
   * - If not admin => sign out + deny access
   *
   * NOTE: This runs on the client and requires RLS to permit the authenticated user to SELECT from profiles.
   * If your RLS blocks these reads, move role checks server-side (I can provide server code).
   */
  const verifyAdminAndSetRole = async (userId: string) => {
    try {
      // read profile role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profileError) {
        // If RLS blocks reads or any other error happens, treat as not allowed
        console.error('Error reading profile:', profileError);
        await denyAccess('Unable to verify admin role (profile read failed).');
        return;
      }

      const role = profile?.role ?? null;

      // If explicitly super_admin in profile, grant super admin immediately
      if (role === 'super_admin') {
        setAdminRole('super_admin');
        return;
      }

      // If explicitly admin, check admin_permissions for super_admin permission
      if (role === 'admin') {
        const { data: permissions, error: permsError } = await supabase
          .from('admin_permissions')
          .select('permission')
          .eq('admin_id', userId);

        if (permsError) {
          console.error('Error reading admin_permissions:', permsError);
          // Treat failure to read permissions as non-admin for safety
          await denyAccess('Unable to verify admin permissions.');
          return;
        }

        const isSuper = Array.isArray(permissions) && permissions.some((p: any) => p.permission === 'super_admin');
        setAdminRole(isSuper ? 'super_admin' : 'admin');
        return;
      }

      // Any other role -> deny access to admin portal
      await denyAccess('Access denied. Admin privileges required.');
    } catch (err) {
      console.error('verifyAdminAndSetRole error:', err);
      await denyAccess('Unexpected error verifying admin role.');
    }
  };

  // Deny access helper: sign out user, clear role, show toast
  const denyAccess = async (message?: string) => {
    setAdminRole(null);
    toast.error(message ?? 'Access denied.');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error signing out after denyAccess:', e);
    }
    setUser(null);
    setSession(null);
  };

  // Sign in (email/password)
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };

      // If login succeeded, verify admin on the returned user id (if present)
      if (data.user) {
        await verifyAdminAndSetRole(data.user.id);
      }

      return { error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setAdminRole(null);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    adminRole,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user && !!adminRole, // only true if user is admin
    isAdmin: adminRole !== null,
    isSuperAdmin: adminRole === 'super_admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
