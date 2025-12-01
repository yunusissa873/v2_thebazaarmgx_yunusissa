import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  validateAdminPortalAccess,
  logSecurityEvent,
  isSuspiciousUserAgent,
  checkRateLimit,
  clearRateLimit,
} from './accessControl';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Security Middleware Component
 * Wraps the admin portal to enforce security checks
 *
 * NOTE: This is a client-side UI guard. Real access control must be enforced
 * by server-side RLS and server endpoints. This component only controls
 * the admin UI and logs events for monitoring.
 */
export function SecurityMiddleware({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [denyReason, setDenyReason] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    let mounted = true;

    const runChecks = async () => {
      setIsChecking(true);
      setIsAuthorized(false);

      // 1) Validate domain / environment client-side (UX guard only)
      const validation = validateAdminPortalAccess();
      if (!validation.allowed) {
        logSecurityEvent('access_denied_client_validation', {
          reason: validation.reason,
          path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        });
        if (!mounted) return;
        setDenyReason(validation.reason);
        setIsChecking(false);
        setIsAuthorized(false);
        return;
      }

      // 2) Suspicious UA — log only
      if (typeof window !== 'undefined') {
        const ua = window.navigator.userAgent;
        if (isSuspiciousUserAgent(ua)) {
          logSecurityEvent('suspicious_user_agent', { userAgent: ua, path: window.location.pathname });
          // We still allow it, but it's logged for monitoring.
        }
      }

      // 3) Rate limiting (client-side in-memory fallback)
      const identifier =
        (auth?.user?.id as string | undefined) ??
        (typeof window !== 'undefined' ? `anon:${window.location.hostname}` : 'unknown');
      const rateOk = checkRateLimit(identifier, 20, 60 * 1000); // 20 attempts / 60s window
      if (!rateOk) {
        logSecurityEvent('rate_limit_exceeded', { identifier, path: typeof window !== 'undefined' ? window.location.pathname : 'unknown' });
        if (!mounted) return;
        setDenyReason('rate_limit_exceeded');
        setIsChecking(false);
        setIsAuthorized(false);
        return;
      }

      // 4) Wait for auth context to initialize (short timeout)
      const waitForAuth = async () => {
        const timeoutAt = Date.now() + 4000; // wait up to 4s
        while (mounted && auth && auth.loading && Date.now() < timeoutAt) {
          await new Promise((r) => setTimeout(r, 100));
        }
      };
      await waitForAuth();

      // 5) Ensure there is a logged-in user
      if (!auth || !auth.user) {
        logSecurityEvent('no_session_client', { path: typeof window !== 'undefined' ? window.location.pathname : 'unknown' });
        if (!mounted) return;
        setIsChecking(false);
        setIsAuthorized(false);
        // Optionally navigate to login: uncomment next line if desired:
        // navigate('/admin/login');
        return;
      }

      // 6) Ensure admin role: only 'admin' or 'super_admin' allowed
      // auth.adminRole should be set by your AuthContext
      const role = auth.adminRole;
      if (!role || (role !== 'admin' && role !== 'super_admin')) {
        logSecurityEvent('access_denied_not_admin', { userId: auth.user?.id, role, path: typeof window !== 'undefined' ? window.location.pathname : 'unknown' });
        if (!mounted) return;
        clearRateLimit(identifier); // clear local attempts on explicit denial (optional)
        setDenyReason('not_admin');
        setIsChecking(false);
        setIsAuthorized(false);
        return;
      }

      // All checks passed
      if (!mounted) return;
      setIsAuthorized(true);
      setDenyReason(undefined);
      setIsChecking(false);
    };

    runChecks().catch((err) => {
      console.error('SecurityMiddleware error:', err);
      logSecurityEvent('security_middleware_error', { error: String(err), path: typeof window !== 'undefined' ? window.location.pathname : 'unknown' });
      setIsAuthorized(false);
      setIsChecking(false);
    });

    return () => {
      mounted = false;
    };
  }, [auth, navigate]);

  // Loading UI (identical to your original)
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Denied UI (keeps your original look + shows reason optionally)
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You are not authorized to access this portal{denyReason ? ` (${denyReason})` : ''}.
          </p>
          <p className="text-sm text-gray-500">If you believe this is an error, please contact the system administrator.</p>
        </div>
      </div>
    );
  }

  // Authorized — render children
  return <>{children}</>;
}
