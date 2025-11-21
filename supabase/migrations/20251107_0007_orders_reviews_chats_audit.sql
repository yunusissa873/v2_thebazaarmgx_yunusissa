-- ============================================================
-- THE BAZAAR - Migration 0007
-- Orders, Reviews, Chats, and Audit Logs
-- ============================================================

-- ============================================================
-- ORDERS TABLE
-- ============================================================
COMMENT ON TABLE orders IS 'Customer orders';

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    
    -- Pricing
    subtotal NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    shipping_fee NUMERIC(10, 2) DEFAULT 0,
    shipping_amount NUMERIC(10, 2) DEFAULT 0, -- Alias
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL, -- Alias
    currency TEXT DEFAULT 'KES',
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')) DEFAULT 'pending',
    payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
    fulfillment_status TEXT DEFAULT 'unfulfilled',
    
    -- Shipping
    shipping_address JSONB,
    billing_address JSONB,
    shipping_info JSONB, -- Alias
    shipping_method TEXT,
    tracking_number TEXT,
    tracking_url TEXT,
    
    -- Payment
    payment_info JSONB,
    payment_method TEXT,
    
    -- Metadata
    notes TEXT,
    customer_notes TEXT,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
    fulfilled_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_paid_at ON orders(paid_at DESC);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
COMMENT ON TABLE order_items IS 'Line items in orders';

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    
    -- Product Info (snapshot at time of order)
    product_name TEXT NOT NULL,
    product_sku TEXT,
    variant_name TEXT,
    
    -- Pricing
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    
    -- Fulfillment
    fulfillment_status TEXT DEFAULT 'unfulfilled',
    fulfilled_at TIMESTAMPTZ,
    
    -- Metadata
    attributes JSONB, -- Snapshot of product attributes
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_vendor_id ON order_items(vendor_id);
CREATE INDEX idx_order_items_fulfillment_status ON order_items(fulfillment_status);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
COMMENT ON TABLE reviews IS 'Product reviews and ratings';

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    order_id UUID, -- Link to order (verified purchase)
    
    -- Review Content
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    content TEXT,
    comment TEXT, -- Alias
    images JSONB, -- Array of image URLs
    
    -- Status
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Helpfulness
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    -- Vendor Response
    vendor_response TEXT,
    vendor_responded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(product_id, buyer_id, order_id)
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- ============================================================
-- CHAT THREADS TABLE
-- ============================================================
COMMENT ON TABLE chat_threads IS 'Chat conversations between buyers and vendors';

CREATE TABLE chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    
    last_message TEXT,
    last_timestamp TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_threads_buyer_id ON chat_threads(buyer_id);
CREATE INDEX idx_chat_threads_vendor_id ON chat_threads(vendor_id);
CREATE INDEX idx_chat_threads_last_timestamp ON chat_threads(last_timestamp DESC);

-- ============================================================
-- CHAT MESSAGES TABLE
-- ============================================================
COMMENT ON TABLE chat_messages IS 'Individual messages in chat threads';

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    message TEXT NOT NULL,
    attachments JSONB,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_thread_id ON chat_messages(thread_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- ============================================================
-- AUDIT LOGS TABLE
-- ============================================================
COMMENT ON TABLE audit_logs IS 'System-wide audit trail';

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Resource
    resource_type TEXT NOT NULL, -- 'product', 'order', 'vendor', 'user'
    resource_id UUID NOT NULL,
    
    -- Action
    action TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject'
    
    -- Actor
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_role TEXT,
    
    -- Changes
    changes JSONB, -- {field: {old: value, new: value}}
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource_lookup ON audit_logs(resource_type, resource_id);

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0007 complete: Orders, reviews, chats, and audit logs created';
END $$;
