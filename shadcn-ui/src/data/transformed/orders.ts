// Auto-generated orders data
export interface OrderItem {
  item_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image_url: string;
}

export interface OrderAddress {
  full_name: string;
  street: string;
  city: string;
  county: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface Order {
  order_id: string;
  user_id: string;
  vendor_id: string;
  order_number: string;
  order_date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total_amount: number;
  currency: string;
  items: OrderItem[];
  shipping_address: OrderAddress;
  billing_address: OrderAddress;
  tracking_number: string | null;
  estimated_delivery: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

const orders: Order[] = [
  {
    order_id: 'ord_001',
    user_id: 'usr_001',
    vendor_id: 'vnd_001',
    order_number: 'BAZ-2024-001234',
    order_date: '2024-10-15T10:30:00Z',
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'mpesa',
    subtotal: 185000,
    tax: 27750,
    shipping_cost: 500,
    discount: 0,
    total_amount: 213250,
    currency: 'KES',
    items: [
      {
        item_id: 'item_001',
        product_id: 'prd_001',
        variant_id: 'var_002',
        product_name: 'Samsung Galaxy S25 Ultra',
        variant_name: '256GB / Titanium Gray',
        quantity: 1,
        unit_price: 185000,
        total_price: 185000,
        image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop&q=80',
      },
    ],
    shipping_address: {
      full_name: 'John Mutua',
      street: '456 Moi Avenue',
      city: 'Nairobi',
      county: 'Nairobi',
      postal_code: '00100',
      country: 'Kenya',
      phone: '+254712345678',
    },
    billing_address: {
      full_name: 'John Mutua',
      street: '456 Moi Avenue',
      city: 'Nairobi',
      county: 'Nairobi',
      postal_code: '00100',
      country: 'Kenya',
      phone: '+254712345678',
    },
    tracking_number: 'KE1234567890',
    estimated_delivery: '2024-10-18T17:00:00Z',
    delivered_at: '2024-10-17T14:30:00Z',
    created_at: '2024-10-15T10:30:00Z',
    updated_at: '2024-10-17T14:30:00Z',
  },
];

export default orders;

