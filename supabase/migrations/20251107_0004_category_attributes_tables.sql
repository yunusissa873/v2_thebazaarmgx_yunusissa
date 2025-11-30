-- ============================================================
-- THE BAZAAR - Migration 0004
-- Category Attributes System
-- ============================================================

-- ============================================================
-- CATEGORY ATTRIBUTES TABLE
-- ============================================================
COMMENT ON TABLE category_attributes IS 'Attribute definitions per category (e.g., brand, color, size)';

CREATE TABLE category_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    
    -- Attribute Info
    name TEXT NOT NULL, -- e.g., "brand", "color", "size"
    label TEXT, -- Display name e.g., "Brand", "Color", "Size"
    display_name TEXT, -- Alias for label
    description TEXT,
    
    -- Type & Display
    data_type TEXT CHECK (data_type IN ('string', 'number', 'boolean', 'array')) NOT NULL,
    display_type TEXT CHECK (display_type IN ('text', 'select', 'multiselect', 'range', 'checkbox', 'color', 'number')) NOT NULL,
    unit TEXT, -- e.g., "kg", "cm", "L", "GB"
    
    -- Behavior
    canonical BOOLEAN DEFAULT FALSE, -- Required attribute
    required BOOLEAN DEFAULT FALSE, -- Alias for canonical
    is_filterable BOOLEAN DEFAULT TRUE,
    filterable BOOLEAN DEFAULT TRUE, -- Alias
    is_searchable BOOLEAN DEFAULT FALSE,
    is_variant BOOLEAN DEFAULT FALSE, -- Used for product variants
    
    -- Constraints
    options JSONB, -- For select/multiselect types: ["Red", "Blue", "Green"]
    allowed_values TEXT[], -- Array version
    min_value NUMERIC(10, 2), -- For range/number types
    max_value NUMERIC(10, 2),
    
    -- Metadata
    position INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0, -- Alias
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(category_id, name)
);

CREATE INDEX idx_category_attributes_category_id ON category_attributes(category_id);
CREATE INDEX idx_category_attributes_canonical ON category_attributes(canonical);
CREATE INDEX idx_category_attributes_required ON category_attributes(required);
CREATE INDEX idx_category_attributes_filterable ON category_attributes(filterable);
CREATE INDEX idx_category_attributes_display_type ON category_attributes(display_type);
CREATE INDEX idx_category_attributes_is_variant ON category_attributes(is_variant);

COMMENT ON COLUMN category_attributes.canonical IS 'Required attributes (5-7 per category)';
COMMENT ON COLUMN category_attributes.is_variant IS 'Used to create product variants (e.g., size, color)';
COMMENT ON COLUMN category_attributes.options IS 'JSONB array of allowed values for select/multiselect types';

-- ============================================================
-- CATEGORY ATTRIBUTE VALUES TABLE (Optional)
-- ============================================================
COMMENT ON TABLE category_attribute_values IS 'Predefined values for category attributes';

CREATE TABLE category_attribute_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attribute_id UUID NOT NULL REFERENCES category_attributes(id) ON DELETE CASCADE,
    
    value TEXT NOT NULL,
    display_value TEXT,
    color_hex TEXT, -- For color attributes
    image_url TEXT, -- For visual attributes
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(attribute_id, value)
);

CREATE INDEX idx_category_attribute_values_attribute_id ON category_attribute_values(attribute_id);
CREATE INDEX idx_category_attribute_values_is_active ON category_attribute_values(is_active);

-- ============================================================
-- Success Message
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 0004 complete: Category attributes system created';
END $$;
