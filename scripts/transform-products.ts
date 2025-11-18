/**
 * Product Data Transformation Script
 */

import fs from 'fs';
import path from 'path';

function getProductImage(productName: string): string {
  const nameLower = productName.toLowerCase();
  const imageMap: Record<string, string> = {
    'samsung': 'photo-1511707171634-5f897ff02aa9',
    'galaxy': 'photo-1511707171634-5f897ff02aa9',
    'iphone': 'photo-1523275335684-37898b6baf30',
    'ipad': 'photo-1544244015-0df4b3ffc6b0',
    'macbook': 'photo-1496181133206-80ce9b88a853',
    'laptop': 'photo-1496181133206-80ce9b88a853',
    'dell': 'photo-1496181133206-80ce9b88a853',
    'xps': 'photo-1496181133206-80ce9b88a853',
    'headphones': 'photo-1505740420928-5e560c06d30e',
    'sony': 'photo-1505740420928-5e560c06d30e',
    'mouse': 'photo-1527814052947-f8f6b4d3a1b8',
    'logitech': 'photo-1527814052947-f8f6b4d3a1b8',
    'power bank': 'photo-1545454675-3539b9cd9d31',
    'anker': 'photo-1545454675-3539b9cd9d31',
    'speaker': 'photo-1608043152269-423dbba4e7e1',
    'jbl': 'photo-1608043152269-423dbba4e7e1',
    'bluetooth': 'photo-1608043152269-423dbba4e7e1',
    'abaya': 'photo-1595777457583-95e059d581b8',
    'dress': 'photo-1595777457583-95e059d581b8',
    'ankara': 'photo-1595777457583-95e059d581b8',
    'shirt': 'photo-1521572163474-6864f9cf17ab',
    'shoes': 'photo-1542291026-7eec264c27ff',
    'sneakers': 'photo-1542291026-7eec264c27ff',
    'adidas': 'photo-1542291026-7eec264c27ff',
    'nike': 'photo-1542291026-7eec264c27ff',
    'boots': 'photo-1542291026-7eec264c27ff',
    'heels': 'photo-1549298916-b41d501d3772',
    'tent': 'photo-1478131143081-80f7f84ca84d',
    'camping': 'photo-1478131143081-80f7f84ca84d',
    'backpack': 'photo-1478131143081-80f7f84ca84d',
    'dumbbell': 'photo-1571019613454-1cb2f99b2d8b',
    'yoga': 'photo-1506126613408-eca07ce68773',
    'furniture': 'photo-1586023492125-27b2c045efd7',
    'sofa': 'photo-1586023492125-27b2c045efd7',
    'bed': 'photo-1522771739844-6a9f6d5f14af',
    'microwave': 'photo-1586201375761-83865001e31c',
    'toaster': 'photo-1586201375761-83865001e31c',
    'air fryer': 'photo-1556910096-6f5e72db6803',
    'cookware': 'photo-1556910096-6f5e72db6803',
    'foundation': 'photo-1522335789203-aabd1fc54bc9',
    'lipstick': 'photo-1631217868264-e5b90bb7e133',
    'serum': 'photo-1608248543803-ba4f8e72a119',
    'cleanser': 'photo-1612817288484-6f916006741a',
    'sunscreen': 'photo-1631217868264-e5b90bb7e133',
    'brake': 'photo-1486262715619-67b85e0b08d3',
    'filter': 'photo-1486262715619-67b85e0b08d3',
    'diaper': 'photo-1587654780291-39c9404d746b',
    'bottle': 'photo-1587654780291-39c9404d746b',
    'crib': 'photo-1587654780291-39c9404d746b',
    'pen': 'photo-1452860606245-08d17df8cbb4',
    'notebook': 'photo-1452860606245-08d17df8cbb4',
    'paper': 'photo-1452860606245-08d17df8cbb4',
    'drill': 'photo-1504148455328-c376907d081c',
    'grinder': 'photo-1504148455328-c376907d081c',
    'vitamin': 'photo-1576091160399-112ba8d25d1f',
    'watch': 'photo-1523275335684-37898b6baf30',
    'necklace': 'photo-1515562141207-7a88fb7ce338',
    'paint': 'photo-1541961017774-22349e4a1262',
    'book': 'photo-1481627834876-b7833e8f5570',
    'dog food': 'photo-1601758228041-f3b2795255f1',
    'cat food': 'photo-1518791841217-8f162f1e1131',
    'spice': 'photo-1556912172-45b7abe8b7e1',
    'tea': 'photo-1556912172-45b7abe8b7e1',
    'detergent': 'photo-1581092160562-40aa08e78837',
    'soap': 'photo-1581092160562-40aa08e78837',
  };
  
  for (const [key, photoId] of Object.entries(imageMap)) {
    if (nameLower.includes(key)) {
      return `https://images.unsplash.com/${photoId}?w=800&h=1000&fit=crop&q=80`;
    }
  }
  
  return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=1000&fit=crop&q=80';
}

function fixIncompleteProducts(products: any[]): any[] {
  // Fix prd_020 var_030
  const prd020 = products.find(p => p.product_id === 'prd_020');
  if (prd020?.variants) {
    const var030 = prd020.variants.find((v: any) => v.variant_id === 'var_030');
    if (var030 && (!var030.sku || var030.sku.includes('NGH-MXM3S-GRAY'))) {
      var030.sku = 'NGH-MXM3S-GRAY';
      var030.stock = var030.stock || 20;
      var030.price = var030.price || 14500;
    }
  }
  
  // Fix prd_052
  const prd052 = products.find(p => p.product_id === 'prd_052');
  if (prd052 && (!prd052.variants || prd052.variants.length < 2)) {
    prd052.variants = [
      {
        variant_id: 'var_074',
        name: 'Core i9 / 32GB RAM / 1TB SSD',
        sku: 'NGH-XPS15-I9-32',
        price: 310000,
        stock: 8,
      },
      {
        variant_id: 'var_075',
        name: 'Core i7 / 16GB RAM / 512GB SSD',
        sku: 'NGH-XPS15-I7-16',
        price: 280000,
        stock: 12,
      },
    ];
  }
  
  // Fix prd_074
  const prd074 = products.find(p => p.product_id === 'prd_074');
  if (prd074 && prd074.variants) {
    const var123 = prd074.variants.find((v: any) => v.variant_id === 'var_123');
    if (var123 && (!var123.sku || var123.sku.includes('LPW-'))) {
      var123.sku = 'LPW-PEDIGREE-3KG';
      var123.stock = var123.stock || 150;
    }
  }
  
  // Fix prd_096
  const prd096 = products.find(p => p.product_id === 'prd_096');
  if (prd096) {
    if (!prd096.images || prd096.images.length === 0 || prd096.images[0]?.endsWith('/assets/products/')) {
      prd096.images = [getProductImage(prd096.name)];
    }
    if (!prd096.variants || prd096.variants.length === 0) {
      prd096.variants = [{
        variant_id: 'var_170',
        name: 'Medium Size (60cm)',
        sku: 'NHG-MACRAME-60',
        price: prd096.price || 3800,
        stock: prd096.stock || 45,
      }];
    }
  }
  
  return products;
}

function transformProduct(product: any) {
  // Transform images
  const images = (product.images || []).map((img: string) => {
    if (img.startsWith('/assets/')) {
      return getProductImage(product.name);
    }
    return img;
  });
  
  if (images.length === 0) {
    images.push(getProductImage(product.name));
  }
  
  // Transform variants
  const variants = (product.variants || [])
    .filter((v: any) => v && v.variant_id && v.sku && v.sku.length > 5)
    .map((v: any) => ({
      variant_id: v.variant_id,
      name: v.name,
      sku: v.sku,
      price: v.price || product.price,
      stock_quantity: v.stock || 0,
    }));
  
  return {
    product_id: product.product_id,
    name: product.name,
    slug: product.slug,
    vendor_id: product.vendor_id,
    category_id: product.category_id,
    price: product.price,
    currency: product.currency || 'KES',
    stock_quantity: product.stock || 0,
    description: product.description || '',
    short_description: (product.description || '').substring(0, 150) + ((product.description || '').length > 150 ? '...' : ''),
    images,
    variants,
    tags: product.tags || [],
    rating: product.rating || 0,
    is_featured: product.featured || false,
    is_active: product.status === 'active',
    compare_at_price: variants.some((v: any) => v.price > product.price)
      ? Math.max(...variants.map((v: any) => v.price), product.price)
      : null,
    inventory_tracking: product.inventory_tracking !== false,
    created_at: product.created_at?.replace('2025', '2024') || '2024-10-01T10:00:00Z',
    updated_at: product.updated_at?.replace('2025', '2024') || '2024-10-28T14:00:00Z',
  };
}

export function transformProducts() {
  console.log('Transforming products...');
  
  const inputFile = path.join(__dirname, '../src/data/mock/products.json');
  let productsData: any;
  
  try {
    const content = fs.readFileSync(inputFile, 'utf-8');
    productsData = JSON.parse(content);
  } catch (e) {
    console.error('Error reading products.json:', e);
    return;
  }
  
  let products = productsData.data || [];
  products = fixIncompleteProducts(products);
  
  const transformed = products
    .filter((p: any) => p && p.product_id)
    .map((p: any) => transformProduct(p));
  
  // Separate variants for backend
  const variants: any[] = [];
  transformed.forEach((product: any) => {
    product.variants.forEach((v: any) => {
      variants.push({
        ...v,
        product_id: product.product_id,
      });
    });
  });
  
  const outputDir = path.join(__dirname, '../src/data/transformed');
  
  const tsContent = `// Auto-generated product data
export interface ProductVariant {
  variant_id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
}

export interface Product {
  product_id: string;
  name: string;
  slug: string;
  vendor_id: string;
  category_id: string;
  price: number;
  currency: string;
  stock_quantity: number;
  description: string;
  short_description: string;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  rating: number;
  is_featured: boolean;
  is_active: boolean;
  compare_at_price: number | null;
  inventory_tracking: boolean;
  created_at: string;
  updated_at: string;
}

const products: Product[] = ${JSON.stringify(transformed, null, 2)};

export default products;
`;
  
  fs.writeFileSync(path.join(outputDir, 'products.ts'), tsContent);
  
  // Backend: Separate products and variants
  const productsForBackend = transformed.map((p: any) => {
    const { variants, ...rest } = p;
    return rest;
  });
  
  fs.writeFileSync(
    path.join(outputDir, 'products_flat.json'),
    JSON.stringify(productsForBackend, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'variants_flat.json'),
    JSON.stringify(variants, null, 2)
  );
  
  console.log(`   ✅ Transformed ${transformed.length} products`);
  console.log(`   ✅ Extracted ${variants.length} variants`);
}

