-- ============================================================================
-- Migration: Category Attributes Table
-- Description: Creates table for storing category-specific attribute definitions
-- Date: 2025-01-01
-- Version: 1.0.0
-- ============================================================================

-- ============================================================================
-- Create Category Attributes Table
-- ============================================================================
-- This table stores the attribute definitions for each category
-- Used for product filtering, search, and display

CREATE TABLE IF NOT EXISTS category_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    attribute_type TEXT NOT NULL CHECK (attribute_type IN ('canonical', 'optional')),
    attribute_name TEXT NOT NULL,
    data_type TEXT NOT NULL,
    filterable BOOLEAN DEFAULT true,
    display_type TEXT NOT NULL,
    unit TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(category_id, attribute_type, attribute_name)
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_category_attributes_category_id ON category_attributes(category_id);
CREATE INDEX IF NOT EXISTS idx_category_attributes_filterable ON category_attributes(filterable);
CREATE INDEX IF NOT EXISTS idx_category_attributes_attribute_type ON category_attributes(attribute_type);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE category_attributes ENABLE ROW LEVEL SECURITY;

-- Everyone can view category attributes (for filtering)
CREATE POLICY "Category attributes are viewable by everyone" ON category_attributes FOR SELECT USING (true);

-- Only admins can manage attributes
CREATE POLICY "Admins can manage category attributes" ON category_attributes FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- Trigger for updated_at
-- ============================================================================
-- Note: update_updated_at_column() function should exist in schema.sql
-- If migration fails here, ensure the function is created first

DROP TRIGGER IF EXISTS update_category_attributes_updated_at ON category_attributes;

CREATE TRIGGER update_category_attributes_updated_at 
BEFORE UPDATE ON category_attributes 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE category_attributes IS 'Stores attribute definitions for each category (from the_bazaar_category_attributes.json)';
COMMENT ON COLUMN category_attributes.attribute_type IS 'Type: canonical (required) or optional';
COMMENT ON COLUMN category_attributes.data_type IS 'Data type: string, number, boolean, etc.';
COMMENT ON COLUMN category_attributes.filterable IS 'Whether this attribute can be used for filtering products';
COMMENT ON COLUMN category_attributes.display_type IS 'How to display: select, text, range, etc.';

-- ============================================================================
-- Rollback Script
-- ============================================================================
/*
DROP TRIGGER IF EXISTS update_category_attributes_updated_at ON category_attributes;
DROP POLICY IF EXISTS "Admins can manage category attributes" ON category_attributes;
DROP POLICY IF EXISTS "Category attributes are viewable by everyone" ON category_attributes;
DROP INDEX IF EXISTS idx_category_attributes_attribute_type;
DROP INDEX IF EXISTS idx_category_attributes_filterable;
DROP INDEX IF EXISTS idx_category_attributes_category_id;
DROP TABLE IF EXISTS category_attributes;
*/

