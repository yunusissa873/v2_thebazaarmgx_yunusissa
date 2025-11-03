// Auto-generated users data
export interface User {
  user_id: string;
  email: string;
  full_name: string;
  phone: string;
  profile_image_url: string;
  address: {
    street: string;
    city: string;
    county: string;
    postal_code: string;
    country: string;
  };
  default_shipping_address_id: string;
  default_billing_address_id: string;
  preferred_payment_method: string;
  role: 'customer' | 'vendor' | 'admin';
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const users: User[] = [
  {
    user_id: 'usr_001',
    email: 'john.mutua@example.com',
    full_name: 'John Mutua',
    phone: '+254712345678',
    profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
    address: {
      street: '456 Moi Avenue',
      city: 'Nairobi',
      county: 'Nairobi',
      postal_code: '00100',
      country: 'Kenya',
    },
    default_shipping_address_id: 'addr_001',
    default_billing_address_id: 'addr_001',
    preferred_payment_method: 'mpesa',
    role: 'customer',
    email_verified: true,
    phone_verified: true,
    is_active: true,
    created_at: '2023-05-15T10:30:00Z',
    updated_at: '2024-10-20T14:00:00Z',
  },
  {
    user_id: 'usr_002',
    email: 'sarah.ochieng@example.com',
    full_name: 'Sarah Ochieng',
    phone: '+254723456789',
    profile_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
    address: {
      street: '789 Kenyatta Avenue',
      city: 'Nairobi',
      county: 'Nairobi',
      postal_code: '00100',
      country: 'Kenya',
    },
    default_shipping_address_id: 'addr_002',
    default_billing_address_id: 'addr_002',
    preferred_payment_method: 'paystack',
    role: 'customer',
    email_verified: true,
    phone_verified: true,
    is_active: true,
    created_at: '2023-08-20T11:00:00Z',
    updated_at: '2024-10-18T09:30:00Z',
  },
];

export default users;

