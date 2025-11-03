// Auto-generated system settings data
export interface SystemSettings {
  site_name: string;
  site_tagline: string;
  site_description: string;
  site_url: string;
  support_email: string;
  support_phone: string;
  currency: {
    default: string;
    symbol: string;
    code: string;
    decimals: number;
  };
  tax: {
    enabled: boolean;
    rate: number;
    inclusive: boolean;
  };
  shipping: {
    min_order_amount: number;
    free_shipping_threshold_nairobi: number;
    free_shipping_threshold_other_cities: number;
    free_shipping_threshold_other_counties: number;
    default_shipping_method: string;
  };
  payments: {
    enabled_methods: string[];
    mpesa_enabled: boolean;
    paystack_enabled: boolean;
    stripe_enabled: boolean;
    default_method: string;
  };
  orders: {
    min_order_amount: number;
    max_order_amount: number;
    auto_cancel_after_hours: number;
    refund_window_days: number;
  };
  vendor: {
    approval_required: boolean;
    kyc_required: boolean;
    commission_rate: number;
    payout_delay_days: number;
  };
  features: {
    wishlist_enabled: boolean;
    reviews_enabled: boolean;
    ratings_enabled: boolean;
    comparison_enabled: boolean;
    gift_wrapping_enabled: boolean;
    loyalty_program_enabled: boolean;
  };
  maintenance: {
    maintenance_mode: boolean;
    maintenance_message: string;
    allowed_ips: string[];
  };
  seo: {
    default_meta_title: string;
    default_meta_description: string;
    default_keywords: string[];
    og_image: string;
    twitter_card: string;
  };
  social: {
    facebook_url: string;
    instagram_url: string;
    twitter_url: string;
    linkedin_url: string;
  };
  analytics: {
    google_analytics_id: string | null;
    facebook_pixel_id: string | null;
    posthog_enabled: boolean;
  };
  notifications: {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
  };
  cache: {
    ttl_homepage: number;
    ttl_products: number;
    ttl_categories: number;
  };
  limits: {
    max_products_per_vendor: number;
    max_images_per_product: number;
    max_review_length: number;
    max_wishlist_items: number;
  };
  created_at: string;
  updated_at: string;
}

const systemSettings: SystemSettings = {
  site_name: 'The Bazaar',
  site_tagline: "Kenya's Premier Online Marketplace",
  site_description: 'Discover amazing products from verified vendors across Kenya. Shop electronics, fashion, home goods, and more with fast nationwide delivery.',
  site_url: 'https://thebazaar.com',
  support_email: 'support@thebazaar.com',
  support_phone: '+254700000000',
  currency: {
    default: 'KES',
    symbol: 'KES',
    code: 'KES',
    decimals: 0,
  },
  tax: {
    enabled: true,
    rate: 15,
    inclusive: false,
  },
  shipping: {
    min_order_amount: 0,
    free_shipping_threshold_nairobi: 5000,
    free_shipping_threshold_other_cities: 10000,
    free_shipping_threshold_other_counties: 15000,
    default_shipping_method: 'standard',
  },
  payments: {
    enabled_methods: ['mpesa', 'paystack', 'stripe'],
    mpesa_enabled: true,
    paystack_enabled: true,
    stripe_enabled: true,
    default_method: 'mpesa',
  },
  orders: {
    min_order_amount: 0,
    max_order_amount: 1000000,
    auto_cancel_after_hours: 24,
    refund_window_days: 7,
  },
  vendor: {
    approval_required: true,
    kyc_required: true,
    commission_rate: 10,
    payout_delay_days: 7,
  },
  features: {
    wishlist_enabled: true,
    reviews_enabled: true,
    ratings_enabled: true,
    comparison_enabled: false,
    gift_wrapping_enabled: false,
    loyalty_program_enabled: false,
  },
  maintenance: {
    maintenance_mode: false,
    maintenance_message: "We're currently upgrading our system. We'll be back soon!",
    allowed_ips: [],
  },
  seo: {
    default_meta_title: "The Bazaar — Kenya's Premier Online Marketplace",
    default_meta_description: 'Shop the best products from verified vendors across Kenya. Fast delivery, secure payments, excellent customer service.',
    default_keywords: ['online shopping', 'Kenya', 'marketplace', 'e-commerce', 'products', 'vendors'],
    og_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=630&fit=crop&q=80',
    twitter_card: 'summary_large_image',
  },
  social: {
    facebook_url: 'https://facebook.com/thebazaar',
    instagram_url: 'https://instagram.com/thebazaar',
    twitter_url: 'https://twitter.com/thebazaar',
    linkedin_url: 'https://linkedin.com/company/thebazaar',
  },
  analytics: {
    google_analytics_id: null,
    facebook_pixel_id: null,
    posthog_enabled: false,
  },
  notifications: {
    email_enabled: true,
    sms_enabled: true,
    push_enabled: true,
  },
  cache: {
    ttl_homepage: 300,
    ttl_products: 600,
    ttl_categories: 3600,
  },
  limits: {
    max_products_per_vendor: 10000,
    max_images_per_product: 10,
    max_review_length: 2000,
    max_wishlist_items: 100,
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-11-01T00:00:00Z',
};

export default systemSettings;

