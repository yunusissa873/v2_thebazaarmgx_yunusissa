/**
 * Admin Portal Access Control & Security
 * 
 * This module implements multiple layers of security:
 * - IP Whitelisting
 * - Domain/Subdomain restrictions
 * - Environment-based access control
 * - Rate limiting
 * - Security monitoring
 */

// IP Whitelist - Add your authorized IPs here
// In production, this should be loaded from environment variables or a secure config
const ALLOWED_IPS = import.meta.env.VITE_ADMIN_ALLOWED_IPS
  ? import.meta.env.VITE_ADMIN_ALLOWED_IPS.split(',').map((ip: string) => ip.trim())
  : [];

// Allowed domains/subdomains
const ALLOWED_DOMAINS = import.meta.env.VITE_ADMIN_ALLOWED_DOMAINS
  ? import.meta.env.VITE_ADMIN_ALLOWED_DOMAINS.split(',').map((domain: string) => domain.trim())
  : [];

// Admin portal secret key (for additional verification)
const ADMIN_PORTAL_SECRET = import.meta.env.VITE_ADMIN_PORTAL_SECRET || '';

// Rate limiting storage (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if IP is whitelisted
 */
export function isIPWhitelisted(ip: string): boolean {
  // If no IPs are configured, allow all (for development)
  // In production, this should be strict
  if (ALLOWED_IPS.length === 0) {
    if (import.meta.env.PROD) {
      console.warn('⚠️ No IP whitelist configured in production!');
      return false; // Deny in production if not configured
    }
    return true; // Allow in development
  }

  return ALLOWED_IPS.includes(ip) || ALLOWED_IPS.includes('*');
}

/**
 * Check if domain is allowed
 */
export function isDomainAllowed(hostname: string): boolean {
  // If no domains configured, allow all (for development)
  if (ALLOWED_DOMAINS.length === 0) {
    if (import.meta.env.PROD) {
      console.warn('⚠️ No domain whitelist configured in production!');
      return false;
    }
    return true;
  }

  return ALLOWED_DOMAINS.some(domain => {
    if (domain === '*') return true;
    return hostname === domain || hostname.endsWith(`.${domain}`);
  });
}

/**
 * Get client IP address
 */
export function getClientIP(): string {
  // In browser, we can't get real IP, but we can check headers if available
  // This is mainly for server-side checks
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  // Try to get from headers (if available via API)
  // For client-side, we'll use a different approach
  return 'client-side';
}

/**
 * Rate limiting check
 */
export function checkRateLimit(identifier: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    // Reset or create new record
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxAttempts) {
    // Rate limit exceeded
    logSecurityEvent('rate_limit_exceeded', {
      identifier,
      attempts: record.count,
    });
    return false;
  }

  // Increment count
  record.count++;
  rateLimitStore.set(identifier, record);
  return true;
}

/**
 * Clear rate limit for identifier (on successful login)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Log security events
 */
export function logSecurityEvent(eventType: string, details: Record<string, any>): void {
  const event = {
    type: eventType,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    ...details,
  };

  // Log to console in development (guarded)
  try {
    if (!import.meta.env.PROD) {
      // use warn so it stands out
      // eslint-disable-next-line no-console
      console.warn('🔒 Security Event:', event);
    }
  } catch (e) {
    // swallow console errors to avoid breaking app
  }

  // In production, send to security monitoring service
  // You can integrate with your security monitoring system here
  if (import.meta.env.PROD) {
    // Example: Send to Supabase security_events table
    // This would be done via an API call
    // fetch('/api/security-event', { method: 'POST', body: JSON.stringify(event) })
    // Keep commented out here to avoid accidental calls; implement as needed.
  }
}

/**
 * Validate admin portal access
 */
export function validateAdminPortalAccess(): {
  allowed: boolean;
  reason?: string;
} {
  // Check domain
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    if (!isDomainAllowed(hostname)) {
      logSecurityEvent('unauthorized_domain_access', { hostname });
      return {
        allowed: false,
        reason: 'Unauthorized domain',
      };
    }
  }

  // Check environment
  if (import.meta.env.PROD && !ADMIN_PORTAL_SECRET) {
    logSecurityEvent('missing_secret_config', {});
    return {
      allowed: false,
      reason: 'Admin portal not properly configured',
    };
  }

  return { allowed: true };
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  // Guard crypto availability (SSR or restricted env might not have it)
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    // fallthrough to fallback
  }

  // Fallback deterministic-ish token (not cryptographically strong) - used only if crypto unavailable
  // Note: in production you should ensure crypto is available or generate on server
  const fallback = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return fallback;
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string | null): boolean {
  if (!storedToken) return false;
  return token === storedToken;
}

/**
 * Check if user agent is suspicious
 */
export function isSuspiciousUserAgent(userAgent: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /postman/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  // Guard document availability (SSR safety)
  if (typeof document === 'undefined') {
    // can't sanitize via DOM -> return escaped minimal fallback
    return input.replace(/[&<>"']/g, (c) => {
      switch (c) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#39;';
        default: return c;
      }
    });
  }

  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}
