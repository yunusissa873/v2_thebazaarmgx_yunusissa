/**
 * Vendor Data Transformation Script
 */

import fs from 'fs';
import path from 'path';

const vendorImageMap: Record<string, { logo: string; banner: string }> = {
  'nairobi-gadget-hub': {
    logo: 'photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1511707171634-5f897ff02aa9?w=1200&h=400&fit=crop&q=80',
  },
  'ruuhi-collection': {
    logo: 'photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1490481651871-ab68de25d43d?w=1200&h=400&fit=crop&q=80',
  },
  'mombasa-spice-emporium': {
    logo: 'photo-1556912172-45b7abe8b7e1?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1556912172-45b7abe8b7e1?w=1200&h=400&fit=crop&q=80',
  },
  'kisumu-kicks': {
    logo: 'photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1542291026-7eec264c27ff?w=1200&h=400&fit=crop&q=80',
  },
  'nakuru-outdoors': {
    logo: 'photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop&q=80',
  },
  'kiambu-home-decor': {
    logo: 'photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1571461027-0f3062f0b6d4?w=1200&h=400&fit=crop&q=80',
  },
  'machakos-auto-parts': {
    logo: 'photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1486262715619-67b85e0b08d3?w=1200&h=400&fit=crop&q=80',
  },
  'urban-baby-nairobi': {
    logo: 'photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1587654780291-39c9404d746b?w=1200&h=400&fit=crop&q=80',
  },
  'westlands-office-pro': {
    logo: 'photo-1452860606245-08d17df8cbb4?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1452860606245-08d17df8cbb4?w=1200&h=400&fit=crop&q=80',
  },
  'the-tool-shed-ke': {
    logo: 'photo-1504148455328-c376907d081c?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1504148455328-c376907d081c?w=1200&h=400&fit=crop&q=80',
  },
  'karen-wellness-corner': {
    logo: 'photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1576091160399-112ba8d25d1f?w=1200&h=400&fit=crop&q=80',
  },
  'gigiri-gems': {
    logo: 'photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1523275335684-37898b6baf30?w=1200&h=400&fit=crop&q=80',
  },
  'yaya-art-craft': {
    logo: 'photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1541961017774-22349e4a1262?w=1200&h=400&fit=crop&q=80',
  },
  'cbd-books-beyond': {
    logo: 'photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop&q=80',
  },
  'nyali-home-goods': {
    logo: 'photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1571461027-0f3062f0b6d4?w=1200&h=400&fit=crop&q=80',
  },
  'rift-valley-safety': {
    logo: 'photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1542291026-7eec264c27ff?w=1200&h=400&fit=crop&q=80',
  },
  'lakeside-pet-world': {
    logo: 'photo-1517849845537-4d257902454a?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1601758228041-f3b2795255f1?w=1200&h=400&fit=crop&q=80',
  },
  'thika-garden-supply': {
    logo: 'photo-1466692476868-aef1dfb1e735?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1466692476868-aef1dfb1e735?w=1200&h=400&fit=crop&q=80',
  },
  'athi-river-deals': {
    logo: 'photo-1556912172-45b7abe8b7e1?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1556912172-45b7abe8b7e1?w=1200&h=400&fit=crop&q=80',
  },
  'kilimani-luxury': {
    logo: 'photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1490481651871-ab68de25d43d?w=1200&h=400&fit=crop&q=80',
  },
};

function getVendorImages(slug: string) {
  const mapping = vendorImageMap[slug] || {
    logo: 'photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80',
    banner: 'photo-1505740420928-5e560c06d30e?w=1200&h=400&fit=crop&q=80',
  };
  return {
    logo_url: `https://images.unsplash.com/${mapping.logo}`,
    banner_url: `https://images.unsplash.com/${mapping.banner}`,
  };
}

function transformVendor(vendor: any) {
  const images = getVendorImages(vendor.slug);
  
  // Fix incomplete vnd_013
  if (vendor.vendor_id === 'vnd_013' && (!vendor.seo_meta || !vendor.seo_meta.description)) {
    vendor.seo_meta = vendor.seo_meta || {};
    vendor.seo_meta.description = 'Find all your art and craft supplies at Yaya Art & Craft. We stock paints, brushes, canvases, and more.';
  }
  
  return {
    ...vendor,
    ...images,
    created_at: vendor.created_at?.replace('2025', '2024') || vendor.created_at,
    updated_at: vendor.updated_at?.replace('2025', '2024') || vendor.updated_at,
  };
}

export function transformVendors() {
  console.log('Transforming vendors...');
  
  // Read from the vendors.json file the user shared (we'll need to save it first)
  // For now, creating transformed structure
  const outputDir = path.join(__dirname, '../src/data/transformed');
  
  // Check if vendors.json exists with the new format
  const vendorsFile = path.join(__dirname, '../src/data/mock/vendors.json');
  
  let vendorsData: any = { data: [] };
  
  if (fs.existsSync(vendorsFile)) {
    try {
      const content = fs.readFileSync(vendorsFile, 'utf-8');
      vendorsData = JSON.parse(content);
      
      // If it's the old format (array), wrap it
      if (Array.isArray(vendorsData)) {
        vendorsData = { data: vendorsData };
      }
    } catch (e) {
      console.warn('Could not parse vendors.json, using sample data');
    }
  }
  
  // If no data, create sample
  if (!vendorsData.data || vendorsData.data.length === 0) {
    vendorsData.data = [
      {
        vendor_id: 'vnd_001',
        name: 'Nairobi Gadget Hub',
        slug: 'nairobi-gadget-hub',
        tagline: 'Your Trusted Source for Genuine Electronics.',
        description: 'Nairobi Gadget Hub is a leading retailer of genuine smartphones, laptops, and accessories in Kenya.',
        business_category: ['Electronics', 'Mobile Phones', 'Computers'],
        location: 'Nairobi, Kenya',
        address: '123 Luthuli Avenue, Nairobi CBD',
        contact_email: 'nairobi-gadget-hub@thebazaar.com',
        phone: '+254722000111',
        verification_status: 'verified',
        fulfillment_model: 'bazaar_fulfilled',
        rating: 4.9,
        joined_date: '2022-08-15T09:00:00Z',
        payout_method: 'bank_transfer',
        payout_account: {},
        seo_meta: {},
        profile_url: 'https://thebazaar.com/vendors/nairobi-gadget-hub',
        social_links: {},
        tags: ['electronics', 'official distributor', 'Nairobi'],
        status: 'active',
        created_at: '2022-08-15T09:00:00Z',
        updated_at: '2024-10-29T14:00:00Z',
      },
    ];
  }
  
  const transformed = vendorsData.data.map((v: any) => transformVendor(v));
  
  const tsContent = `// Auto-generated vendor data
export interface Vendor {
  vendor_id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  business_category: string[];
  location: string;
  address: string;
  contact_email: string;
  phone: string;
  logo_url: string;
  banner_url: string;
  verification_status: 'verified' | 'pending' | 'restricted';
  fulfillment_model: 'bazaar_fulfilled' | 'vendor_fulfilled';
  rating: number;
  joined_date: string;
  payout_method: string;
  payout_account: any;
  seo_meta: any;
  profile_url: string;
  social_links: any;
  tags: string[];
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

const vendors: Vendor[] = ${JSON.stringify(transformed, null, 2)};

export default vendors;
`;
  
  fs.writeFileSync(path.join(outputDir, 'vendors.ts'), tsContent);
  fs.writeFileSync(
    path.join(outputDir, 'vendors_flat.json'),
    JSON.stringify(transformed, null, 2)
  );
  
  console.log(`   ✅ Transformed ${transformed.length} vendors`);
}

