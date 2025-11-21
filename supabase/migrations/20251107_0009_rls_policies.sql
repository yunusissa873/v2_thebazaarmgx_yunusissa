-- ============================================================
-- THE BAZAAR - Migration 0009
-- Row Level Security (RLS) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_payout_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_statement_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update any profile"
    ON profiles FOR UPDATE
    USING (is_admin(auth.uid()));

-- ============================================================
-- VENDORS POLICIES
-- ============================================================

CREATE POLICY "Active vendors are viewable by everyone"
    ON vendors FOR SELECT
    USING (status = 'active' OR profile_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Vendors can update own vendor"
    ON vendors FOR UPDATE
    USING (profile_id = auth.uid() OR EXISTS (
        SELECT 1 FROM vendor_staff 
        WHERE vendor_id = vendors.id 
        AND profile_id = auth.uid() 
        AND role IN ('owner', 'manager')
    ));

CREATE POLICY "Admins can manage all vendors"
    ON vendors FOR ALL
    USING (is_admin(auth.uid()));

-- ============================================================
-- VENDOR STAFF POLICIES
-- ============================================================

CREATE POLICY "Vendor staff can view own vendor staff"
    ON vendor_staff FOR SELECT
    USING (
        vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Vendor owners can manage staff"
    ON vendor_staff FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM vendor_staff vs
            WHERE vs.vendor_id = vendor_staff.vendor_id
            AND vs.profile_id = auth.uid()
            AND vs.role = 'owner'
        )
        OR is_admin(auth.uid())
    );

-- ============================================================
-- ADMIN STAFF POLICIES
-- ============================================================

CREATE POLICY "Only admins can view admin staff"
    ON admin_staff FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Only super admins can manage admin staff"
    ON admin_staff FOR ALL
    USING (is_super_admin(auth.uid()));

-- ============================================================
-- CATEGORIES POLICIES
-- ============================================================

CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Only admins can manage categories"
    ON categories FOR ALL
    USING (is_admin(auth.uid()));

-- ============================================================
-- CATEGORY ATTRIBUTES POLICIES
-- ============================================================

CREATE POLICY "Category attributes are viewable by everyone"
    ON category_attributes FOR SELECT
    USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Only admins can manage category attributes"
    ON category_attributes FOR ALL
    USING (is_admin(auth.uid()));

CREATE POLICY "Category attribute values are viewable by everyone"
    ON category_attribute_values FOR SELECT
    USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Only admins can manage category attribute values"
    ON category_attribute_values FOR ALL
    USING (is_admin(auth.uid()));

-- ============================================================
-- BRANDS POLICIES
-- ============================================================

CREATE POLICY "Active brands are viewable by everyone"
    ON brands FOR SELECT
    USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Vendors can manage own brands"
    ON brands FOR ALL
    USING (vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()) OR is_admin(auth.uid()));

-- ============================================================
-- PRODUCTS POLICIES
-- ============================================================

CREATE POLICY "Active products are viewable by everyone"
    ON products FOR SELECT
    USING (is_active = true OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Vendors can manage own products"
    ON products FOR ALL
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid() AND role IN ('owner', 'manager', 'staff'))
        OR is_admin(auth.uid())
    );

-- ============================================================
-- PRODUCT VARIANTS POLICIES
-- ============================================================

CREATE POLICY "Product variants are viewable with products"
    ON product_variants FOR SELECT
    USING (
        is_active = true 
        OR product_id IN (SELECT id FROM products WHERE vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()))
        OR is_admin(auth.uid())
    );

CREATE POLICY "Vendors can manage own product variants"
    ON product_variants FOR ALL
    USING (
        product_id IN (SELECT id FROM products WHERE vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()))
        OR is_admin(auth.uid())
    );

-- ============================================================
-- ORDERS POLICIES
-- ============================================================

CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (
        buyer_id = auth.uid()
        OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Users can create orders"
    ON orders FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Vendors can update own orders"
    ON orders FOR UPDATE
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

-- ============================================================
-- ORDER ITEMS POLICIES
-- ============================================================

CREATE POLICY "Order items viewable with orders"
    ON order_items FOR SELECT
    USING (
        order_id IN (SELECT id FROM orders WHERE buyer_id = auth.uid())
        OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

-- ============================================================
-- REVIEWS POLICIES
-- ============================================================

CREATE POLICY "Approved reviews are viewable by everyone"
    ON reviews FOR SELECT
    USING (is_approved = true OR buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()) OR is_admin(auth.uid()));

CREATE POLICY "Users can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update own reviews"
    ON reviews FOR UPDATE
    USING (buyer_id = auth.uid() OR is_admin(auth.uid()));

-- ============================================================
-- CHAT POLICIES
-- ============================================================

CREATE POLICY "Users can view own chats"
    ON chat_threads FOR SELECT
    USING (
        buyer_id = auth.uid()
        OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Users can create chat threads"
    ON chat_threads FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can view own chat messages"
    ON chat_messages FOR SELECT
    USING (
        thread_id IN (SELECT id FROM chat_threads WHERE buyer_id = auth.uid() OR vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()))
        OR is_admin(auth.uid())
    );

CREATE POLICY "Users can send chat messages"
    ON chat_messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

-- ============================================================
-- VENDOR WALLET POLICIES
-- ============================================================

CREATE POLICY "Vendors can view own wallet"
    ON vendor_wallets FOR SELECT
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR vendor_id IN (SELECT vendor_id FROM vendor_staff WHERE profile_id = auth.uid() AND role IN ('owner', 'manager'))
        OR is_admin(auth.uid())
    );

CREATE POLICY "Only system can update wallets"
    ON vendor_wallets FOR UPDATE
    USING (is_admin(auth.uid()));

-- ============================================================
-- VENDOR PAYOUT POLICIES
-- ============================================================

CREATE POLICY "Vendors can view own payout requests"
    ON vendor_payout_requests FOR SELECT
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Vendors can create payout requests"
    ON vendor_payout_requests FOR INSERT
    WITH CHECK (vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid()));

CREATE POLICY "Admins can manage payout requests"
    ON vendor_payout_requests FOR UPDATE
    USING (is_admin(auth.uid()));

CREATE POLICY "Vendors can view own payout transactions"
    ON vendor_payout_transactions FOR SELECT
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

CREATE POLICY "Vendors can view own statement entries"
    ON vendor_statement_entries FOR SELECT
    USING (
        vendor_id IN (SELECT id FROM vendors WHERE profile_id = auth.uid())
        OR is_admin(auth.uid())
    );

-- ============================================================
-- AUDIT LOG POLICIES
-- ============================================================

CREATE POLICY "Only admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "System can create audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================================
-- SYSTEM SETTINGS POLICIES
-- ============================================================

CREATE POLICY "Public settings are viewable by everyone"
    ON system_settings FOR SELECT
    USING (is_public = true OR is_admin(auth.uid()));

CREATE POLICY "Only super admins can manage settings"
    ON system_settings FOR ALL
    USING (is_super_admin(auth.uid()));

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0009 complete: RLS policies created';
END $$;
