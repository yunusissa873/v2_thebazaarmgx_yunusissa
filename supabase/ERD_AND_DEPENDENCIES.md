# The Bazaar - ERD and Table Dependencies

## 📊 Entity Relationship Diagram

### Table Dependency Order (Execution Order)

Tables must be created in this order to satisfy foreign key constraints:

1. **profiles** - Base user accounts (no dependencies)
2. **vendors** - References profiles
3. **vendor_subscriptions** - References vendors
4. **vendor_staff** - References vendors, profiles
5. **admin_staff** - References profiles
6. **categories** - Self-referencing (parent_id)
7. **category_attributes** - References categories
8. **category_attribute_values** - References category_attributes
9. **brands** - References vendors (optional)
10. **products** - References vendors, categories, brands
11. **product_variants** - References products
12. **price_history** - References products, product_variants, profiles
13. **orders** - References profiles (buyer), vendors
14. **order_items** - References orders, products, product_variants, vendors
15. **reviews** - References products, profiles, vendors, orders
16. **chat_threads** - References profiles, vendors
17. **chat_messages** - References chat_threads, profiles
18. **vendor_wallets** - References vendors
19. **vendor_payout_requests** - References vendors, profiles
20. **vendor_payout_transactions** - References vendor_payout_requests, vendors, profiles
21. **vendor_statement_entries** - References vendors, vendor_payout_transactions
22. **audit_logs** - References profiles
23. **system_settings** - No dependencies

## 🌳 Dependency Tree (ASCII)

```
profiles (base)
 ├─ vendors
 │   ├─ vendor_subscriptions
 │   ├─ vendor_staff (also refs profiles)
 │   ├─ brands
 │   ├─ products (also refs categories, brands)
 │   │   ├─ product_variants
 │   │   ├─ price_history (also refs profiles)
 │   │   └─ reviews (also refs profiles, orders)
 │   ├─ orders (also refs profiles as buyer)
 │   │   └─ order_items (also refs products, product_variants)
 │   ├─ vendor_wallets
 │   ├─ vendor_payout_requests (also refs profiles)
 │   ├─ vendor_payout_transactions (also refs vendor_payout_requests, profiles)
 │   ├─ vendor_statement_entries (also refs vendor_payout_transactions)
 │   └─ chat_threads (also refs profiles)
 │       └─ chat_messages (also refs profiles)
 ├─ admin_staff
 └─ audit_logs

categories (self-referencing)
 ├─ category_attributes
 │   └─ category_attribute_values
 └─ products (also refs vendors, brands)

system_settings (independent)
```

## 🔗 Relationship Details

### One-to-One Relationships

| Parent Table | Child Table | Relationship |
|--------------|-------------|--------------|
| vendors | vendor_wallets | One vendor has one wallet |

### One-to-Many Relationships

| Parent Table | Child Table | Foreign Key | Description |
|--------------|-------------|-------------|-------------|
| profiles | vendors | profile_id | One user can own multiple vendors |
| profiles | orders | buyer_id | One user can place multiple orders |
| profiles | reviews | buyer_id | One user can write multiple reviews |
| profiles | admin_staff | profile_id | One user can be admin |
| profiles | vendor_staff | profile_id | One user can be staff at multiple vendors |
| vendors | products | vendor_id | One vendor has many products |
| vendors | orders | vendor_id | One vendor receives many orders |
| vendors | vendor_payout_requests | vendor_id | One vendor makes many payout requests |
| vendors | vendor_staff | vendor_id | One vendor has many staff members |
| categories | categories | parent_id | Self-referencing hierarchy |
| categories | products | category_id | One category contains many products |
| categories | category_attributes | category_id | One category has many attributes |
| category_attributes | category_attribute_values | attribute_id | One attribute has many values |
| products | product_variants | product_id | One product has many variants |
| products | reviews | product_id | One product has many reviews |
| products | price_history | product_id | One product has price history |
| products | order_items | product_id | One product appears in many orders |
| orders | order_items | order_id | One order has many items |
| chat_threads | chat_messages | thread_id | One thread has many messages |

### Many-to-Many Relationships (via Junction Tables)

| Table 1 | Junction Table | Table 2 | Description |
|---------|----------------|---------|-------------|
| vendors | vendor_staff | profiles | Vendors have multiple staff, staff can work for multiple vendors |
| products | order_items | orders | Products appear in multiple orders, orders contain multiple products |

## 📋 DBML (Database Markup Language)

Paste this into [dbdiagram.io](https://dbdiagram.io) to visualize:

```dbml
// ============================================================
// THE BAZAAR - Database Schema (DBML)
// Paste into dbdiagram.io for visual ERD
// ============================================================

Table profiles {
  id uuid [pk]
  email text [unique, not null]
  full_name text
  phone text
  avatar_url text
  role text [note: 'buyer, vendor, admin, super_admin']
  is_verified boolean [default: false]
  metadata jsonb
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table vendors {
  id uuid [pk]
  profile_id uuid [ref: > profiles.id]
  business_name text [not null]
  slug text [unique, not null]
  description text
  logo_url text
  banner_url text
  business_type text
  tax_id text
  phone text
  email text
  address text
  city text
  country text [default: 'Kenya']
  latitude numeric
  longitude numeric
  rating numeric [default: 0]
  total_reviews integer [default: 0]
  status text [note: 'pending, active, suspended, rejected, inactive']
  is_verified boolean [default: false]
  is_mega_brand boolean [default: false]
  kyc_status text [default: 'pending']
  kyc_documents jsonb
  settings jsonb
  payout_preferences jsonb
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table vendor_subscriptions {
  id uuid [pk]
  vendor_id uuid [ref: > vendors.id]
  tier text [note: 'basic, bronze, silver, gold, platinum']
  status text [default: 'active']
  sku_limit integer [not null]
  monthly_fee numeric [not null]
  currency text [default: 'KES']
  features jsonb
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table vendor_staff {
  id uuid [pk]
  vendor_id uuid [ref: > vendors.id]
  profile_id uuid [ref: > profiles.id]
  role text [note: 'owner, manager, staff, viewer']
  permissions jsonb
  is_active boolean [default: true]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  indexes {
    (vendor_id, profile_id) [unique]
  }
}

Table admin_staff {
  id uuid [pk]
  profile_id uuid [unique, ref: > profiles.id]
  role text [note: 'super_admin, manager, staff, viewer']
  permissions jsonb
  is_super_admin boolean [default: false]
  is_active boolean [default: true]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table categories {
  id uuid [pk]
  parent_id uuid [ref: > categories.id]
  name text [not null]
  slug text [not null, unique]
  description text
  image_url text
  level integer [note: '1-5']
  path_slug text
  full_slug text
  ancestry uuid[]
  depth integer [default: 0]
  sort_order integer [default: 0]
  seo_title text
  meta_title text
  seo_description text
  meta_description text
  meta_keywords text[]
  search_tags text[]
  is_active boolean [default: true]
  is_featured boolean [default: false]
  is_leaf boolean [default: false]
  total_products integer [default: 0]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table category_attributes {
  id uuid [pk]
  category_id uuid [ref: > categories.id]
  name text [not null]
  label text
  data_type text [note: 'string, number, boolean, array']
  display_type text [note: 'text, select, multiselect, range, checkbox, color, number']
  unit text
  canonical boolean [default: false]
  required boolean [default: false]
  is_filterable boolean [default: true]
  is_searchable boolean [default: false]
  is_variant boolean [default: false]
  options jsonb
  position integer [default: 0]
  is_active boolean [default: true]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  indexes {
    (category_id, name) [unique]
  }
}

Table category_attribute_values {
  id uuid [pk]
  attribute_id uuid [ref: > category_attributes.id]
  value text [not null]
  display_value text
  color_hex text
  image_url text
  sort_order integer [default: 0]
  is_active boolean [default: true]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  indexes {
    (attribute_id, value) [unique]
  }
}

Table brands {
  id uuid [pk]
  vendor_id uuid [ref: > vendors.id]
  name text [not null]
  slug text [unique, not null]
  logo_url text
  description text
  website text
  seo_title text
  seo_description text
  meta_keywords text[]
  is_active boolean [default: true]
  is_verified boolean [default: false]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table products {
  id uuid [pk]
  vendor_id uuid [ref: > vendors.id]
  category_id uuid [ref: > categories.id]
  brand_id uuid [ref: > brands.id]
  name text [not null]
  slug text [unique, not null]
  vendor_sku text
  description text
  short_description text
  images jsonb
  price numeric [not null]
  compare_at_price numeric
  currency text [default: 'KES']
  sku text
  barcode text
  stock_quantity integer [default: 0]
  low_stock_threshold integer [default: 3]
  attributes jsonb
  path_slug text
  seo_title text
  meta_title text
  seo_description text
  search_keywords text[]
  tags text[]
  is_active boolean [default: true]
  is_featured boolean [default: false]
  rating numeric [default: 0]
  review_count integer [default: 0]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  indexes {
    (vendor_id, slug) [unique]
    (vendor_id, vendor_sku) [unique]
  }
}

Table product_variants {
  id uuid [pk]
  product_id uuid [ref: > products.id]
  name text [not null]
  sku text
  price numeric
  compare_at_price numeric
  stock_quantity integer [default: 0]
  attributes jsonb
  image_url text
  is_active boolean [default: true]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  indexes {
    (product_id, sku) [unique]
  }
}

Table price_history {
  id uuid [pk]
  product_id uuid [ref: > products.id]
  variant_id uuid [ref: > product_variants.id]
  old_price numeric
  new_price numeric [not null]
  currency text [default: 'KES']
  change_reason text
  changed_by uuid [ref: > profiles.id]
  effective_date timestamptz [default: `now()`]
  created_at timestamptz [default: `now()`]
}

Table orders {
  id uuid [pk]
  order_number text [unique, not null]
  buyer_id uuid [ref: > profiles.id]
  vendor_id uuid [ref: > vendors.id]
  subtotal numeric [not null]
  tax_amount numeric [default: 0]
  shipping_fee numeric [default: 0]
  discount_amount numeric [default: 0]
  total numeric [not null]
  total_amount numeric [not null]
  currency text [default: 'KES']
  status text [note: 'pending, confirmed, processing, shipped, delivered, completed, cancelled, refunded']
  payment_status text [note: 'pending, completed, failed, refunded, cancelled']
  fulfillment_status text [default: 'unfulfilled']
  shipping_address jsonb
  billing_address jsonb
  payment_info jsonb
  payment_method text
  tracking_number text
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table order_items {
  id uuid [pk]
  order_id uuid [ref: > orders.id]
  product_id uuid [ref: > products.id]
  variant_id uuid [ref: > product_variants.id]
  vendor_id uuid [ref: > vendors.id]
  product_name text [not null]
  product_sku text
  variant_name text
  quantity integer [not null]
  unit_price numeric [not null]
  total_price numeric [not null]
  tax_amount numeric [default: 0]
  attributes jsonb
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table reviews {
  id uuid [pk]
  product_id uuid [ref: > products.id]
  buyer_id uuid [ref: > profiles.id]
  vendor_id uuid [ref: > vendors.id]
  order_id uuid
  rating integer [note: '1-5']
  title text
  content text
  images jsonb
  is_verified_purchase boolean [default: false]
  is_approved boolean [default: false]
  helpful_count integer [default: 0]
  vendor_response text
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
  
  indexes {
    (product_id, buyer_id, order_id) [unique]
  }
}

Table chat_threads {
  id uuid [pk]
  buyer_id uuid [ref: > profiles.id]
  vendor_id uuid [ref: > vendors.id]
  last_message text
  last_timestamp timestamptz
  is_active boolean [default: true]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table chat_messages {
  id uuid [pk]
  thread_id uuid [ref: > chat_threads.id]
  sender_id uuid [ref: > profiles.id]
  message text [not null]
  attachments jsonb
  is_read boolean [default: false]
  created_at timestamptz [default: `now()`]
}

Table vendor_wallets {
  vendor_id uuid [pk, ref: - vendors.id]
  balance numeric [default: 0]
  pending_balance numeric [default: 0]
  reserved_balance numeric [default: 0]
  total_earned numeric [default: 0]
  total_paid_out numeric [default: 0]
  currency text [default: 'KES']
  updated_at timestamptz [default: `now()`]
}

Table vendor_payout_requests {
  id uuid [pk]
  vendor_id uuid [ref: > vendors.id]
  amount numeric [not null]
  currency text [default: 'KES']
  status text [note: 'pending, processing, completed, failed, cancelled']
  payout_method text
  details jsonb
  processed_by uuid [ref: > profiles.id]
  processed_at timestamptz
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}

Table vendor_payout_transactions {
  id uuid [pk]
  payout_request_id uuid [ref: > vendor_payout_requests.id]
  vendor_id uuid [ref: > vendors.id]
  amount numeric [not null]
  fee numeric [default: 0]
  net_amount numeric [not null]
  currency text [default: 'KES']
  payment_method text
  transaction_reference text
  status text [default: 'completed']
  processed_by uuid [ref: > profiles.id]
  completed_at timestamptz [default: `now()`]
  created_at timestamptz [default: `now()`]
}

Table vendor_statement_entries {
  id uuid [pk]
  vendor_id uuid [ref: > vendors.id]
  entry_type text [note: 'sale, refund, payout, fee, adjustment']
  order_id uuid
  payout_id uuid [ref: > vendor_payout_transactions.id]
  amount numeric [not null]
  balance_after numeric [not null]
  currency text [default: 'KES']
  description text
  created_at timestamptz [default: `now()`]
}

Table audit_logs {
  id uuid [pk]
  resource_type text [not null]
  resource_id uuid [not null]
  action text [not null]
  actor_id uuid [ref: > profiles.id]
  actor_role text
  changes jsonb
  ip_address text
  user_agent text
  created_at timestamptz [default: `now()`]
}

Table system_settings {
  id uuid [pk]
  key text [unique, not null]
  value jsonb [not null]
  description text
  is_public boolean [default: false]
  created_at timestamptz [default: `now()`]
  updated_at timestamptz [default: `now()`]
}
```

## 🔑 Key Relationships Summary

### Core User Flow
1. **User** (profiles) → **Vendor** (vendors) → **Products** (products)
2. **User** (profiles) → **Order** (orders) → **Order Items** (order_items) → **Products**
3. **User** (profiles) → **Review** (reviews) → **Product** (products)

### Vendor Financial Flow
1. **Order** (paid) → **Vendor Wallet** (balance increases)
2. **Vendor** → **Payout Request** → **Payout Transaction**
3. **Statement Entries** track all financial movements

### Category Hierarchy
1. **Category** (Level 1) → **Category** (Level 2) → ... → **Category** (Level 5)
2. **Category** → **Category Attributes** → **Category Attribute Values**
3. **Product** → uses **Category Attributes** in `attributes` JSONB

## 📊 Cardinality Summary

| Relationship | Type | Example |
|--------------|------|---------|
| profiles → vendors | 1:N | One user can own multiple vendor accounts |
| vendors → products | 1:N | One vendor sells many products |
| products → product_variants | 1:N | One product has many variants |
| categories → categories | 1:N | One category has many subcategories |
| orders → order_items | 1:N | One order contains many items |
| vendors → vendor_wallets | 1:1 | One vendor has one wallet |
| products → reviews | 1:N | One product has many reviews |
| chat_threads → chat_messages | 1:N | One thread has many messages |

---

**Generated**: November 21, 2025  
**Version**: 2.0  
**Database**: PostgreSQL 15 (Supabase)
