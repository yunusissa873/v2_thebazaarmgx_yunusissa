@startuml The_Bazaar_ERD

!define PRIMARY_KEY(x) <b><color:red>x</color></b>
!define FOREIGN_KEY(x) <color:blue>x</color>

entity "profiles" {
  PRIMARY_KEY(id) : UUID
  email : TEXT
  full_name : TEXT
  phone : TEXT
  avatar_url : TEXT
  role : user_role
  is_verified : BOOLEAN
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "vendors" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(profile_id) : UUID
  business_name : TEXT
  slug : TEXT
  description : TEXT
  logo_url : TEXT
  banner_url : TEXT
  business_type : TEXT
  business_registration_number : TEXT
  tax_id : TEXT
  phone : TEXT
  email : TEXT
  website : TEXT
  address : TEXT
  city : TEXT
  country : TEXT
  postal_code : TEXT
  latitude : DECIMAL
  longitude : DECIMAL
  rating : DECIMAL
  total_reviews : INTEGER
  is_verified : BOOLEAN
  is_mega_brand : BOOLEAN
  kyc_status : TEXT
  kyc_documents : JSONB
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "vendor_subscriptions" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(vendor_id) : UUID
  tier : subscription_tier
  status : TEXT
  sku_limit : INTEGER
  current_sku_count : INTEGER
  monthly_fee : DECIMAL
  currency : currency
  features : JSONB
  branch_count : INTEGER
  branch_discount_percentage : DECIMAL
  start_date : TIMESTAMPTZ
  end_date : TIMESTAMPTZ
  auto_renew : BOOLEAN
  payment_method : payment_method
  last_payment_date : TIMESTAMPTZ
  next_payment_date : TIMESTAMPTZ
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "products" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(vendor_id) : UUID
  FOREIGN_KEY(category_id) : UUID
  name : TEXT
  slug : TEXT
  description : TEXT
  short_description : TEXT
  images : JSONB
  price : DECIMAL
  compare_at_price : DECIMAL
  currency : currency
  sku : TEXT
  barcode : TEXT
  stock_quantity : INTEGER
  low_stock_threshold : INTEGER
  is_active : BOOLEAN
  is_featured : BOOLEAN
  weight : DECIMAL
  dimensions : JSONB
  tags : TEXT[]
  meta_title : TEXT
  meta_description : TEXT
  view_count : INTEGER
  rating : DECIMAL
  review_count : INTEGER
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "categories" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(parent_id) : UUID
  name : TEXT
  slug : TEXT
  description : TEXT
  image_url : TEXT
  level : INTEGER
  sort_order : INTEGER
  is_active : BOOLEAN
  path_slug : TEXT
  seo_title : TEXT
  seo_description : TEXT
  meta_keywords : TEXT[]
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "orders" {
  PRIMARY_KEY(id) : UUID
  order_number : TEXT
  FOREIGN_KEY(buyer_id) : UUID
  FOREIGN_KEY(vendor_id) : UUID
  status : order_status
  subtotal : DECIMAL
  tax : DECIMAL
  shipping_cost : DECIMAL
  discount : DECIMAL
  total : DECIMAL
  currency : currency
  shipping_address : JSONB
  billing_address : JSONB
  notes : TEXT
  tracking_number : TEXT
  shipped_at : TIMESTAMPTZ
  delivered_at : TIMESTAMPTZ
  cancelled_at : TIMESTAMPTZ
  cancellation_reason : TEXT
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "order_items" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(order_id) : UUID
  FOREIGN_KEY(product_id) : UUID
  FOREIGN_KEY(variant_id) : UUID
  product_name : TEXT
  variant_name : TEXT
  quantity : INTEGER
  unit_price : DECIMAL
  subtotal : DECIMAL
  tax : DECIMAL
  total : DECIMAL
  created_at : TIMESTAMPTZ
}

entity "payments" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(order_id) : UUID
  FOREIGN_KEY(subscription_id) : UUID
  payment_type : TEXT
  amount : DECIMAL
  currency : currency
  status : payment_status
  payment_method : payment_method
  provider_transaction_id : TEXT
  provider_response : JSONB
  metadata : JSONB
  paid_at : TIMESTAMPTZ
  refunded_at : TIMESTAMPTZ
  refund_amount : DECIMAL
  refund_reason : TEXT
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "reviews" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(product_id) : UUID
  FOREIGN_KEY(buyer_id) : UUID
  FOREIGN_KEY(order_id) : UUID
  rating : INTEGER
  title : TEXT
  comment : TEXT
  images : JSONB
  is_verified_purchase : BOOLEAN
  helpful_count : INTEGER
  is_approved : BOOLEAN
  vendor_response : TEXT
  vendor_response_at : TIMESTAMPTZ
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "cart_items" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(buyer_id) : UUID
  FOREIGN_KEY(product_id) : UUID
  FOREIGN_KEY(variant_id) : UUID
  quantity : INTEGER
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "wishlists" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(buyer_id) : UUID
  FOREIGN_KEY(product_id) : UUID
  created_at : TIMESTAMPTZ
}

entity "chats" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(buyer_id) : UUID
  FOREIGN_KEY(vendor_id) : UUID
  last_message : TEXT
  last_message_at : TIMESTAMPTZ
  unread_count_buyer : INTEGER
  unread_count_vendor : INTEGER
  is_active : BOOLEAN
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "messages" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(chat_id) : UUID
  FOREIGN_KEY(sender_id) : UUID
  content : TEXT
  translated_content : JSONB
  message_type : TEXT
  media_url : TEXT
  is_read : BOOLEAN
  read_at : TIMESTAMPTZ
  created_at : TIMESTAMPTZ
}

entity "vendor_wallets" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(vendor_id) : UUID
  balance : DECIMAL
  currency : currency
  pending_payouts : DECIMAL
  total_earnings : DECIMAL
  total_payouts : DECIMAL
  last_payout_at : TIMESTAMPTZ
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "escrow_accounts" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(order_id) : UUID
  amount : DECIMAL
  currency : currency
  status : TEXT
  held_until : TIMESTAMPTZ
  released_at : TIMESTAMPTZ
  created_at : TIMESTAMPTZ
  updated_at : TIMESTAMPTZ
}

entity "audit_log" {
  PRIMARY_KEY(id) : UUID
  FOREIGN_KEY(profile_id) : UUID
  FOREIGN_KEY(admin_id) : UUID
  action : TEXT
  resource_type : TEXT
  resource_id : UUID
  changes : JSONB
  ip_address : INET
  user_agent : TEXT
  created_at : TIMESTAMPTZ
}

profiles ||--o{ vendors : "has"
profiles ||--o{ orders : "places"
profiles ||--o{ reviews : "writes"
profiles ||--o{ cart_items : "has"
profiles ||--o{ wishlists : "has"
profiles ||--o{ chats : "participates (buyer)"
profiles ||--o{ messages : "sends"

vendors ||--o{ vendor_subscriptions : "has"
vendors ||--o{ products : "sells"
vendors ||--o{ orders : "receives"
vendors ||--o{ chats : "participates (vendor)"
vendors ||--|| vendor_wallets : "has"

categories ||--o{ categories : "parent-child"
categories ||--o{ products : "categorizes"

products ||--o{ product_variants : "has"
products ||--o{ order_items : "ordered as"
products ||--o{ reviews : "reviewed"
products ||--o{ cart_items : "in cart"
products ||--o{ wishlists : "wishlisted"

orders ||--o{ order_items : "contains"
orders ||--o{ payments : "paid by"
orders ||--|| escrow_accounts : "has"

vendor_subscriptions ||--o{ payments : "paid by"

chats ||--o{ messages : "contains"

@enduml

