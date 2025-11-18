import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateAdminPortalAccess, logSecurityEvent, isSuspiciousUserAgent } from './accessControl';

/**
 * Security Middleware Component
 * Wraps the admin portal to enforce security checks
 */
export function SecurityMiddleware({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Validate access
    const validation = validateAdminPortalAccess();
    
    if (!validation.allowed) {
      logSecurityEvent('access_denied', {
        reason: validation.reason,
        path: window.location.pathname,
      });
      setIsAuthorized(false);
      setIsChecking(false);
      
      // Redirect to error page or show access denied
      return;
    }

    // Check for suspicious user agents
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent;
      if (isSuspiciousUserAgent(userAgent)) {
        logSecurityEvent('suspicious_user_agent', { userAgent });
        // Still allow but log the event
      }
    }

    setIsAuthorized(true);
    setIsChecking(false);
  }, []);

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

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            You are not authorized to access this portal.
          </p>
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact the system administrator.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


