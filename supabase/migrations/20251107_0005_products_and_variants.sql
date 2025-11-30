-- ============================================================
-- THE BAZAAR - Migration 0005
-- Products, Variants, Brands, Price History
-- ============================================================

-- ============================================================
-- BRANDS TABLE
-- ============================================================
COMMENT ON TABLE brands IS 'Product brands (can be linked to vendors or independent)';

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    banner_url TEXT,
    description TEXT,
    website TEXT,
    
    -- SEO
    seo_title TEXT,
    seo_description TEXT,
    meta_keywords TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    country_of_origin TEXT,
    founded_year INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_vendor_id ON brands(vendor_id);
CREATE INDEX idx_brands_is_active ON brands(is_active);

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
COMMENT ON TABLE products IS 'Product catalog with SEO, attributes, and inventory tracking';

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    
    -- Basic Info
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    vendor_sku TEXT, -- Vendor's internal SKU
    description TEXT,
    short_description TEXT,
    
    -- Media
    images JSONB, -- Array of image URLs
    video_url TEXT,
    
    -- Pricing
    price NUMERIC(10, 2) NOT NULL,
    compare_at_price NUMERIC(10, 2),
    cost_price NUMERIC(10, 2), -- Vendor's cost
    currency TEXT DEFAULT 'KES',
    
    -- Inventory
    sku TEXT,
    barcode TEXT,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 3,
    track_inventory BOOLEAN DEFAULT TRUE,
    
    -- Physical
    weight NUMERIC(10, 2),
    dimensions JSONB, -- {length, width, height, unit}
    
    -- Attributes (Dynamic JSONB)
    attributes JSONB DEFAULT '{}'::jsonb,
    
    -- SEO
    path_slug TEXT, -- Full path including category
    seo_title TEXT,
    meta_title TEXT,
    seo_description TEXT,
    meta_description TEXT,
    search_keywords TEXT[],
    tags TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_on_sale BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    rating NUMERIC(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    
    -- Metadata
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(vendor_id, slug),
    UNIQUE(vendor_id, vendor_sku)
);

-- Indexes
CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_vendor_sku ON products(vendor_sku);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_rating ON products(rating DESC);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_path_slug ON products(path_slug);
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);
CREATE INDEX idx_products_search_keywords ON products USING GIN (search_keywords);
CREATE INDEX idx_products_tags ON products USING GIN (tags);
CREATE INDEX idx_products_active_featured ON products(is_featured) WHERE is_active = true;
CREATE INDEX idx_products_trgm_name ON products USING GIN (name gin_trgm_ops);

COMMENT ON COLUMN products.attributes IS 'Dynamic product attributes as JSONB: {brand: "Apple", color: "Black", storage: "256GB"}';
COMMENT ON COLUMN products.vendor_sku IS 'Vendor-specific SKU (unique per vendor)';

-- ============================================================
-- PRODUCT VARIANTS TABLE
-- ============================================================
COMMENT ON TABLE product_variants IS 'Product variations (size, color, etc.)';

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    -- Variant Info
    name TEXT NOT NULL, -- e.g., "Large / Red"
    sku TEXT,
    barcode TEXT,
    
    -- Pricing
    price NUMERIC(10, 2),
    compare_at_price NUMERIC(10, 2),
    cost_price NUMERIC(10, 2),
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    
    -- Variant Attributes
    attributes JSONB DEFAULT '{}'::jsonb, -- {size: "L", color: "Red"}
    
    -- Media
    image_url TEXT,
    
    -- Physical
    weight NUMERIC(10, 2),
    dimensions JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(product_id, sku)
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_is_active ON product_variants(is_active);
CREATE INDEX idx_product_variants_attributes ON product_variants USING GIN (attributes);

-- ============================================================
-- PRICE HISTORY TABLE
-- ============================================================
COMMENT ON TABLE price_history IS 'Track product price changes over time';

CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    
    -- Price Data
    old_price NUMERIC(10, 2),
    new_price NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'KES',
    
    -- Reason
    change_reason TEXT,
    changed_by UUID REFERENCES profiles(id),
    
    effective_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_product_id ON price_history(product_id);
CREATE INDEX idx_price_history_variant_id ON price_history(variant_id);
CREATE INDEX idx_price_history_effective_date ON price_history(effective_date DESC);

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0005 complete: Products, variants, brands, and price history created';
END $$;
