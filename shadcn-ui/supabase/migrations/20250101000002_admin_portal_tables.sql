-- ============================================================================
-- Migration: Admin Portal Database Tables
-- Description: Creates tables for admin portal functionality
-- Date: 2025-01-01
-- Version: 1.0.0
-- ============================================================================

-- Audit Log Table
-- Create table if it doesn't exist, or enhance existing table
DO $$ 
BEGIN
    -- Create audit_log table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
        CREATE TABLE audit_log (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
            admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
            action TEXT NOT NULL,
            target_resource TEXT,
            target_resource_id UUID,
            resource_type TEXT,
            resource_id UUID,
            details JSONB,
            changes JSONB,
            ip_address INET,
            user_agent TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX idx_audit_log_profile_id ON audit_log(profile_id);
        CREATE INDEX idx_audit_log_admin_id ON audit_log(admin_id);
        CREATE INDEX idx_audit_log_action ON audit_log(action);
        CREATE INDEX idx_audit_log_target_resource ON audit_log(target_resource, target_resource_id);
        CREATE INDEX idx_audit_log_resource_type ON audit_log(resource_type);
        CREATE INDEX idx_audit_log_resource_id ON audit_log(resource_id);
        CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
    ELSE
        -- Table exists, add new columns if they don't exist
        -- Add admin_id (alias for profile_id when admin performs action)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'audit_log' AND column_name = 'admin_id') THEN
            ALTER TABLE audit_log ADD COLUMN admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
            -- Migrate existing data: set admin_id = profile_id for admin users
            UPDATE audit_log 
            SET admin_id = profile_id 
            WHERE profile_id IN (SELECT id FROM profiles WHERE role = 'admin');
        END IF;

        -- Add resource_type (normalize target_resource)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'audit_log' AND column_name = 'resource_type') THEN
            ALTER TABLE audit_log ADD COLUMN resource_type TEXT;
            -- Migrate existing data
            UPDATE audit_log SET resource_type = target_resource WHERE target_resource IS NOT NULL;
        END IF;

        -- Add resource_id (alias for target_resource_id)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'audit_log' AND column_name = 'resource_id') THEN
            ALTER TABLE audit_log ADD COLUMN resource_id UUID;
            -- Migrate existing data
            UPDATE audit_log SET resource_id = target_resource_id WHERE target_resource_id IS NOT NULL;
        END IF;

        -- Add changes (alias for details)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'audit_log' AND column_name = 'changes') THEN
            ALTER TABLE audit_log ADD COLUMN changes JSONB;
            -- Migrate existing data
            UPDATE audit_log SET changes = details WHERE details IS NOT NULL;
        END IF;

        -- Add security tracking fields
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'audit_log' AND column_name = 'ip_address') THEN
            ALTER TABLE audit_log ADD COLUMN ip_address INET;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'audit_log' AND column_name = 'user_agent') THEN
            ALTER TABLE audit_log ADD COLUMN user_agent TEXT;
        END IF;

        -- Create indexes if they don't exist
        CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON audit_log(admin_id);
        CREATE INDEX IF NOT EXISTS idx_audit_log_resource_type ON audit_log(resource_type);
        CREATE INDEX IF NOT EXISTS idx_audit_log_resource_id ON audit_log(resource_id);
    END IF;
END $$;

-- Add comments (works whether table was just created or already existed)
COMMENT ON TABLE audit_log IS 'Logs all admin actions for security and compliance';
COMMENT ON COLUMN audit_log.admin_id IS 'Admin user who performed the action (alias for profile_id)';
COMMENT ON COLUMN audit_log.resource_type IS 'Type of resource affected (vendor, user, product, order)';
COMMENT ON COLUMN audit_log.changes IS 'JSON object containing the changes made (alias for details)';
COMMENT ON COLUMN audit_log.ip_address IS 'IP address of the admin who performed the action';
COMMENT ON COLUMN audit_log.user_agent IS 'User agent of the admin who performed the action';

-- Admin Permissions Table
CREATE TABLE IF NOT EXISTS admin_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    permission TEXT NOT NULL,
    resource_type TEXT,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_permissions_admin_id ON admin_permissions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_permissions_permission ON admin_permissions(permission);

COMMENT ON TABLE admin_permissions IS 'Granular permissions for admin users';
COMMENT ON COLUMN admin_permissions.permission IS 'Permission name (e.g., vendor.approve, user.suspend)';
COMMENT ON COLUMN admin_permissions.resource_type IS 'Resource type this permission applies to';

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

COMMENT ON TABLE system_settings IS 'Platform-wide configuration settings';
COMMENT ON COLUMN system_settings.key IS 'Setting key (e.g., platform.name, payment.gateway)';
COMMENT ON COLUMN system_settings.value IS 'Setting value as JSON';

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_vendor_id ON support_tickets(vendor_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

COMMENT ON TABLE support_tickets IS 'Customer and vendor support tickets';
COMMENT ON COLUMN support_tickets.status IS 'Current status of the ticket';
COMMENT ON COLUMN support_tickets.priority IS 'Priority level of the ticket';

-- Vendor Wallets Table (for financial management)
CREATE TABLE IF NOT EXISTS vendor_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0,
    currency currency DEFAULT 'KES',
    pending_payouts DECIMAL(12, 2) DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0,
    total_payouts DECIMAL(12, 2) DEFAULT 0,
    last_payout_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_wallets_vendor_id ON vendor_wallets(vendor_id);

COMMENT ON TABLE vendor_wallets IS 'Vendor wallet balances and payout tracking';
COMMENT ON COLUMN vendor_wallets.balance IS 'Current available balance';
COMMENT ON COLUMN vendor_wallets.pending_payouts IS 'Amount pending payout processing';

-- Escrow Accounts Table (for order escrow)
CREATE TABLE IF NOT EXISTS escrow_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE UNIQUE,
    amount DECIMAL(12, 2) NOT NULL,
    currency currency DEFAULT 'KES',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'released', 'refunded')),
    held_until TIMESTAMPTZ,
    released_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_accounts_order_id ON escrow_accounts(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_accounts_status ON escrow_accounts(status);

COMMENT ON TABLE escrow_accounts IS 'Escrow accounts for order payments';
COMMENT ON COLUMN escrow_accounts.status IS 'Current escrow status';

-- Fraud Alerts Table
CREATE TABLE IF NOT EXISTS fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('suspicious_transaction', 'duplicate_order', 'fake_review', 'vendor_fraud', 'buyer_fraud')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    related_entity_type TEXT NOT NULL CHECK (related_entity_type IN ('order', 'vendor', 'user', 'product')),
    related_entity_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'false_positive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_fraud_alerts_type ON fraud_alerts(type);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_severity ON fraud_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_related_entity ON fraud_alerts(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_created_at ON fraud_alerts(created_at DESC);

COMMENT ON TABLE fraud_alerts IS 'Fraud detection and monitoring alerts';
COMMENT ON COLUMN fraud_alerts.type IS 'Type of fraud detected';
COMMENT ON COLUMN fraud_alerts.severity IS 'Severity level of the alert';

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('failed_login', 'suspicious_activity', 'unauthorized_access', 'data_breach_attempt')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_resolved ON security_events(resolved);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

COMMENT ON TABLE security_events IS 'Security monitoring and threat detection events';
COMMENT ON COLUMN security_events.type IS 'Type of security event';
COMMENT ON COLUMN security_events.severity IS 'Severity level of the event';

-- Communication Logs Table
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('vendor_to_buyer', 'buyer_to_vendor', 'admin_to_vendor', 'admin_to_buyer')),
    from_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    subject TEXT,
    message TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('chat', 'email', 'sms', 'notification')),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_communication_logs_type ON communication_logs(type);
CREATE INDEX IF NOT EXISTS idx_communication_logs_from_id ON communication_logs(from_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_to_id ON communication_logs(to_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_channel ON communication_logs(channel);
CREATE INDEX IF NOT EXISTS idx_communication_logs_created_at ON communication_logs(created_at DESC);

COMMENT ON TABLE communication_logs IS 'Logs all communications between vendors, buyers, and admins';
COMMENT ON COLUMN communication_logs.type IS 'Type of communication';
COMMENT ON COLUMN communication_logs.channel IS 'Communication channel used';

-- Ad Revenue Table
CREATE TABLE IF NOT EXISTS ad_revenue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    ad_type TEXT NOT NULL CHECK (ad_type IN ('banner', 'featured', 'promotion')),
    amount DECIMAL(12, 2) NOT NULL,
    currency currency DEFAULT 'KES',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_revenue_vendor_id ON ad_revenue(vendor_id);
CREATE INDEX IF NOT EXISTS idx_ad_revenue_ad_type ON ad_revenue(ad_type);
CREATE INDEX IF NOT EXISTS idx_ad_revenue_status ON ad_revenue(status);
CREATE INDEX IF NOT EXISTS idx_ad_revenue_dates ON ad_revenue(start_date, end_date);

COMMENT ON TABLE ad_revenue IS 'Advertisement and promotional revenue tracking';
COMMENT ON COLUMN ad_revenue.ad_type IS 'Type of advertisement';

-- Enable RLS on new tables
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_revenue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Admin Tables
-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can manage permissions
CREATE POLICY "Admins can manage permissions" ON admin_permissions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can manage system settings
CREATE POLICY "Admins can manage system settings" ON system_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Admins and assigned support staff can view tickets
CREATE POLICY "Admins can view all tickets" ON support_tickets FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (
    user_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
);

-- Only admins can view vendor wallets
CREATE POLICY "Admins can view vendor wallets" ON vendor_wallets FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can view escrow accounts
CREATE POLICY "Admins can view escrow accounts" ON escrow_accounts FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can view fraud alerts
CREATE POLICY "Admins can view fraud alerts" ON fraud_alerts FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can view security events
CREATE POLICY "Admins can view security events" ON security_events FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can view communication logs
CREATE POLICY "Admins can view communication logs" ON communication_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Only admins can view ad revenue
CREATE POLICY "Admins can view ad revenue" ON ad_revenue FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- Rollback Script
-- ============================================================================
/*
DROP POLICY IF EXISTS "Admins can view ad revenue" ON ad_revenue;
DROP POLICY IF EXISTS "Admins can view communication logs" ON communication_logs;
DROP POLICY IF EXISTS "Admins can view security events" ON security_events;
DROP POLICY IF EXISTS "Admins can view fraud alerts" ON fraud_alerts;
DROP POLICY IF EXISTS "Admins can view escrow accounts" ON escrow_accounts;
DROP POLICY IF EXISTS "Admins can view vendor wallets" ON vendor_wallets;
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can manage permissions" ON admin_permissions;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_log;

DROP TABLE IF EXISTS ad_revenue;
DROP TABLE IF EXISTS communication_logs;
DROP TABLE IF EXISTS security_events;
DROP TABLE IF EXISTS fraud_alerts;
DROP TABLE IF EXISTS escrow_accounts;
DROP TABLE IF EXISTS vendor_wallets;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS admin_permissions;
DROP TABLE IF EXISTS audit_log;
*/

