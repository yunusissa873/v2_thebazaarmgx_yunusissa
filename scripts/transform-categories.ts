/**
 * Category Data Transformation Script
 * Converts categories from Pexels to Unsplash images and fixes dates
 */

import fs from 'fs';
import path from 'path';

// Unsplash image mapping
const categoryImageMap: Record<string, string> = {
  'electronics': 'photo-1505740420928-5e560c06d30e',
  'mobile': 'photo-1511707171634-5f897ff02aa9',
  'smartphones': 'photo-1511707171634-5f897ff02aa9',
  'android': 'photo-1511707171634-5f897ff02aa9',
  'ios': 'photo-1523275335684-37898b6baf30',
  'accessories': 'photo-1545454675-3539b9cd9d31',
  'cases': 'photo-1545454675-3539b9cd9d31',
  'power': 'photo-1545454675-3539b9cd9d31',
  'computers': 'photo-1498050108023-c5249f4df085',
  'laptops': 'photo-1496181133206-80ce9b88a853',
  'gaming': 'photo-1591488320449-11ea701e78f7',
  'keyboards': 'photo-1587829741301-dc798b83add3',
  'mice': 'photo-1527814052947-f8f6b4d3a1b8',
  'fashion': 'photo-1441986300917-64674bd600d8',
  'women': 'photo-1490481651871-ab68de25d43d',
  'dresses': 'photo-1595777457583-95e059d581b8',
  'men': 'photo-1520975661595-6453be3f7070',
  'shirts': 'photo-1521572163474-6864f9cf17ab',
  'home': 'photo-1586023492125-27b2c045efd7',
  'appliances': 'photo-1556910096-6f5e72db6803',
  'refrigerator': 'photo-1556910096-6f5e72db6803',
  'microwave': 'photo-1586201375761-83865001e31c',
  'blender': 'photo-1556910096-6f5e72db6803',
  'beauty': 'photo-1631217868264-e5b90bb7e133',
  'skincare': 'photo-1620916566398-39f1143ab7be',
  'makeup': 'photo-1522335789203-aabd1fc54bc9',
  'sports': 'photo-1571019613454-1cb2f99b2d8b',
  'fitness': 'photo-1534438327276-14e5300c3a48',
  'yoga': 'photo-1506126613408-eca07ce68773',
  'automotive': 'photo-1449824913935-59a10b8d2000',
  'car': 'photo-1485462537746-965f33f7f6a7',
  'brake': 'photo-1486262715619-67b85e0b08d3',
  'engine': 'photo-1486262715619-67b85e0b08d3',
  'books': 'photo-1507003211169-0a1dd7228f2d',
  'fiction': 'photo-1481627834876-b7833e8f5570',
  'textbook': 'photo-1503676260728-1c00da094a0b',
  'pets': 'photo-1517849845537-4d257902454a',
  'dog': 'photo-1601758228041-f3b2795255f1',
  'cat': 'photo-1518791841217-8f162f1e1131',
  'toys': 'photo-1515488042361-ee00e0ddd4e4',
  'groceries': 'photo-1556912172-45b7abe8b7e1',
  'spice': 'photo-1556912172-45b7abe8b7e1',
  'health': 'photo-1571019613454-1cb2f99b2d8b',
  'vitamin': 'photo-1576091160399-112ba8d25d1f',
  'stationery': 'photo-1452860606245-08d17df8cbb4',
  'pen': 'photo-1452860606245-08d17df8cbb4',
  'industrial': 'photo-1581092160562-40aa08e78837',
  'safety': 'photo-1542291026-7eec264c27ff',
  'art': 'photo-1541961017774-22349e4a1262',
  'paint': 'photo-1541961017774-22349e4a1262',
  'garden': 'photo-1466692476868-aef1dfb1e735',
  'baby': 'photo-1587654780291-39c9404d746b',
  'diaper': 'photo-1587654780291-39c9404d746b',
  'jewelry': 'photo-1515562141207-7a88fb7ce338',
  'watch': 'photo-1523275335684-37898b6baf30',
  'necklace': 'photo-1515562141207-7a88fb7ce338',
  'footwear': 'photo-1542291026-7eec264c27ff',
  'shoes': 'photo-1542291026-7eec264c27ff',
  'tools': 'photo-1504148455328-c376907d081c',
  'drill': 'photo-1504148455328-c376907d081c',
  'furniture': 'photo-1586023492125-27b2c045efd7',
  'sofa': 'photo-1586023492125-27b2c045efd7',
};

function getCategoryImage(categoryName: string, level: number): string {
  const nameLower = categoryName.toLowerCase();
  let photoId = '1505740420928-5e560c06d30e'; // Default
  
  for (const [key, id] of Object.entries(categoryImageMap)) {
    if (nameLower.includes(key)) {
      photoId = id;
      break;
    }
  }
  
  const dimensions = level === 1 ? 'w=800&h=600' : level <= 2 ? 'w=600&h=450' : 'w=400&h=300';
  return `https://images.unsplash.com/${photoId}?${dimensions}&fit=crop&q=80`;
}

function transformCategory(cat: any): any {
  const transformed = {
    ...cat,
    image_url: getCategoryImage(cat.name, cat.level || 1),
    created_at: cat.created_at?.replace('2025', '2024') || '2024-11-02T00:00:00Z',
    updated_at: cat.updated_at?.replace('2025', '2024') || '2024-11-02T00:00:00Z',
  };

  if (cat.children && Array.isArray(cat.children)) {
    transformed.children = cat.children.map((child: any) => transformCategory(child));
  }

  return transformed;
}

function flattenCategories(categories: any[], parentId: string | null = null): any[] {
  const flat: any[] = [];
  
  categories.forEach(category => {
    const { children, ...categoryData } = category;
    flat.push({
      ...categoryData,
      parent_id: parentId || category.parent_id,
    });
    
    if (children && children.length > 0) {
      flat.push(...flattenCategories(children, category.category_id));
    }
  });
  
  return flat;
}

export function transformCategories() {
  // For now, we'll create sample category data from the structure provided
  // In production, this would read from the batch files
  console.log('Transforming categories...');
  
  const outputDir = path.join(__dirname, '../src/data/transformed');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create sample transformed categories - you'll replace this with actual batch file processing
  // For now, creating a structure that matches what was shared
  const sampleCategories = [
    {
      category_id: 'dept_01',
      parent_id: null,
      name: 'Electronics',
      slug: 'electronics',
      level: 1,
      priority: 1,
      is_featured: true,
      image_url: getCategoryImage('Electronics', 1),
      created_at: '2024-11-02T00:00:00Z',
      updated_at: '2024-11-02T00:00:00Z',
      children: [
        {
          category_id: 'cat_01_01',
          parent_id: 'dept_01',
          name: 'Mobile Phones & Accessories',
          slug: 'mobile-phones-accessories',
          level: 2,
          priority: 1,
          is_featured: true,
          image_url: getCategoryImage('Mobile Phones', 2),
          created_at: '2024-11-02T00:00:00Z',
          updated_at: '2024-11-02T00:00:00Z',
          children: [],
        },
      ],
    },
  ];
  
  const transformed = sampleCategories.map(dept => transformCategory(dept));
  const flat = flattenCategories(transformed);
  
  // TypeScript file for frontend
  const tsContent = `// Auto-generated category data with Unsplash images
// Generated: ${new Date().toISOString()}

export interface LeafCategory {
  category_id: string;
  parent_id: string;
  name: string;
  slug: string;
  level: 4;
  priority: number;
  is_featured: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface SubCategory {
  category_id: string;
  parent_id: string;
  name: string;
  slug: string;
  level: 3;
  priority: number;
  is_featured: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
  children: LeafCategory[];
}

export interface Category {
  category_id: string;
  parent_id: string;
  name: string;
  slug: string;
  level: 2;
  priority: number;
  is_featured: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
  children: SubCategory[];
}

export interface Department {
  category_id: string;
  parent_id: null;
  name: string;
  slug: string;
  level: 1;
  priority: number;
  is_featured: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
  children: Category[];
}

const departments: Department[] = ${JSON.stringify(transformed, null, 2)};

export default departments;
`;
  
  fs.writeFileSync(path.join(outputDir, 'categories.ts'), tsContent);
  
  // Flat JSON for backend
  fs.writeFileSync(
    path.join(outputDir, 'categories_flat.json'),
    JSON.stringify(flat, null, 2)
  );
  
  console.log(`   ✅ Created ${flat.length} categories`);
}

