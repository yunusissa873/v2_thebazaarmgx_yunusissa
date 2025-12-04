# Admin Portal Security Documentation

## 🔒 Security Overview

The Admin Portal implements multiple layers of security to protect against unauthorized access, hacking, scraping, and data breaches.

## 🛡️ Security Features

### 1. **Access Control**

#### IP Whitelisting
- Configure allowed IPs via `VITE_ADMIN_ALLOWED_IPS` environment variable
- Format: Comma-separated list (e.g., `192.168.1.1,10.0.0.1`)
- In production, access is denied if no IPs are configured
- Use `*` to allow all IPs (development only)

#### Domain Whitelisting
- Configure allowed domains via `VITE_ADMIN_ALLOWED_DOMAINS`
- Format: Comma-separated list (e.g., `admin.thebazaar.com,internal.thebazaar.com`)
- Supports subdomain matching (e.g., `*.thebazaar.com`)
- In production, access is denied if no domains are configured

#### Secret Key Protection
- Required secret key: `VITE_ADMIN_PORTAL_SECRET`
- Portal won't function in production without this key
- Prevents accidental exposure

### 2. **Authentication & Authorization**

#### Super Admin System
- **Super Admin**: Has `super_admin` permission in `admin_permissions` table
- **Regular Admin**: Has `admin` role but no `super_admin` permission
- Only super admins can:
  - Create staff accounts
  - Manage permissions
  - Deactivate staff accounts
  - Reset passwords

#### Role-Based Access Control (RBAC)
- All admin actions are logged in `audit_log` table
- Permissions stored in `admin_permissions` table
- Granular permissions:
  - `vendor_management`
  - `user_management`
  - `product_moderation`
  - `order_management`
  - `financial_management`
  - `content_moderation`
  - `analytics_view`
  - `settings_management`

### 3. **Rate Limiting**

#### Login Protection
- **5 attempts** per 15 minutes per email/IP
- Automatic lockout after exceeding limit
- Rate limit cleared on successful login
- All failed attempts logged to security events

#### Implementation
- In-memory storage (development)
- **Production**: Use Redis or similar for distributed rate limiting

### 4. **Security Monitoring**

#### Event Logging
All security events are logged:
- Failed login attempts
- Rate limit exceeded
- Unauthorized domain access
- Suspicious user agents
- Successful logins

#### Audit Trail
- All admin actions logged in `audit_log` table
- Includes:
  - Admin ID
  - Action type
  - Resource affected
  - Changes made
  - IP address
  - User agent
  - Timestamp

### 5. **Input Sanitization**

#### XSS Prevention
- All user inputs sanitized
- React automatically escapes content
- No `dangerouslySetInnerHTML` usage

#### CSRF Protection
- CSRF token generation available
- Should be implemented for state-changing operations

### 6. **Session Security**

#### Secure Sessions
- Sessions managed by Supabase Auth
- Auto-refresh enabled
- Secure cookie handling
- Session timeout on inactivity

### 7. **Bot Detection**

#### User Agent Analysis
- Detects suspicious user agents:
  - Bots, crawlers, scrapers
  - curl, wget, python-requests
  - Postman and similar tools
- Events logged for investigation

## 📋 Environment Variables

### Required for Production

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security Configuration
VITE_ADMIN_PORTAL_SECRET=your-secret-key-here
VITE_ADMIN_ALLOWED_IPS=192.168.1.1,10.0.0.1
VITE_ADMIN_ALLOWED_DOMAINS=admin.thebazaar.com
```

### Development

In development, security checks are relaxed:
- IP whitelisting optional
- Domain whitelisting optional
- Secret key optional

**⚠️ Never use development settings in production!**

## 🚀 Setup Instructions

### 1. Create Super Admin Account

The first admin account must be created manually in Supabase:

```sql
-- 1. Create auth user (via Supabase Dashboard or API)
-- 2. Create profile
INSERT INTO profiles (id, email, full_name, role, is_verified)
VALUES ('user-uuid', 'superadmin@thebazaar.com', 'Super Admin', 'admin', true);

-- 3. Grant super admin permission
INSERT INTO admin_permissions (admin_id, permission, granted_by)
VALUES ('user-uuid', 'super_admin', 'user-uuid');
```

### 2. Configure Environment

Create `.env.local` with all required variables (see above).

### 3. Deploy with Security

- Use HTTPS only
- Configure proper CORS
- Set security headers (see below)
- Enable firewall rules
- Use VPN or private network for admin access

## 🔐 Security Headers (Recommended)

Add these headers in your production server/CDN:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## 📝 Admin Staff Management

### Creating Staff Accounts

1. **Super Admin Only**: Navigate to `/admin-staff`
2. **Fill Form**:
   - Email
   - Full Name
   - Role (moderator, support, analyst, admin)
   - Permissions (checkboxes)
3. **Generate Password**: System generates secure temporary password
4. **Share Securely**: Send credentials via secure channel
5. **Force Password Change**: Staff must change password on first login

### Managing Permissions

- Super admin can update permissions for any staff member
- Changes are logged in audit trail
- Permissions take effect immediately

### Deactivating Accounts

- Super admin can deactivate staff accounts
- Deactivated accounts cannot log in
- All actions logged

## 🚨 Security Best Practices

1. **Never commit secrets** to version control
2. **Use strong passwords** for all admin accounts
3. **Enable 2FA** (recommended for future implementation)
4. **Regular audits** of admin permissions
5. **Monitor security events** daily
6. **Rotate secrets** periodically
7. **Limit super admin accounts** to minimum necessary
8. **Use VPN** for remote admin access
9. **Regular backups** of audit logs
10. **Incident response plan** ready

## 🔍 Monitoring & Alerts

### Key Metrics to Monitor

- Failed login attempts
- Rate limit triggers
- Unauthorized access attempts
- Suspicious user agents
- Admin permission changes
- Staff account creation/deactivation

### Alert Thresholds

- **Critical**: Multiple failed logins from same IP
- **High**: Unauthorized domain access attempt
- **Medium**: Rate limit exceeded
- **Low**: Suspicious user agent detected

## 🛠️ Troubleshooting

### Access Denied Errors

1. Check IP whitelist configuration
2. Verify domain whitelist
3. Check secret key is set
4. Verify admin role in database
5. Check admin_permissions table

### Rate Limit Issues

- Wait 15 minutes for reset
- Contact super admin to clear rate limit
- Check security events log

## 📞 Support

For security issues or questions:
- Contact: security@thebazaar.com
- Emergency: [Emergency contact]
- Security Policy: [Link to policy]

---

**Last Updated**: 2025-01-01
**Version**: 1.0.0


