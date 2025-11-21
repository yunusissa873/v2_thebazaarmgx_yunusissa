-- ============================================================
-- THE BAZAAR - Migration 0010
-- Additional Performance Indexes and Optimizations
-- ============================================================

-- ============================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================

-- Products: Active + Featured + Category
CREATE INDEX idx_products_active_category_featured 
    ON products(category_id, is_featured DESC, created_at DESC) 
    WHERE is_active = true;

-- Products: Active + Price Range
CREATE INDEX idx_products_active_price 
    ON products(price) 
    WHERE is_active = true;

-- Products: Vendor + Active
CREATE INDEX idx_products_vendor_active 
    ON products(vendor_id, created_at DESC) 
    WHERE is_active = true;

-- Orders: Buyer + Status + Date
CREATE INDEX idx_orders_buyer_status_date 
    ON orders(buyer_id, status, created_at DESC);

-- Orders: Vendor + Status + Date
CREATE INDEX idx_orders_vendor_status_date 
    ON orders(vendor_id, status, created_at DESC);

-- Orders: Payment Status + Date
CREATE INDEX idx_orders_payment_status_date 
    ON orders(payment_status, created_at DESC);

-- Reviews: Product + Approved + Rating
CREATE INDEX idx_reviews_product_approved_rating 
    ON reviews(product_id, rating DESC) 
    WHERE is_approved = true;

-- Vendor Payout Requests: Status + Date
CREATE INDEX idx_vendor_payout_requests_status_date 
    ON vendor_payout_requests(status, created_at DESC);

-- ============================================================
-- PARTIAL INDEXES (Active Records Only)
-- ============================================================

-- Active categories only
CREATE INDEX idx_categories_active_level 
    ON categories(level, sort_order) 
    WHERE is_active = true;

-- Active products with stock
CREATE INDEX idx_products_active_in_stock 
    ON products(category_id, created_at DESC) 
    WHERE is_active = true AND stock_quantity > 0;

-- Active vendors only
CREATE INDEX idx_vendors_active_rating 
    ON vendors(rating DESC, total_reviews DESC) 
    WHERE status = 'active' AND is_verified = true;

-- Active product variants
CREATE INDEX idx_product_variants_active_stock 
    ON product_variants(product_id) 
    WHERE is_active = true AND stock_quantity > 0;

-- ============================================================
-- FULL TEXT SEARCH INDEXES
-- ============================================================

-- Products: Full text search on name and description
CREATE INDEX idx_products_fulltext_search 
    ON products USING GIN (
        to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(short_description, ''))
    );

-- Vendors: Full text search
CREATE INDEX idx_vendors_fulltext_search 
    ON vendors USING GIN (
        to_tsvector('english', COALESCE(business_name, '') || ' ' || COALESCE(description, ''))
    );

-- Categories: Full text search
CREATE INDEX idx_categories_fulltext_search 
    ON categories USING GIN (
        to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''))
    );

-- ============================================================
-- TRIGRAM INDEXES FOR FUZZY SEARCH
-- ============================================================

-- Already created in previous migrations, but adding more:

-- Vendor business name trigram
CREATE INDEX idx_vendors_business_name_trgm 
    ON vendors USING GIN (business_name gin_trgm_ops);

-- Category name trigram
CREATE INDEX idx_categories_name_trgm 
    ON categories USING GIN (name gin_trgm_ops);

-- Brand name trigram
CREATE INDEX idx_brands_name_trgm 
    ON brands USING GIN (name gin_trgm_ops);

-- ============================================================
-- JSONB INDEXES FOR ATTRIBUTE QUERIES
-- ============================================================

-- Product attributes: Specific keys
CREATE INDEX idx_products_attributes_brand 
    ON products ((attributes->>'brand'));

CREATE INDEX idx_products_attributes_color 
    ON products ((attributes->>'color'));

CREATE INDEX idx_products_attributes_size 
    ON products ((attributes->>'size'));

-- Product variant attributes
CREATE INDEX idx_product_variants_attributes_color 
    ON product_variants ((attributes->>'color'));

CREATE INDEX idx_product_variants_attributes_size 
    ON product_variants ((attributes->>'size'));

-- ============================================================
-- ARRAY INDEXES FOR TAGS AND KEYWORDS
-- ============================================================

-- Products: Tags (already created, but ensuring)
CREATE INDEX IF NOT EXISTS idx_products_tags_gin 
    ON products USING GIN (tags);

-- Products: Search keywords (already created)
CREATE INDEX IF NOT EXISTS idx_products_search_keywords_gin 
    ON products USING GIN (search_keywords);

-- Categories: Meta keywords (already created)
CREATE INDEX IF NOT EXISTS idx_categories_meta_keywords_gin 
    ON categories USING GIN (meta_keywords);

-- ============================================================
-- COVERING INDEXES (Include commonly selected columns)
-- ============================================================

-- Products: List view with all needed columns
CREATE INDEX idx_products_list_covering 
    ON products(category_id, created_at DESC) 
    INCLUDE (name, slug, price, images, rating, is_featured)
    WHERE is_active = true;

-- Vendors: List view
CREATE INDEX idx_vendors_list_covering 
    ON vendors(status, rating DESC) 
    INCLUDE (business_name, slug, logo_url, city, country)
    WHERE is_verified = true;

-- ============================================================
-- STATISTICS AND ANALYZE
-- ============================================================

-- Update table statistics for query planner
ANALYZE profiles;
ANALYZE vendors;
ANALYZE categories;
ANALYZE products;
ANALYZE orders;
ANALYZE reviews;

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0010 complete: Performance indexes and optimizations applied';
END $$;
