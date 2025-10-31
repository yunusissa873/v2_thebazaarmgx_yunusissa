export interface Product {
  id: string; // Mapped from product_id
  name: string; // Mapped from title
  description: string;
  price: number; // Mapped from price_kes
  stock: number;
  image: string; // Mapped from image_urls[0]
  // --- Original fields from mock data ---
  product_id: string;
  vendor_id: string;
  category_id: number;
  slug: string;
  price_usd: number;
  brand: string;
  seo_title: string;
  seo_description: string;
  image_urls: string[];
}