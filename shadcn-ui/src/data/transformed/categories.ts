// Auto-generated category data with Unsplash images
// Generated from user-provided data structure

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

const departments: Department[] = [
  {
    category_id: 'dept_01',
    parent_id: null,
    name: 'Electronics',
    slug: 'electronics',
    level: 1,
    priority: 1,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop&q=80',
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
        image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=450&fit=crop&q=80',
        created_at: '2024-11-02T00:00:00Z',
        updated_at: '2024-11-02T00:00:00Z',
        children: [
          {
            category_id: 'sub_01_01_01',
            parent_id: 'cat_01_01',
            name: 'Smartphones',
            slug: 'smartphones',
            level: 3,
            priority: 1,
            is_featured: true,
            image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&q=80',
            created_at: '2024-11-02T00:00:00Z',
            updated_at: '2024-11-02T00:00:00Z',
            children: [
              {
                category_id: 'leaf_01_01_01_01',
                parent_id: 'sub_01_01_01',
                name: 'Android Phones',
                slug: 'android-phones',
                level: 4,
                priority: 1,
                is_featured: false,
                image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop&q=80',
                created_at: '2024-11-02T00:00:00Z',
                updated_at: '2024-11-02T00:00:00Z',
              },
              {
                category_id: 'leaf_01_01_01_02',
                parent_id: 'sub_01_01_01',
                name: 'iOS Phones (iPhones)',
                slug: 'ios-phones-iphones',
                level: 4,
                priority: 2,
                is_featured: false,
                image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop&q=80',
                created_at: '2024-11-02T00:00:00Z',
                updated_at: '2024-11-02T00:00:00Z',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    category_id: 'dept_02',
    parent_id: null,
    name: 'Fashion & Apparel',
    slug: 'fashion-apparel',
    level: 1,
    priority: 2,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&q=80',
    created_at: '2024-11-02T00:00:00Z',
    updated_at: '2024-11-02T00:00:00Z',
    children: [
      {
        category_id: 'cat_02_01',
        parent_id: 'dept_02',
        name: "Women's Fashion",
        slug: 'womens-fashion',
        level: 2,
        priority: 1,
        is_featured: true,
        image_url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=450&fit=crop&q=80',
        created_at: '2024-11-02T00:00:00Z',
        updated_at: '2024-11-02T00:00:00Z',
        children: [
          {
            category_id: 'sub_02_01_01',
            parent_id: 'cat_02_01',
            name: 'Dresses & Abayas',
            slug: 'dresses-abayas',
            level: 3,
            priority: 1,
            is_featured: true,
            image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop&q=80',
            created_at: '2024-11-02T00:00:00Z',
            updated_at: '2024-11-02T00:00:00Z',
            children: [
              {
                category_id: 'leaf_02_01_01_01',
                parent_id: 'sub_02_01_01',
                name: 'Modern Abayas',
                slug: 'modern-abayas',
                level: 4,
                priority: 1,
                is_featured: false,
                image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=300&fit=crop&q=80',
                created_at: '2024-11-02T00:00:00Z',
                updated_at: '2024-11-02T00:00:00Z',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    category_id: 'dept_03',
    parent_id: null,
    name: 'Home & Appliances',
    slug: 'home-appliances',
    level: 1,
    priority: 3,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
    created_at: '2024-11-02T00:00:00Z',
    updated_at: '2024-11-02T00:00:00Z',
    children: [],
  },
  {
    category_id: 'dept_04',
    parent_id: null,
    name: 'Beauty & Personal Care',
    slug: 'beauty-personal-care',
    level: 1,
    priority: 4,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop&q=80',
    created_at: '2024-11-02T00:00:00Z',
    updated_at: '2024-11-02T00:00:00Z',
    children: [],
  },
  {
    category_id: 'dept_05',
    parent_id: null,
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    level: 1,
    priority: 5,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
    created_at: '2024-11-02T00:00:00Z',
    updated_at: '2024-11-02T00:00:00Z',
    children: [],
  },
];

export default departments;

