-- ============================================================
-- THE BAZAAR - Migration 0008
-- Triggers and Helper Functions
-- ============================================================

-- ============================================================
-- TIMESTAMP TRIGGERS
-- ============================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER trigger_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendors_updated_at 
    BEFORE UPDATE ON vendors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendor_subscriptions_updated_at 
    BEFORE UPDATE ON vendor_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendor_staff_updated_at 
    BEFORE UPDATE ON vendor_staff 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_admin_staff_updated_at 
    BEFORE UPDATE ON admin_staff 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_category_attributes_updated_at 
    BEFORE UPDATE ON category_attributes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_brands_updated_at 
    BEFORE UPDATE ON brands 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_product_variants_updated_at 
    BEFORE UPDATE ON product_variants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_order_items_updated_at 
    BEFORE UPDATE ON order_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_chat_threads_updated_at 
    BEFORE UPDATE ON chat_threads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendor_wallets_updated_at 
    BEFORE UPDATE ON vendor_wallets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_vendor_payout_requests_updated_at 
    BEFORE UPDATE ON vendor_payout_requests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- CATEGORY HIERARCHY TRIGGERS
-- ============================================================

-- Function: Auto-generate category path_slug and ancestry
CREATE OR REPLACE FUNCTION update_category_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT;
    parent_ancestry UUID[];
    parent_depth INTEGER;
BEGIN
    IF NEW.parent_id IS NULL THEN
        -- Root category
        NEW.path_slug := NEW.slug;
        NEW.full_slug := NEW.slug;
        NEW.ancestry := ARRAY[]::UUID[];
        NEW.depth := 0;
        NEW.level := 1;
    ELSE
        -- Child category
        SELECT path_slug, ancestry, depth
        INTO parent_path, parent_ancestry, parent_depth
        FROM categories
        WHERE id = NEW.parent_id;
        
        NEW.path_slug := parent_path || '/' || NEW.slug;
        NEW.full_slug := NEW.path_slug;
        NEW.ancestry := parent_ancestry || NEW.parent_id;
        NEW.depth := parent_depth + 1;
        NEW.level := parent_depth + 2;
    END IF;
    
    -- Auto-populate meta_title if empty
    IF NEW.seo_title IS NULL OR NEW.seo_title = '' THEN
        NEW.seo_title := NEW.name || ' – The Bazaar';
    END IF;
    
    IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
        NEW.meta_title := NEW.seo_title;
    END IF;
    
    -- Auto-populate meta_description if empty
    IF (NEW.seo_description IS NULL OR NEW.seo_description = '') AND NEW.description IS NOT NULL THEN
        NEW.seo_description := LEFT(NEW.description, 160);
    END IF;
    
    IF NEW.meta_description IS NULL OR NEW.meta_description = '' THEN
        NEW.meta_description := NEW.seo_description;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_category_hierarchy
    BEFORE INSERT OR UPDATE OF slug, parent_id ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_category_hierarchy();

-- ============================================================
-- PRODUCT PATH SLUG TRIGGER
-- ============================================================

-- Function: Auto-generate product path_slug
CREATE OR REPLACE FUNCTION update_product_path_slug()
RETURNS TRIGGER AS $$
DECLARE
    category_path TEXT;
BEGIN
    IF NEW.category_id IS NOT NULL THEN
        SELECT path_slug INTO category_path FROM categories WHERE id = NEW.category_id;
        IF category_path IS NOT NULL THEN
            NEW.path_slug := category_path || '/' || NEW.slug;
        ELSE
            NEW.path_slug := NEW.slug;
        END IF;
    ELSE
        NEW.path_slug := NEW.slug;
    END IF;
    
    -- Auto-populate SEO fields
    IF NEW.seo_title IS NULL OR NEW.seo_title = '' THEN
        NEW.seo_title := NEW.name || ' – The Bazaar';
    END IF;
    
    IF NEW.meta_title IS NULL OR NEW.meta_title = '' THEN
        NEW.meta_title := NEW.seo_title;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_product_path_slug
    BEFORE INSERT OR UPDATE OF slug, category_id ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_path_slug();

-- ============================================================
-- PRODUCT RATING UPDATE TRIGGER
-- ============================================================

-- Function: Update product rating from reviews
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true), 0),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = true)
    WHERE id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_rating
    AFTER INSERT OR UPDATE OF rating, is_approved ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();

-- ============================================================
-- VENDOR WALLET UPDATE TRIGGER
-- ============================================================

-- Function: Update vendor wallet balance after order payment
CREATE OR REPLACE FUNCTION update_vendor_wallet_on_order()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
    wallet_balance NUMERIC;
BEGIN
    IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
        -- Order was just paid
        FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
            -- Add to vendor wallet balance
            INSERT INTO vendor_wallets (vendor_id, balance, pending_balance, total_earned)
            VALUES (item.vendor_id, item.total_price, 0, item.total_price)
            ON CONFLICT (vendor_id) DO UPDATE
            SET 
                balance = vendor_wallets.balance + item.total_price,
                total_earned = vendor_wallets.total_earned + item.total_price,
                updated_at = NOW();
            
            -- Get updated balance
            SELECT balance INTO wallet_balance FROM vendor_wallets WHERE vendor_id = item.vendor_id;
            
            -- Create statement entry
            INSERT INTO vendor_statement_entries (
                vendor_id, 
                entry_type, 
                order_id, 
                amount, 
                balance_after, 
                description
            )
            VALUES (
                item.vendor_id,
                'sale',
                NEW.id,
                item.total_price,
                wallet_balance,
                'Sale: ' || item.product_name || ' (Order #' || NEW.order_number || ')'
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vendor_wallet_on_order
    AFTER UPDATE OF payment_status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_vendor_wallet_on_order();

-- ============================================================
-- CHAT THREAD UPDATE TRIGGER
-- ============================================================

-- Function: Update chat thread last message
CREATE OR REPLACE FUNCTION update_chat_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_threads
    SET 
        last_message = NEW.message,
        last_timestamp = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.thread_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_thread
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_thread_last_message();

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0008 complete: Triggers and functions created';
END $$;
