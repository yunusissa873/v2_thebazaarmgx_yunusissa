// Auto-generated product reviews data
export interface ProductReview {
  review_id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  user_image_url: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  is_helpful: number;
  is_not_helpful: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

const reviews: ProductReview[] = [
  {
    review_id: 'rev_001',
    product_id: 'prd_001',
    user_id: 'usr_001',
    user_name: 'John Mutua',
    user_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80',
    rating: 5,
    title: 'Excellent phone, highly recommend!',
    comment: 'This is an amazing phone! The camera quality is outstanding, and the performance is top-notch. Battery life lasts all day even with heavy use. Worth every shilling!',
    is_verified_purchase: true,
    is_helpful: 12,
    is_not_helpful: 0,
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&q=80'],
    created_at: '2024-10-18T14:30:00Z',
    updated_at: '2024-10-18T14:30:00Z',
  },
  {
    review_id: 'rev_002',
    product_id: 'prd_001',
    user_id: 'usr_004',
    user_name: 'Mary Wanjiku',
    user_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80',
    rating: 4,
    title: 'Great phone, minor issues',
    comment: 'Overall a great phone. The screen is fantastic and the camera is impressive. My only complaint is that it\'s quite large and can be hard to use with one hand. But the performance is excellent!',
    is_verified_purchase: true,
    is_helpful: 8,
    is_not_helpful: 2,
    images: [],
    created_at: '2024-10-20T10:15:00Z',
    updated_at: '2024-10-20T10:15:00Z',
  },
];

export default reviews;

