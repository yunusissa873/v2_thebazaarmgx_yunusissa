// Auto-generated vendor data
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

const vendors: Vendor[] = [
  {
    vendor_id: 'vnd_001',
    name: 'Nairobi Gadget Hub',
    slug: 'nairobi-gadget-hub',
    tagline: 'Your Trusted Source for Genuine Electronics.',
    description: 'Nairobi Gadget Hub is a leading retailer of genuine smartphones, laptops, and accessories in Kenya. We provide the latest tech from top brands like Apple, Samsung, and HP, backed by a solid warranty and exceptional customer service.',
    business_category: ['Electronics', 'Mobile Phones', 'Computers', 'Accessories'],
    location: 'Nairobi, Kenya',
    address: '123 Luthuli Avenue, Nairobi CBD',
    contact_email: 'nairobi-gadget-hub@thebazaar.com',
    phone: '+254722000111',
    logo_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&h=400&fit=crop&q=80',
    verification_status: 'verified',
    fulfillment_model: 'bazaar_fulfilled',
    rating: 4.9,
    joined_date: '2022-08-15T09:00:00Z',
    payout_method: 'bank_transfer',
    payout_account: {
      account_name: 'Nairobi Gadget Hub Ltd',
      account_number: '0112XXXXXX4567',
      bank_name: 'KCB Bank',
      currency: 'KES',
    },
    seo_meta: {
      title: 'Nairobi Gadget Hub — Laptops, Phones & Electronics | The Bazaar',
      description: 'Shop the best deals on genuine electronics from Nairobi Gadget Hub. Fast delivery in Kenya for all your tech needs.',
      keywords: ['electronics', 'smartphones', 'laptops', 'Nairobi', 'gadgets', 'Kenya'],
      canonical_url: 'https://thebazaar.com/vendors/nairobi-gadget-hub',
    },
    profile_url: 'https://thebazaar.com/vendors/nairobi-gadget-hub',
    social_links: {
      instagram: 'https://instagram.com/nairogadgets',
      facebook: 'https://facebook.com/nairogadgets',
      tiktok: null,
    },
    tags: ['electronics', 'official distributor', 'Nairobi', 'warranty'],
    status: 'active',
    created_at: '2022-08-15T09:00:00Z',
    updated_at: '2024-10-29T14:00:00Z',
  },
  {
    vendor_id: 'vnd_002',
    name: 'Ruuhi Collection',
    slug: 'ruuhi-collection',
    tagline: 'Elegance in Every Stitch. Modern Modest Wear.',
    description: 'Ruuhi Collection curates high-quality, modern, and modest women\'s fashion — from abayas and dresses to premium skincare essentials. Proudly Kenyan, we blend local craftsmanship with global trends to deliver elegance, comfort, and confidence.',
    business_category: ['Fashion', 'Clothing', 'Beauty & Skincare'],
    location: 'Nairobi, Kenya',
    address: 'Kenyatta Avenue, Nairobi CBD',
    contact_email: 'ruuhi-collection@thebazaar.com',
    phone: '+254712345678',
    logo_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=400&fit=crop&q=80',
    verification_status: 'verified',
    fulfillment_model: 'vendor_fulfilled',
    rating: 4.8,
    joined_date: '2023-06-18T10:30:00Z',
    payout_method: 'mpesa',
    payout_account: {
      account_name: 'Ruuhi Collection Ltd',
      account_number: '07XXXXXXX78',
      bank_name: null,
      currency: 'KES',
    },
    seo_meta: {
      title: 'Ruuhi Collection — Trendy Women\'s Fashion | The Bazaar',
      description: 'Shop stylish abayas, dresses, and beauty essentials from Ruuhi Collection, Nairobi\'s top women\'s fashion boutique.',
      keywords: ['abaya', 'dress', 'fashion', 'women', 'beauty', 'Kenya'],
      canonical_url: 'https://thebazaar.com/vendors/ruuhi-collection',
    },
    profile_url: 'https://thebazaar.com/vendors/ruuhi-collection',
    social_links: {
      instagram: 'https://instagram.com/ruuhicollection',
      facebook: 'https://facebook.com/ruuhicollection',
      tiktok: 'https://tiktok.com/@ruuhicollection',
    },
    tags: ['women', 'fashion', 'beauty', 'kenyan brand', 'modest wear'],
    status: 'active',
    created_at: '2023-06-18T10:30:00Z',
    updated_at: '2024-10-28T09:00:00Z',
  },
  {
    vendor_id: 'vnd_003',
    name: 'TechHub Kenya',
    slug: 'techhub-kenya',
    tagline: 'Leading provider of cutting-edge electronics and gadgets in East Africa.',
    description: 'Leading provider of cutting-edge electronics and gadgets in East Africa. We offer authentic products with warranty and excellent customer service.',
    business_category: ['Electronics', 'Computers', 'Mobile Phones'],
    location: 'Nairobi, Kenya',
    address: 'Westlands, Nairobi',
    contact_email: 'info@techhubkenya.com',
    phone: '+254712345678',
    logo_url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=400&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&h=400&fit=crop',
    verification_status: 'verified',
    fulfillment_model: 'bazaar_fulfilled',
    rating: 4.8,
    joined_date: '2023-01-15T08:00:00Z',
    payout_method: 'bank_transfer',
    payout_account: {
      account_name: 'TechHub Kenya Ltd',
      account_number: '0112XXXXXX7890',
      bank_name: 'KCB Bank',
      currency: 'KES',
    },
    seo_meta: {
      title: 'TechHub Kenya — Electronics & Gadgets | The Bazaar',
      description: 'Shop authentic electronics and gadgets from TechHub Kenya. Leading provider in East Africa with warranty and excellent service.',
      keywords: ['electronics', 'gadgets', 'tech', 'Nairobi', 'Kenya', 'warranty'],
      canonical_url: 'https://thebazaar.com/vendors/techhub-kenya',
    },
    profile_url: 'https://thebazaar.com/vendors/techhub-kenya',
    social_links: {
      instagram: 'https://instagram.com/techhubkenya',
      facebook: 'https://facebook.com/techhubkenya',
      tiktok: null,
    },
    tags: ['electronics', 'tech', 'gadgets', 'Nairobi', 'warranty', 'official distributor'],
    status: 'active',
    created_at: '2023-01-15T08:00:00Z',
    updated_at: '2024-10-29T15:00:00Z',
  },
  {
    vendor_id: 'vnd_004',
    name: 'Sawae Brands Limited',
    slug: 'sawae-brands-limited',
    tagline: 'Your trusted one stop shop for authentic skin care and fragrances.',
    description: 'Your trusted one stop shop for authentic skin care and fragrances. We offer premium brands including Sapil, Le Falconé, Swiss Arabian, and Cosmo. All products are 100% authentic and directly sourced from manufacturers.',
    business_category: ['Cologne', 'Perfume', 'Fragrances', 'Incense', 'Skin Care', 'Hair Care'],
    location: 'Nairobi, Kenya',
    address: 'Nairobi, Kenya',
    contact_email: 'info@sawaebrands.co.ke',
    phone: '+254720123456',
    logo_url: '/images/vendors/sawae-brands-logo.png',
    banner_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=1200&h=800&fit=crop&q=90',
    verification_status: 'verified',
    fulfillment_model: 'bazaar_fulfilled',
    rating: 4.9,
    joined_date: '2023-03-20T10:00:00Z',
    payout_method: 'bank_transfer',
    payout_account: {
      account_name: 'Sawae Brands Limited',
      account_number: '0112XXXXXX9012',
      bank_name: 'Equity Bank',
      currency: 'KES',
    },
    seo_meta: {
      title: 'Sawae Brands Limited — Authentic Skincare & Fragrances | The Bazaar',
      description: 'Your trusted one stop shop for authentic skin care and fragrances. Premium brands: Sapil, Le Falconé, Swiss Arabian, Cosmo.',
      keywords: ['perfume', 'fragrance', 'skincare', 'haircare', 'Le Falconé', 'Sapil', 'Swiss Arabian', 'Cosmo', 'Nairobi', 'Kenya', 'authentic'],
      canonical_url: 'https://thebazaar.com/vendors/sawae-brands-limited',
    },
    profile_url: 'https://thebazaar.com/vendors/sawae-brands-limited',
    social_links: {
      instagram: 'https://instagram.com/sawaebrands',
      facebook: 'https://facebook.com/sawaebrands',
      tiktok: null,
    },
    tags: ['perfume', 'fragrance', 'skincare', 'haircare', 'Le Falconé', 'Sapil', 'Swiss Arabian', 'Cosmo', 'authentic', 'premium brands'],
    status: 'active',
    created_at: '2023-03-20T10:00:00Z',
    updated_at: '2024-11-02T12:00:00Z',
  },
];

export default vendors;

