-- ============================================================
-- THE BAZAAR - Migration 0003
-- Categories with SEO, Path Slug, and Ancestry
-- ============================================================

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
COMMENT ON TABLE categories IS '5-level category hierarchy with SEO and path tracking';

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    
    -- Basic Info
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Hierarchy
    level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
    path_slug TEXT, -- e.g., "electronics/smartphones/apple-iphone"
    full_slug TEXT, -- Same as path_slug (for compatibility)
    ancestry UUID[], -- Array of parent UUIDs [root_id, parent_id, ...]
    depth INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    
    -- SEO
    seo_title TEXT,
    meta_title TEXT, -- Alias for seo_title
    seo_description TEXT,
    meta_description TEXT, -- Alias for seo_description
    meta_keywords TEXT[],
    search_tags TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_leaf BOOLEAN DEFAULT FALSE, -- True if no children
    
    -- Metadata
    total_products INTEGER DEFAULT 0,
    product_count INTEGER DEFAULT 0, -- Alias
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_level ON categories(level);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_is_featured ON categories(is_featured);
CREATE INDEX idx_categories_is_leaf ON categories(is_leaf);
CREATE INDEX idx_categories_path_slug ON categories(path_slug);
CREATE INDEX idx_categories_full_slug ON categories(full_slug);
CREATE INDEX idx_categories_ancestry ON categories USING GIN (ancestry);
CREATE INDEX idx_categories_meta_keywords ON categories USING GIN (meta_keywords);
CREATE INDEX idx_categories_search_tags ON categories USING GIN (search_tags);
CREATE INDEX idx_categories_active_products ON categories(product_count) WHERE is_active = true;

COMMENT ON COLUMN categories.ancestry IS 'Array of parent category UUIDs from root to immediate parent';
COMMENT ON COLUMN categories.path_slug IS 'Full hierarchical path: parent-slug/child-slug';
COMMENT ON COLUMN categories.is_leaf IS 'True if this is a final category with no children';

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0003 complete: Categories table created with SEO and hierarchy support';
END $$;
