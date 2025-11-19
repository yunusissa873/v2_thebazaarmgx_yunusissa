-- ============================================================================
-- Migration: Enhance Categories Table for The Bazaar
-- Description: Adds SEO fields and path_slug for enhanced URL generation
-- Date: 2025-01-01
-- Version: 1.0.0
-- ============================================================================

-- ============================================================================
-- Add SEO and Path Fields to Categories Table
-- ============================================================================

-- Add new columns only (existing columns: is_active, sort_order, level already exist)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS path_slug TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT[];

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_categories_path_slug ON categories(path_slug);
CREATE INDEX IF NOT EXISTS idx_categories_meta_keywords ON categories USING GIN(meta_keywords);

-- ============================================================================
-- Column Comments for Clarity
-- ============================================================================

COMMENT ON COLUMN categories.path_slug IS 'Full hierarchical slug (e.g. electronics/smartphones/iphone)';
COMMENT ON COLUMN categories.is_active IS 'Indicates if category is visible in The Bazaar storefront';
COMMENT ON COLUMN categories.seo_title IS 'SEO-optimized category page title';
COMMENT ON COLUMN categories.seo_description IS 'SEO meta description for category page';
COMMENT ON COLUMN categories.meta_keywords IS 'Array of SEO keywords for category pages';

-- ============================================================================
-- Utility Function: Generate Category Path from Hierarchy
-- ============================================================================
-- This function builds the full path slug by traversing up the category tree

CREATE OR REPLACE FUNCTION generate_category_path_slug(category_id UUID)
RETURNS TEXT AS $$
DECLARE
  path_parts TEXT[] := ARRAY[]::TEXT[];
  current_id UUID := category_id;
  current_slug TEXT;
  parent_ref UUID;
BEGIN
  LOOP
    SELECT slug, parent_id INTO current_slug, parent_ref
    FROM categories 
    WHERE id = current_id;
    
    EXIT WHEN current_slug IS NULL;
    
    path_parts := array_prepend(current_slug, path_parts);
    
    EXIT WHEN parent_ref IS NULL;
    current_id := parent_ref;
  END LOOP;
  
  RETURN array_to_string(path_parts, '/');
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Helper Function: Populate Path Slugs for Existing Categories
-- ============================================================================
-- This function updates all existing categories with their path_slug
-- Run this after seeding categories from the_bazaar_categories_flat.json

CREATE OR REPLACE FUNCTION populate_all_category_path_slugs()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  cat_record RECORD;
BEGIN
  FOR cat_record IN SELECT id FROM categories LOOP
    UPDATE categories
    SET path_slug = generate_category_path_slug(cat_record.id)
    WHERE id = cat_record.id;
    
    updated_count := updated_count + 1;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Trigger: Auto-update path_slug when category slug or parent changes
-- ============================================================================

CREATE OR REPLACE FUNCTION update_category_path_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT: Use provided path_slug or calculate from parent
  IF TG_OP = 'INSERT' THEN
    -- If path_slug is not provided, calculate it
    IF NEW.path_slug IS NULL THEN
      IF NEW.parent_id IS NOT NULL THEN
        -- Get parent path and append current slug
        SELECT COALESCE(path_slug || '/', '') || NEW.slug
        INTO NEW.path_slug
        FROM categories
        WHERE id = NEW.parent_id;
      ELSE
        -- Root category
        NEW.path_slug := NEW.slug;
      END IF;
    END IF;
  ELSE
    -- Handle UPDATE: Recalculate path_slug if id exists
    IF NEW.id IS NOT NULL THEN
      NEW.path_slug := generate_category_path_slug(NEW.id);
    ELSE
      -- Fallback: calculate from parent
      IF NEW.parent_id IS NOT NULL THEN
        SELECT COALESCE(path_slug || '/', '') || NEW.slug
        INTO NEW.path_slug
        FROM categories
        WHERE id = NEW.parent_id;
      ELSE
        NEW.path_slug := NEW.slug;
      END IF;
    END IF;
    
    -- If slug or parent_id changed, child categories will update via their own triggers
    -- We don't update descendants here to avoid trigger recursion
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_update_category_path_slug ON categories;

CREATE TRIGGER trigger_update_category_path_slug
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_path_slug();

-- ============================================================================
-- Rollback Script (for safety)
-- ============================================================================
/*
DROP TRIGGER IF EXISTS trigger_update_category_path_slug ON categories;
DROP FUNCTION IF EXISTS update_category_path_slug();
DROP FUNCTION IF EXISTS populate_all_category_path_slugs();
DROP FUNCTION IF EXISTS generate_category_path_slug(UUID);
DROP INDEX IF EXISTS idx_categories_meta_keywords;
DROP INDEX IF EXISTS idx_categories_path_slug;

ALTER TABLE categories 
DROP COLUMN IF EXISTS path_slug,
DROP COLUMN IF EXISTS seo_title,
DROP COLUMN IF EXISTS seo_description,
DROP COLUMN IF EXISTS meta_keywords;
*/

