/**
 * Generate The Bazaar Complete Category Dataset
 * 
 * Generates:
 * 1. src/data/the_bazaar_categories.ts (nested TypeScript)
 * 2. src/data/the_bazaar_categories_flat.json (flat JSON)
 * 3. src/data/the_bazaar_category_attributes.json (attribute mappings)
 * 
 * All files use consistent UUIDs and are synchronized.
 */

import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { fileURLToPath } from 'url';

// ============================================================================
// Configuration
// ============================================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../src/data');
const TIMESTAMP = '2024-01-01T00:00:00.000Z';

// ============================================================================
// Utilities
// ============================================================================

function generateShortUuid(): string {
  return randomBytes(5).toString('hex');
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildPathSlug(category: CategoryNode, parentPath?: string): string {
  const currentSlug = category.slug;
  return parentPath ? `${parentPath}/${currentSlug}` : currentSlug;
}

function generateSEOMetadata(name: string, type: string): {
  seo_title: string;
  seo_description: string;
  meta_keywords: string[];
} {
  const keywords = [
    name.toLowerCase(),
    type,
    'the bazaar',
    'kenya',
    'online shopping',
    'buy online',
    'nairobi'
  ];

  return {
    seo_title: `Shop ${name} | The Bazaar - Kenya's Premier Online Marketplace`,
    seo_description: `Browse and buy ${name.toLowerCase()} at The Bazaar. Fast delivery, great prices, and trusted sellers across Kenya. Free delivery in Nairobi.`,
    meta_keywords: keywords
  };
}

// Image mapping with Unsplash photo IDs
const categoryImages: Record<string, string> = {
  'fashion': 'photo-1441986300917-64674bd600d8',
  'apparel': 'photo-1441986300917-64674bd600d8',
  'womens': 'photo-1490481651871-ab68de25d43d',
  'mens': 'photo-1520975661595-6453be3f7070',
  'dresses': 'photo-1595777457583-95e059d581b8',
  'tops': 'photo-1594633313593-bab3825d0caf',
  'jeans': 'photo-1542272604-787c3835535d',
  'shoes': 'photo-1542291026-7eec264c27ff',
  'heels': 'photo-1543163521-1bf539c55dd2',
  'footwear': 'photo-1542291026-7eec264c27ff',
  'accessories': 'photo-1515562141207-7a88fb7ce338',
  'beauty': 'photo-1631217868264-e5b90bb7e133',
  'skincare': 'photo-1620916566398-39f1143ab7be',
  'haircare': 'photo-1522338242992-e1a54906a8da',
  'health': 'photo-1571019613454-1cb2f99b2d8b',
  'wellness': 'photo-1571019613454-1cb2f99b2d8b',
  'jewelry': 'photo-1515562141207-7a88fb7ce338',
  'watches': 'photo-1523275335684-37898b6baf30',
  'electronics': 'photo-1505740420928-5e560c06d30e',
  'smartphones': 'photo-1511707171634-5f897ff02aa9',
  'iphone': 'photo-1523275335684-37898b6baf30',
  'laptops': 'photo-1496181133206-80ce9b88a853',
  'tablets': 'photo-1544244015-0df4b3ffc6b0',
  'home': 'photo-1586023492125-27b2c045efd7',
  'appliances': 'photo-1556910096-6f5e72db6803',
  'furniture': 'photo-1586023492125-27b2c045efd7',
  'tools': 'photo-1504148455328-c376907d081c',
  'automotive': 'photo-1449824913935-59a10b8d2000',
  'sports': 'photo-1571019613454-1cb2f99b2d8b',
  'toys': 'photo-1515488042361-ee00e0ddd4e4',
  'books': 'photo-1507003211169-0a1dd7228f2d',
  'stationery': 'photo-1452860606245-08d17df8cbb4',
  'pet': 'photo-1517849845537-4d257902454a',
  'baby': 'photo-1587654780291-39c9404d746b',
  'groceries': 'photo-1556912172-45b7abe8b7e1',
  'garden': 'photo-1466692476868-aef1dfb1e735',
  'art': 'photo-1541961017774-22349e4a1262',
  'industrial': 'photo-1581092160562-40aa08e78837',
  'default': 'photo-1505740420928-5e560c06d30e'
};

function getImageUrl(categoryName: string, level: number): string {
  const nameLower = categoryName.toLowerCase();
  let photoId = categoryImages.default;
  
  for (const [key, id] of Object.entries(categoryImages)) {
    if (nameLower.includes(key)) {
      photoId = id;
      break;
    }
  }
  
  const dimensions = level === 1 ? 'w=800&h=600' : level <= 2 ? 'w=600&h=450' : 'w=400&h=300';
  return `https://images.unsplash.com/${photoId}?${dimensions}&fit=crop&q=80`;
}

// ============================================================================
// Types
// ============================================================================

interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  path_slug: string;
  level: number;
  sort_order: number;
  image_url: string;
  seo_title: string;
  seo_description: string;
  meta_keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: CategoryNode[];
}

interface AttributeDefinition {
  name: string;
  data_type: 'string' | 'number' | 'boolean' | 'array';
  filterable: boolean;
  display_type: 'select' | 'text' | 'range' | 'checkbox' | 'multiselect';
  unit?: string;
}

interface CategoryAttributeMapping {
  category_uuid: string;
  canonical_attributes: AttributeDefinition[];
  optional_attributes: AttributeDefinition[];
}

// ============================================================================
// Attribute Metadata Definitions
// ============================================================================

function getAttributeMetadata(attrName: string): AttributeDefinition {
  const metadata: Record<string, AttributeDefinition> = {
    // Common attributes
    'brand': { name: 'brand', data_type: 'string', filterable: true, display_type: 'select' },
    'color': { name: 'color', data_type: 'string', filterable: true, display_type: 'select' },
    'material': { name: 'material', data_type: 'string', filterable: true, display_type: 'select' },
    'size': { name: 'size', data_type: 'string', filterable: true, display_type: 'select' },
    'gender': { name: 'gender', data_type: 'string', filterable: true, display_type: 'select' },
    'origin': { name: 'origin', data_type: 'string', filterable: false, display_type: 'text' },
    'warranty': { name: 'warranty', data_type: 'string', filterable: true, display_type: 'select' },
    
    // Fashion specific
    'fit': { name: 'fit', data_type: 'string', filterable: true, display_type: 'select' },
    'occasion': { name: 'occasion', data_type: 'string', filterable: true, display_type: 'select' },
    'pattern': { name: 'pattern', data_type: 'string', filterable: true, display_type: 'select' },
    'sleeve_type': { name: 'sleeve_type', data_type: 'string', filterable: true, display_type: 'select' },
    'neckline': { name: 'neckline', data_type: 'string', filterable: true, display_type: 'select' },
    
    // Footwear
    'shoe_size': { name: 'shoe_size', data_type: 'string', filterable: true, display_type: 'select' },
    'style': { name: 'style', data_type: 'string', filterable: true, display_type: 'select' },
    'closure_type': { name: 'closure_type', data_type: 'string', filterable: true, display_type: 'select' },
    'sole_material': { name: 'sole_material', data_type: 'string', filterable: true, display_type: 'select' },
    'season': { name: 'season', data_type: 'string', filterable: true, display_type: 'select' },
    
    // Beauty
    'skin_type': { name: 'skin_type', data_type: 'string', filterable: true, display_type: 'select' },
    'product_type': { name: 'product_type', data_type: 'string', filterable: true, display_type: 'select' },
    'size_ml': { name: 'size_ml', data_type: 'number', filterable: true, display_type: 'range', unit: 'ml' },
    'active_ingredient': { name: 'active_ingredient', data_type: 'string', filterable: true, display_type: 'select' },
    'fragrance': { name: 'fragrance', data_type: 'string', filterable: true, display_type: 'select' },
    'packaging_type': { name: 'packaging_type', data_type: 'string', filterable: true, display_type: 'select' },
    'dermatologist_tested': { name: 'dermatologist_tested', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    
    // Health
    'dosage': { name: 'dosage', data_type: 'string', filterable: true, display_type: 'select' },
    'form': { name: 'form', data_type: 'string', filterable: true, display_type: 'select' },
    'quantity': { name: 'quantity', data_type: 'number', filterable: true, display_type: 'range' },
    'ingredients': { name: 'ingredients', data_type: 'array', filterable: false, display_type: 'multiselect' },
    'target_use': { name: 'target_use', data_type: 'string', filterable: true, display_type: 'select' },
    'expiry_date': { name: 'expiry_date', data_type: 'string', filterable: false, display_type: 'text' },
    'prescription_required': { name: 'prescription_required', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    
    // Jewelry
    'gemstone': { name: 'gemstone', data_type: 'string', filterable: true, display_type: 'select' },
    'type': { name: 'type', data_type: 'string', filterable: true, display_type: 'select' },
    'carat_weight': { name: 'carat_weight', data_type: 'number', filterable: true, display_type: 'range', unit: 'carat' },
    
    // Electronics
    'model': { name: 'model', data_type: 'string', filterable: true, display_type: 'text' },
    'storage': { name: 'storage', data_type: 'string', filterable: true, display_type: 'select' },
    'ram': { name: 'ram', data_type: 'string', filterable: true, display_type: 'select' },
    'battery_capacity': { name: 'battery_capacity', data_type: 'number', filterable: true, display_type: 'range', unit: 'mAh' },
    'display_size': { name: 'display_size', data_type: 'number', filterable: true, display_type: 'range', unit: 'inches' },
    'connectivity': { name: 'connectivity', data_type: 'array', filterable: true, display_type: 'multiselect' },
    'release_year': { name: 'release_year', data_type: 'number', filterable: true, display_type: 'range' },
    'accessories_included': { name: 'accessories_included', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    
    // Appliances
    'capacity': { name: 'capacity', data_type: 'string', filterable: true, display_type: 'select' },
    'dimensions': { name: 'dimensions', data_type: 'string', filterable: false, display_type: 'text', unit: 'cm' },
    'power_rating': { name: 'power_rating', data_type: 'number', filterable: true, display_type: 'range', unit: 'W' },
    'energy_rating': { name: 'energy_rating', data_type: 'string', filterable: true, display_type: 'select' },
    'usage_type': { name: 'usage_type', data_type: 'string', filterable: true, display_type: 'select' },
    
    // Furniture
    'room_type': { name: 'room_type', data_type: 'string', filterable: true, display_type: 'select' },
    'assembly_required': { name: 'assembly_required', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    'weight_kg': { name: 'weight_kg', data_type: 'number', filterable: true, display_type: 'range', unit: 'kg' },
    'finish_type': { name: 'finish_type', data_type: 'string', filterable: true, display_type: 'select' },
    
    // Tools
    'tool_type': { name: 'tool_type', data_type: 'string', filterable: true, display_type: 'select' },
    'power_source': { name: 'power_source', data_type: 'string', filterable: true, display_type: 'select' },
    'voltage': { name: 'voltage', data_type: 'number', filterable: true, display_type: 'range', unit: 'V' },
    'safety_certified': { name: 'safety_certified', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    
    // Automotive
    'compatibility': { name: 'compatibility', data_type: 'string', filterable: true, display_type: 'select' },
    
    // Sports
    'sport_type': { name: 'sport_type', data_type: 'string', filterable: true, display_type: 'select' },
    
    // Toys
    'age_group': { name: 'age_group', data_type: 'string', filterable: true, display_type: 'select' },
    'educational_type': { name: 'educational_type', data_type: 'string', filterable: true, display_type: 'select' },
    'battery_required': { name: 'battery_required', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    'set_included': { name: 'set_included', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    
    // Books
    'title': { name: 'title', data_type: 'string', filterable: false, display_type: 'text' },
    'author': { name: 'author', data_type: 'string', filterable: true, display_type: 'select' },
    'publisher': { name: 'publisher', data_type: 'string', filterable: true, display_type: 'select' },
    'language': { name: 'language', data_type: 'string', filterable: true, display_type: 'select' },
    'edition': { name: 'edition', data_type: 'string', filterable: true, display_type: 'select' },
    'isbn': { name: 'isbn', data_type: 'string', filterable: false, display_type: 'text' },
    'pages': { name: 'pages', data_type: 'number', filterable: true, display_type: 'range' },
    'cover_type': { name: 'cover_type', data_type: 'string', filterable: true, display_type: 'select' },
    'year_published': { name: 'year_published', data_type: 'number', filterable: true, display_type: 'range' },
    
    // Stationery
    'paper_type': { name: 'paper_type', data_type: 'string', filterable: true, display_type: 'select' },
    'refillable': { name: 'refillable', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    'pack_quantity': { name: 'pack_quantity', data_type: 'number', filterable: true, display_type: 'range' },
    
    // Pet
    'animal_type': { name: 'animal_type', data_type: 'string', filterable: true, display_type: 'select' },
    'flavor': { name: 'flavor', data_type: 'string', filterable: true, display_type: 'select' },
    
    // Baby
    'safety_certified': { name: 'safety_certified', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    
    // Groceries
    'shelf_life': { name: 'shelf_life', data_type: 'string', filterable: false, display_type: 'text' },
    'eco_friendly': { name: 'eco_friendly', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    
    // Garden
    'weather_resistant': { name: 'weather_resistant', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    
    // Art
    'medium_type': { name: 'medium_type', data_type: 'string', filterable: true, display_type: 'select' },
    'theme': { name: 'theme', data_type: 'string', filterable: true, display_type: 'select' },
    'artist': { name: 'artist', data_type: 'string', filterable: true, display_type: 'text' },
    'handmade': { name: 'handmade', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    'limited_edition': { name: 'limited_edition', data_type: 'boolean', filterable: true, display_type: 'checkbox' },
    
    // Industrial
    'certification': { name: 'certification', data_type: 'string', filterable: true, display_type: 'select' }
  };
  
  return metadata[attrName] || {
    name: attrName,
    data_type: 'string',
    filterable: true,
    display_type: 'select'
  };
}

// Attribute mapping by department
const attributeMappings: Record<string, { canonical: string[], optional: string[] }> = {
  'fashion': {
    canonical: ['brand', 'gender', 'size', 'material', 'color', 'fit', 'occasion'],
    optional: ['pattern', 'sleeve_type', 'neckline', 'origin']
  },
  'footwear': {
    canonical: ['brand', 'gender', 'shoe_size', 'color', 'material', 'style'],
    optional: ['closure_type', 'sole_material', 'season', 'occasion']
  },
  'beauty': {
    canonical: ['brand', 'skin_type', 'product_type', 'size_ml', 'active_ingredient', 'fragrance'],
    optional: ['packaging_type', 'origin', 'dermatologist_tested']
  },
  'health': {
    canonical: ['brand', 'dosage', 'form', 'quantity', 'ingredients', 'target_use'],
    optional: ['expiry_date', 'origin', 'prescription_required']
  },
  'jewelry': {
    canonical: ['brand', 'material', 'gemstone', 'color', 'gender', 'size', 'type'],
    optional: ['carat_weight', 'origin', 'warranty']
  },
  'electronics': {
    canonical: ['brand', 'model', 'color', 'storage', 'ram', 'warranty', 'battery_capacity'],
    optional: ['display_size', 'connectivity', 'release_year', 'accessories_included']
  },
  'appliances': {
    canonical: ['brand', 'material', 'capacity', 'dimensions', 'power_rating', 'color'],
    optional: ['energy_rating', 'origin', 'warranty', 'usage_type']
  },
  'furniture': {
    canonical: ['brand', 'material', 'color', 'dimensions', 'style', 'room_type', 'assembly_required'],
    optional: ['weight_kg', 'finish_type', 'origin']
  },
  'tools': {
    canonical: ['brand', 'tool_type', 'power_source', 'material', 'voltage', 'weight_kg'],
    optional: ['warranty', 'accessories_included', 'safety_certified']
  },
  'automotive': {
    canonical: ['brand', 'product_type', 'compatibility', 'material', 'color', 'voltage'],
    optional: ['warranty', 'origin', 'accessories_included']
  },
  'sports': {
    canonical: ['brand', 'sport_type', 'size', 'material', 'color', 'weight_kg'],
    optional: ['usage_type', 'warranty', 'origin']
  },
  'toys': {
    canonical: ['brand', 'age_group', 'material', 'color', 'educational_type', 'battery_required'],
    optional: ['origin', 'packaging_type', 'set_included']
  },
  'books': {
    canonical: ['title', 'author', 'publisher', 'language', 'edition', 'isbn'],
    optional: ['pages', 'cover_type', 'year_published']
  },
  'stationery': {
    canonical: ['brand', 'material', 'color', 'size', 'paper_type', 'refillable'],
    optional: ['pages', 'origin', 'pack_quantity']
  },
  'pet': {
    canonical: ['brand', 'animal_type', 'product_type', 'size', 'flavor', 'ingredients'],
    optional: ['weight_kg', 'origin', 'packaging_type']
  },
  'baby': {
    canonical: ['brand', 'age_group', 'product_type', 'material', 'color', 'size'],
    optional: ['safety_certified', 'origin', 'warranty']
  },
  'groceries': {
    canonical: ['brand', 'product_type', 'weight_kg', 'packaging_type', 'origin'],
    optional: ['shelf_life', 'eco_friendly', 'fragrance']
  },
  'garden': {
    canonical: ['brand', 'material', 'dimensions', 'usage_type', 'color', 'weight_kg'],
    optional: ['weather_resistant', 'origin', 'assembly_required']
  },
  'art': {
    canonical: ['brand', 'material', 'color', 'medium_type', 'theme', 'artist'],
    optional: ['handmade', 'origin', 'limited_edition']
  },
  'industrial': {
    canonical: ['brand', 'product_type', 'material', 'power_source', 'voltage', 'certification'],
    optional: ['warranty', 'weight_kg', 'origin']
  }
};

function getAttributeMappingForCategory(categoryName: string, departmentName: string): {
  canonical: AttributeDefinition[];
  optional: AttributeDefinition[];
} {
  const deptLower = departmentName.toLowerCase();
  let mappingKey = 'fashion'; // default
  
  for (const key of Object.keys(attributeMappings)) {
    if (deptLower.includes(key)) {
      mappingKey = key;
      break;
    }
  }
  
  const mapping = attributeMappings[mappingKey];
  
  return {
    canonical: mapping.canonical.map(attr => getAttributeMetadata(attr)),
    optional: mapping.optional.map(attr => getAttributeMetadata(attr))
  };
}

// ============================================================================
// Category Tree Definition (Full 4-5 Level Structure)
// ============================================================================

const categoryTreeDefinition: any = [
  {
    name: 'Fashion & Apparel',
    children: [
      {
        name: "Women's Fashion",
        children: [
          {
            name: 'Clothing',
            children: [
              { name: 'Dresses' },
              { name: 'Tops & Blouses' },
              { name: 'Trousers & Jeans' },
              { name: 'Skirts' },
              {
                name: 'Outerwear',
                children: [
                  { name: 'Jackets & Coats' },
                  { name: 'Blazers' },
                  { name: 'Cardigans' }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "Men's Fashion",
        children: [
          { name: 'Shirts & Polos' },
          { name: 'Trousers & Jeans' },
          { name: 'Jackets & Hoodies' },
          { name: 'Suits & Blazers' }
        ]
      },
      {
        name: 'Traditional & Cultural Wear',
        children: [
          { name: 'African Wear' },
          { name: 'Abayas & Kaftans' },
          { name: 'Wedding Attire' }
        ]
      }
    ]
  },
  {
    name: 'Footwear & Accessories',
    children: [
      {
        name: "Women's Shoes",
        children: [
          { name: 'Heels' },
          { name: 'Flats' },
          { name: 'Sandals' },
          { name: 'Sneakers' }
        ]
      },
      {
        name: "Men's Shoes",
        children: [
          { name: 'Formal Shoes' },
          { name: 'Casual Shoes' },
          { name: 'Loafers' },
          { name: 'Boots' }
        ]
      },
      {
        name: 'Accessories',
        children: [
          { name: 'Handbags' },
          { name: 'Belts' },
          { name: 'Scarves' },
          { name: 'Caps & Hats' }
        ]
      }
    ]
  },
  {
    name: 'Beauty & Personal Care',
    children: [
      {
        name: 'Skincare',
        children: [
          { name: 'Face Creams' },
          { name: 'Cleansers' },
          { name: 'Serums & Toners' }
        ]
      },
      {
        name: 'Haircare',
        children: [
          { name: 'Shampoo' },
          { name: 'Conditioner' },
          { name: 'Hair Treatments' }
        ]
      },
      {
        name: 'Fragrances',
        children: [
          { name: 'Perfumes for Women' },
          { name: 'Colognes for Men' }
        ]
      },
      {
        name: 'Personal Grooming',
        children: [
          { name: 'Razors & Shaving Kits' },
          { name: 'Electric Trimmers' },
          { name: 'Bath & Body Sets' }
        ]
      }
    ]
  },
  {
    name: 'Health & Wellness',
    children: [
      {
        name: 'Supplements',
        children: [
          { name: 'Vitamins & Minerals' },
          { name: 'Herbal Remedies' }
        ]
      },
      {
        name: 'Medical Devices',
        children: [
          { name: 'Thermometers' },
          { name: 'Blood Pressure Monitors' },
          { name: 'Glucometers' }
        ]
      },
      {
        name: 'Fitness Gear',
        children: [
          { name: 'Yoga Mats' },
          { name: 'Resistance Bands' },
          { name: 'Dumbbells' }
        ]
      },
      {
        name: 'First Aid & Hygiene',
        children: [
          { name: 'First Aid Kits' },
          { name: 'Sanitizers' },
          { name: 'Masks & Gloves' }
        ]
      }
    ]
  },
  {
    name: 'Jewelry & Watches',
    children: [
      {
        name: 'Fine Jewelry',
        children: [
          { name: 'Rings' },
          { name: 'Necklaces' },
          { name: 'Bracelets' }
        ]
      },
      {
        name: 'Fashion Jewelry',
        children: [
          { name: 'Earrings' },
          { name: 'Anklets' },
          { name: 'Brooches' }
        ]
      },
      {
        name: 'Watches',
        children: [
          { name: "Men's Watches" },
          { name: "Women's Watches" },
          { name: 'Smartwatches' }
        ]
      },
      {
        name: 'Accessories',
        children: [
          { name: 'Jewelry Boxes' },
          { name: 'Watch Straps' }
        ]
      }
    ]
  },
  {
    name: 'Electronics',
    children: [
      {
        name: 'Smartphones',
        children: [
          { name: 'Apple (iPhone)' },
          { name: 'Samsung' },
          { name: 'Huawei' },
          { name: 'Xiaomi' },
          { name: 'Oppo' }
        ]
      },
      {
        name: 'Laptops & PCs',
        children: [
          { name: 'MacBook' },
          { name: 'HP' },
          { name: 'Dell' },
          { name: 'Lenovo' },
          { name: 'ASUS' }
        ]
      },
      {
        name: 'Tablets',
        children: [
          { name: 'Apple (iPad)' },
          { name: 'Samsung' },
          { name: 'Lenovo' },
          { name: 'Xiaomi' }
        ]
      },
      {
        name: 'Audio Devices',
        children: [
          { name: 'Headphones' },
          { name: 'Earbuds' },
          { name: 'Bluetooth Speakers' }
        ]
      },
      {
        name: 'Wearables',
        children: [
          { name: 'Smartwatches' },
          { name: 'Fitness Bands' },
          { name: 'VR Headsets' }
        ]
      }
    ]
  },
  {
    name: 'Home & Appliances',
    children: [
      {
        name: 'Small Appliances',
        children: [
          { name: 'Blenders & Mixers' },
          { name: 'Kettles & Toasters' },
          { name: 'Irons' }
        ]
      },
      {
        name: 'Large Appliances',
        children: [
          { name: 'Refrigerators' },
          { name: 'Washing Machines' },
          { name: 'Cookers & Ovens' }
        ]
      },
      {
        name: 'Lighting',
        children: [
          { name: 'Ceiling Lamps' },
          { name: 'LED Bulbs' },
          { name: 'Table Lamps' }
        ]
      },
      {
        name: 'Air & Climate',
        children: [
          { name: 'Fans' },
          { name: 'Air Conditioners' },
          { name: 'Heaters' }
        ]
      }
    ]
  },
  {
    name: 'Furniture & Décor',
    children: [
      {
        name: 'Living Room',
        children: [
          { name: 'Sofas' },
          { name: 'Coffee Tables' },
          { name: 'TV Stands' }
        ]
      },
      {
        name: 'Bedroom',
        children: [
          { name: 'Beds & Frames' },
          { name: 'Wardrobes' },
          { name: 'Dressers' }
        ]
      },
      {
        name: 'Dining',
        children: [
          { name: 'Dining Sets' },
          { name: 'Chairs & Benches' },
          { name: 'Cabinets' }
        ]
      },
      {
        name: 'Décor',
        children: [
          { name: 'Wall Art' },
          { name: 'Clocks' },
          { name: 'Decorative Vases' }
        ]
      }
    ]
  },
  {
    name: 'Tools & Hardware',
    children: [
      {
        name: 'Power Tools',
        children: [
          { name: 'Drills' },
          { name: 'Sanders' },
          { name: 'Grinders' }
        ]
      },
      {
        name: 'Hand Tools',
        children: [
          { name: 'Hammers' },
          { name: 'Screwdrivers' },
          { name: 'Wrenches' }
        ]
      },
      {
        name: 'Safety Gear',
        children: [
          { name: 'Gloves' },
          { name: 'Helmets' },
          { name: 'Goggles' }
        ]
      },
      {
        name: 'Workshop Equipment',
        children: [
          { name: 'Toolboxes' },
          { name: 'Workbenches' },
          { name: 'Measuring Tools' }
        ]
      }
    ]
  },
  {
    name: 'Automotive',
    children: [
      {
        name: 'Car Electronics',
        children: [
          { name: 'Dash Cams' },
          { name: 'Car Audio' },
          { name: 'GPS Systems' }
        ]
      },
      {
        name: 'Car Accessories',
        children: [
          { name: 'Seat Covers' },
          { name: 'Floor Mats' },
          { name: 'Cleaning Kits' }
        ]
      },
      {
        name: 'Motorcycle Gear',
        children: [
          { name: 'Helmets' },
          { name: 'Jackets' },
          { name: 'Gloves' }
        ]
      },
      {
        name: 'Maintenance Tools',
        children: [
          { name: 'Battery Chargers' },
          { name: 'Wrenches' },
          { name: 'Lifts & Jacks' }
        ]
      }
    ]
  },
  {
    name: 'Sports & Outdoors',
    children: [
      {
        name: 'Exercise Equipment',
        children: [
          { name: 'Treadmills' },
          { name: 'Dumbbells' },
          { name: 'Jump Ropes' }
        ]
      },
      {
        name: 'Outdoor Gear',
        children: [
          { name: 'Tents' },
          { name: 'Sleeping Bags' },
          { name: 'Camping Stoves' }
        ]
      },
      {
        name: 'Team Sports',
        children: [
          { name: 'Football' },
          { name: 'Basketball' },
          { name: 'Tennis' }
        ]
      },
      {
        name: 'Apparel & Footwear',
        children: [
          { name: 'Sportswear' },
          { name: 'Running Shoes' },
          { name: 'Activewear' }
        ]
      }
    ]
  },
  {
    name: 'Toys & Games',
    children: [
      {
        name: 'Baby & Toddler Toys',
        children: [
          { name: 'Educational Toys' },
          { name: 'Soft Toys' }
        ]
      },
      {
        name: 'Outdoor Play',
        children: [
          { name: 'Trampolines' },
          { name: 'Ride-ons' }
        ]
      },
      {
        name: 'Games',
        children: [
          { name: 'Board Games' },
          { name: 'Puzzles' }
        ]
      },
      {
        name: 'Collectibles',
        children: [
          { name: 'STEM Kits' },
          { name: 'Robotics' },
          { name: 'Building Sets' }
        ]
      }
    ]
  },
  {
    name: 'Books & Education',
    children: [
      {
        name: 'Fiction',
        children: [
          { name: 'Romance' },
          { name: 'Mystery' },
          { name: 'Sci-Fi' }
        ]
      },
      {
        name: 'Non-Fiction',
        children: [
          { name: 'Biographies' },
          { name: 'Business & Finance' },
          { name: 'Self-Help' }
        ]
      },
      {
        name: 'Educational',
        children: [
          { name: 'Textbooks' },
          { name: "Children's Books" },
          { name: 'Reference Books' }
        ]
      },
      {
        name: 'Stationery Combos',
        children: [
          { name: 'Journals' },
          { name: 'Notebooks' }
        ]
      }
    ]
  },
  {
    name: 'Stationery & Office Supplies',
    children: [
      {
        name: 'Writing',
        children: [
          { name: 'Pens' },
          { name: 'Pencils' },
          { name: 'Markers' }
        ]
      },
      {
        name: 'Paper Products',
        children: [
          { name: 'Notebooks' },
          { name: 'Diaries' },
          { name: 'Printing Paper' }
        ]
      },
      {
        name: 'Office Equipment',
        children: [
          { name: 'Printers' },
          { name: 'Shredders' },
          { name: 'Calculators' }
        ]
      },
      {
        name: 'Storage',
        children: [
          { name: 'Filing Cabinets' },
          { name: 'Binders' },
          { name: 'Folders' }
        ]
      }
    ]
  },
  {
    name: 'Pet Supplies',
    children: [
      {
        name: 'Pet Food',
        children: [
          { name: 'Dog Food' },
          { name: 'Cat Food' },
          { name: 'Bird Food' }
        ]
      },
      {
        name: 'Pet Accessories',
        children: [
          { name: 'Collars & Leashes' },
          { name: 'Beds' },
          { name: 'Toys' }
        ]
      },
      {
        name: 'Grooming',
        children: [
          { name: 'Brushes' },
          { name: 'Shampoos' },
          { name: 'Nail Clippers' }
        ]
      },
      {
        name: 'Health & Hygiene',
        children: [
          { name: 'Vitamins' },
          { name: 'Flea Control' }
        ]
      }
    ]
  },
  {
    name: 'Baby & Kids',
    children: [
      {
        name: 'Baby Essentials',
        children: [
          { name: 'Diaper Bags' },
          { name: 'Strollers' },
          { name: 'High Chairs' }
        ]
      },
      {
        name: 'Feeding',
        children: [
          { name: 'Bottles' },
          { name: 'Sterilizers' },
          { name: 'Bibs' }
        ]
      },
      {
        name: 'Toys & Learning',
        children: [
          { name: 'Early Learning' },
          { name: 'Building Blocks' },
          { name: 'Musical Toys' }
        ]
      },
      {
        name: 'Clothing',
        children: [
          { name: 'Babywear' },
          { name: 'Toddler Wear' }
        ]
      }
    ]
  },
  {
    name: 'Groceries & Household Essentials',
    children: [
      {
        name: 'Cleaning Supplies',
        children: [
          { name: 'Detergents' },
          { name: 'Disinfectants' },
          { name: 'Sponges' }
        ]
      },
      {
        name: 'Paper Goods',
        children: [
          { name: 'Tissues' },
          { name: 'Paper Towels' },
          { name: 'Napkins' }
        ]
      },
      {
        name: 'Beverages (Packaged)',
        children: [
          { name: 'Coffee' },
          { name: 'Tea' },
          { name: 'Juices' }
        ]
      },
      {
        name: 'Pantry',
        children: [
          { name: 'Canned Goods' },
          { name: 'Grains & Pasta' }
        ]
      }
    ]
  },
  {
    name: 'Garden & Outdoor Living',
    children: [
      {
        name: 'Gardening Tools',
        children: [
          { name: 'Spades' },
          { name: 'Pruners' },
          { name: 'Watering Cans' }
        ]
      },
      {
        name: 'Plants & Pots',
        children: [
          { name: 'Planters' },
          { name: 'Artificial Plants' }
        ]
      },
      {
        name: 'Outdoor Furniture',
        children: [
          { name: 'Patio Sets' },
          { name: 'Umbrellas' },
          { name: 'Benches' }
        ]
      },
      {
        name: 'Décor & Lighting',
        children: [
          { name: 'Lanterns' },
          { name: 'Solar Lights' }
        ]
      }
    ]
  },
  {
    name: 'Art, Craft & Collectibles',
    children: [
      {
        name: 'Art Supplies',
        children: [
          { name: 'Paints' },
          { name: 'Brushes' },
          { name: 'Easels' }
        ]
      },
      {
        name: 'Craft Materials',
        children: [
          { name: 'Fabrics' },
          { name: 'Beads' },
          { name: 'Glues' }
        ]
      },
      {
        name: 'Collectibles',
        children: [
          { name: 'Coins' },
          { name: 'Action Figures' },
          { name: 'Memorabilia' }
        ]
      },
      {
        name: 'DIY Kits',
        children: [
          { name: 'Embroidery' },
          { name: 'Resin Art' }
        ]
      }
    ]
  },
  {
    name: 'Industrial & Safety Equipment',
    children: [
      {
        name: 'Safety Gear',
        children: [
          { name: 'Gloves' },
          { name: 'Helmets' },
          { name: 'Safety Boots' }
        ]
      },
      {
        name: 'Industrial Tools',
        children: [
          { name: 'Welding Machines' },
          { name: 'Generators' },
          { name: 'Air Compressors' }
        ]
      },
      {
        name: 'Electrical Equipment',
        children: [
          { name: 'Cables' },
          { name: 'Switches' },
          { name: 'Meters' }
        ]
      },
      {
        name: 'Storage & Handling',
        children: [
          { name: 'Shelving Units' },
          { name: 'Pallets' },
          { name: 'Ladders' }
        ]
      }
    ]
  }
];

// ============================================================================
// Category Processing
// ============================================================================

function processCategoryTree(
  tree: any[],
  parentId: string | null = null,
  parentPath: string | undefined = undefined,
  level: number = 1,
  departmentName: string = '',
  sortOrder: number = 0
): { categories: CategoryNode[], leafCategories: CategoryNode[] } {
  const categories: CategoryNode[] = [];
  const leafCategories: CategoryNode[] = [];

  for (let i = 0; i < tree.length; i++) {
    const item = tree[i];
    const id = generateShortUuid();
    const slug = generateSlug(item.name);
    const pathSlug = buildPathSlug({ slug } as CategoryNode, parentPath);
    const currentDeptName = level === 1 ? item.name : departmentName;
    const seo = generateSEOMetadata(item.name, level === 1 ? 'department' : level === 2 ? 'category' : 'subcategory');

    const category: CategoryNode = {
      id,
      name: item.name,
      slug,
      parent_id: parentId,
      path_slug: pathSlug,
      level,
      sort_order: sortOrder + i,
      image_url: getImageUrl(item.name, level),
      seo_title: seo.seo_title,
      seo_description: seo.seo_description,
      meta_keywords: seo.meta_keywords,
      is_active: true,
      created_at: TIMESTAMP,
      updated_at: TIMESTAMP
    };

    // Process children recursively
    if (item.children && item.children.length > 0) {
      const result = processCategoryTree(
        item.children,
        id,
        pathSlug,
        level + 1,
        currentDeptName,
        0
      );
      category.children = result.categories;
      leafCategories.push(...result.leafCategories);
    } else {
      // This is a leaf category
      leafCategories.push(category);
    }

    categories.push(category);
  }

  return { categories, leafCategories };
}

// ============================================================================
// Main Generation
// ============================================================================

function generateAllFiles() {
  console.log('🚀 Starting The Bazaar category dataset generation...\n');

  // Process category tree
  const { categories, leafCategories } = processCategoryTree(categoryTreeDefinition);
  
  console.log(`📊 Generated ${categories.length} total categories`);
  console.log(`🍃 Generated ${leafCategories.length} leaf categories\n`);

  // Flatten categories
  function flattenCategories(cats: CategoryNode[]): CategoryNode[] {
    const flat: CategoryNode[] = [];
    for (const cat of cats) {
      const { children, ...catWithoutChildren } = cat;
      flat.push(catWithoutChildren);
      if (children) {
        flat.push(...flattenCategories(children));
      }
    }
    return flat;
  }

  const flatCategories = flattenCategories(categories);
  console.log(`📋 Flattened to ${flatCategories.length} categories\n`);

  // Generate attribute mappings for leaf categories
  const attributeMappings: CategoryAttributeMapping[] = [];
  
  // Helper to get department name for a category
  function getDeptForCategory(catId: string, cats: CategoryNode[]): string {
    function findCategory(cat: CategoryNode, targetId: string): CategoryNode | null {
      if (cat.id === targetId) return cat;
      if (cat.children) {
        for (const child of cat.children) {
          const found = findCategory(child, targetId);
          if (found) return found;
        }
      }
      return null;
    }

    function findParent(cat: CategoryNode, targetId: string): CategoryNode | null {
      if (cat.children) {
        for (const child of cat.children) {
          if (child.id === targetId) return cat;
          const found = findParent(child, targetId);
          if (found) return found;
        }
      }
      return null;
    }

    // Find the category
    let targetCat: CategoryNode | null = null;
    for (const cat of cats) {
      targetCat = findCategory(cat, catId);
      if (targetCat) break;
    }

    if (!targetCat) return 'Fashion & Apparel';

    // Traverse up to find department (level 1)
    let current: CategoryNode | null = targetCat;
    while (current && current.level > 1) {
      for (const cat of cats) {
        const parent = findParent(cat, current.id);
        if (parent) {
          current = parent;
          break;
        }
      }
      if (current.level === 1) break;
      // Fallback: search in flat list
      const parentInFlat = flatCategories.find(c => c.id === current?.parent_id);
      if (parentInFlat) {
        current = parentInFlat;
      } else {
        break;
      }
    }

    return current?.name || 'Fashion & Apparel';
  }

  for (const leaf of leafCategories) {
    const deptName = getDeptForCategory(leaf.id, categories);
    const mapping = getAttributeMappingForCategory(leaf.name, deptName);
    attributeMappings.push({
      category_uuid: leaf.id,
      canonical_attributes: mapping.canonical,
      optional_attributes: mapping.optional
    });
  }

  console.log(`🏷️  Generated ${attributeMappings.length} attribute mappings\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. Generate TypeScript file
  const tsContent = `// Auto-generated category data for The Bazaar
// Generated: ${new Date().toISOString()}
// Total Categories: ${categories.length} | Leaf Categories: ${leafCategories.length}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  path_slug: string;
  level: number;
  sort_order: number;
  image_url: string;
  seo_title: string;
  seo_description: string;
  meta_keywords: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

export const bazaarCategories: Category[] = ${JSON.stringify(categories, null, 2)};

export default bazaarCategories;
`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'the_bazaar_categories.ts'),
    tsContent
  );
  console.log('✅ Generated: the_bazaar_categories.ts');

  // 2. Generate flat JSON file
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'the_bazaar_categories_flat.json'),
    JSON.stringify(flatCategories, null, 2)
  );
  console.log('✅ Generated: the_bazaar_categories_flat.json');

  // 3. Generate attribute mappings JSON
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'the_bazaar_category_attributes.json'),
    JSON.stringify(attributeMappings, null, 2)
  );
  console.log('✅ Generated: the_bazaar_category_attributes.json');

  console.log('\n🎉 Generation complete!');
  console.log(`\n📁 Files saved to: ${OUTPUT_DIR}`);
  console.log('\n📊 Summary:');
  console.log(`   - Total Categories: ${categories.length}`);
  console.log(`   - Leaf Categories: ${leafCategories.length}`);
  console.log(`   - Attribute Mappings: ${attributeMappings.length}`);
}

// Run generation
generateAllFiles();

