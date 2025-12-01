# Database Schema & Data Models (ERD)
## The Bazaar Marketplace Platform

**Version:** 1.0.0  
**Date:** January 2025  
**Status:** Authoritative  
**Owner:** Data Engineering Team

---

## 1. Database Overview

### 1.1 Database Technology
- **Database System:** PostgreSQL 15+
- **Hosting:** Supabase (Managed PostgreSQL)
- **Extensions:** uuid-ossp, pgcrypto
- **Total Tables:** 28 core tables
- **Security:** Row Level Security (RLS) enabled on all tables

### 1.2 Database Design Principles
- **Normalization:** 3NF (Third Normal Form) where applicable
- **Flexibility:** JSONB columns for extensible data
- **Performance:** Strategic indexing on frequently queried columns
- **Security:** Row Level Security policies for data access control
- **Auditability:** Timestamps and audit logs for compliance

### 1.3 Naming Conventions
- **Tables:** Plural, snake_case (e.g., `vendor_subscriptions`)
- **Columns:** snake_case (e.g., `created_at`)
- **Indexes:** `idx_{table}_{column(s)}`
- **Foreign Keys:** `{table}_id` (e.g., `vendor_id`)
- **Enums:** snake_case (e.g., `order_status`)

---

## 2. Entity Relationship Diagram (ERD)

### 2.1 Visual ERD Location
The visual ERD diagram is available in PlantUML format at:
- `authoritative_docs/database/erd_diagram.plantuml`

### 2.2 Core Entity Relationships

**User & Vendor Hierarchy:**
- `profiles` (1) → (N) `vendors` (one profile can have one vendor account)
- `vendors` (1) → (N) `vendor_subscriptions` (vendor has subscription)
- `vendors` (1) → (N) `products` (vendor sells products)
- `vendors` (1) → (1) `vendor_wallets` (vendor has wallet)

**Product Hierarchy:**
- `categories` (1) → (N) `categories` (parent-child hierarchy, 4 levels)
- `categories` (1) → (N) `products` (category contains products)
- `products` (1) → (N) `product_variants` (product has variants)

**Order Flow:**
- `profiles` (1) → (N) `orders` (buyer places orders)
- `vendors` (1) → (N) `orders` (vendor receives orders)
- `orders` (1) → (N) `order_items` (order contains items)
- `orders` (1) → (N) `payments` (order paid by payments)
- `orders` (1) → (1) `escrow_accounts` (order has escrow)

**Shopping Experience:**
- `profiles` (1) → (N) `cart_items` (buyer has cart)
- `profiles` (1) → (N) `wishlists` (buyer has wishlist)
- `profiles` (1) → (N) `reviews` (buyer writes reviews)

**Communication:**
- `profiles` (1) → (N) `chats` (buyer participates)
- `vendors` (1) → (N) `chats` (vendor participates)
- `chats` (1) → (N) `messages` (chat contains messages)

---

## 3. Table Definitions

### 3.1 User & Authentication Tables

#### profiles
**Purpose:** User accounts for all platform users (buyers, vendors, admins)

**Key Columns:**
- `id`: UUID, references Supabase Auth users
- `role`: Enum ('buyer', 'vendor', 'admin')
- `is_verified`: Email verification status

**Indexes:**
- `idx_profiles_role` ON `role`
- `idx_profiles_email` ON `email`

**RLS Policies:**
- Public profiles are viewable by everyone
- Users can update own profile
- Admins can do anything with profiles

---

#### vendors
**Purpose:** Vendor business information and verification

**Key Columns:**
- `profile_id`: Links to user profile
- `slug`: URL-friendly identifier
- `kyc_status`: KYC verification status ('pending', 'verified', 'rejected')
- `kyc_documents`: JSONB storing uploaded documents

**Indexes:**
- `idx_vendors_slug` ON `slug`
- `idx_vendors_profile_id` ON `profile_id`
- `idx_vendors_is_verified` ON `is_verified`
- `idx_vendors_rating` ON `rating DESC`

**RLS Policies:**
- Vendors are viewable by everyone (if verified)
- Vendors can update own data
- Admins have full access

---

#### vendor_subscriptions
**Purpose:** Vendor subscription tiers and billing

**Key Columns:**
- `tier`: Enum ('basic', 'bronze', 'silver', 'gold', 'platinum')
- `status`: 'active', 'expired', 'cancelled', 'suspended'
- `sku_limit`: Maximum products allowed
- `features`: JSONB with tier-specific features

**Indexes:**
- `idx_vendor_subscriptions_vendor_id` ON `vendor_id`
- `idx_vendor_subscriptions_tier` ON `tier`
- `idx_vendor_subscriptions_status` ON `status`

---

#### vendor_staff
**Purpose:** Staff members with role-based access to vendor dashboard

**Key Columns:**
- `role`: Enum ('manager', 'staff', 'viewer')
- `permissions`: JSONB with granular permissions
- `is_active`: Staff account status

**Indexes:**
- `idx_vendor_staff_vendor_id` ON `vendor_id`
- `idx_vendor_staff_profile_id` ON `profile_id`

---

### 3.2 Product Catalog Tables

#### categories
**Purpose:** 4-level hierarchical category structure

**Key Columns:**
- `parent_id`: Self-referencing for hierarchy
- `level`: 1-4 (root to leaf)
- `path_slug`: Full hierarchical path (e.g., 'electronics/smartphones/iphone')
- `meta_keywords`: Array for SEO

**Indexes:**
- `idx_categories_slug` ON `slug`
- `idx_categories_parent_id` ON `parent_id`
- `idx_categories_level` ON `level`
- `idx_categories_path_slug` ON `path_slug`
- `idx_categories_meta_keywords` ON `meta_keywords` (GIN)

**Functions:**
- `generate_category_path_slug(category_id)`: Generates full path slug
- `populate_all_category_path_slugs()`: Batch update path slugs
- Trigger: `trigger_update_category_path_slug`: Auto-updates path_slug

---

#### products
**Purpose:** Product catalog with inventory and metadata

**Key Columns:**
- `images`: JSONB array of image URLs
- `dimensions`: JSONB with {length, width, height}
- `tags`: Array for search and filtering
- `rating`: Calculated average from reviews
- `view_count`: Analytics tracking

**Indexes:**
- `idx_products_vendor_id` ON `vendor_id`
- `idx_products_category_id` ON `category_id`
- `idx_products_slug` ON `slug`
- `idx_products_is_active` ON `is_active`
- `idx_products_is_featured` ON `is_featured`
- `idx_products_rating` ON `rating DESC`
- `idx_products_price` ON `price`
- `idx_products_created_at` ON `created_at DESC`

---

#### product_variants
**Purpose:** Product variations (size, color, etc.)

**Key Columns:**
- `attributes`: JSONB with variant attributes (e.g., {"size": "L", "color": "Red"})
- `price`: Overrides product price if set

**Indexes:**
- `idx_product_variants_product_id` ON `product_id`
- `idx_product_variants_sku` ON `sku`

---

### 3.3 Order & Payment Tables

#### orders
**Purpose:** Order management and tracking

**Key Columns:**
- `order_number`: Unique human-readable identifier
- `status`: Enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
- `shipping_address`: JSONB with address details
- `tracking_number`: Delivery tracking code

**Indexes:**
- `idx_orders_buyer_id` ON `buyer_id`
- `idx_orders_vendor_id` ON `vendor_id`
- `idx_orders_status` ON `status`
- `idx_orders_order_number` ON `order_number`
- `idx_orders_created_at` ON `created_at DESC`

---

#### order_items
**Purpose:** Individual line items in orders

**Key Columns:**
- `product_name`, `variant_name`: Snapshot at time of order
- `unit_price`: Price at time of order (immutable)

**Indexes:**
- `idx_order_items_order_id` ON `order_id`
- `idx_order_items_product_id` ON `product_id`

---

#### payments
**Purpose:** Payment records and transaction history

**Key Columns:**
- `payment_type`: 'order' or 'subscription'
- `status`: Enum ('pending', 'completed', 'failed', 'refunded')
- `payment_method`: Enum ('paystack', 'stripe', 'mpesa', 'card', 'paypal')
- `provider_transaction_id`: Gateway transaction ID
- `provider_response`: JSONB with full gateway response

**Indexes:**
- `idx_payments_order_id` ON `order_id`
- `idx_payments_subscription_id` ON `subscription_id`
- `idx_payments_status` ON `status`
- `idx_payments_payment_method` ON `payment_method`
- `idx_payments_created_at` ON `created_at DESC`

---

### 3.4 Shopping Experience Tables

#### cart_items
**Purpose:** Shopping cart items

**Key Columns:**
- Unique constraint prevents duplicate cart entries

**Indexes:**
- `idx_cart_items_buyer_id` ON `buyer_id`
- `idx_cart_items_product_id` ON `product_id`

---

#### wishlists
**Purpose:** User wishlists

**Indexes:**
- `idx_wishlists_buyer_id` ON `buyer_id`
- `idx_wishlists_product_id` ON `product_id`

---

#### reviews
**Purpose:** Product reviews and ratings

**Key Columns:**
- `is_verified_purchase`: Linked to order
- `helpful_count`: User voting on review helpfulness
- `vendor_response`: Vendor reply to review

**Indexes:**
- `idx_reviews_product_id` ON `product_id`
- `idx_reviews_buyer_id` ON `buyer_id`
- `idx_reviews_rating` ON `rating`
- `idx_reviews_created_at` ON `created_at DESC`

---

### 3.5 Communication Tables

#### chats
**Purpose:** Chat conversations between buyers and vendors

**Key Columns:**
- `unread_count_buyer`, `unread_count_vendor`: Unread message counters

**Indexes:**
- `idx_chats_buyer_id` ON `buyer_id`
- `idx_chats_vendor_id` ON `vendor_id`
- `idx_chats_last_message_at` ON `last_message_at DESC`

---

#### messages
**Purpose:** Individual chat messages

**Key Columns:**
- `translated_content`: JSONB with translations (e.g., {"en": "...", "sw": "..."})
- `message_type`: Supports text, images, files, voice

**Indexes:**
- `idx_messages_chat_id` ON `chat_id`
- `idx_messages_sender_id` ON `sender_id`
- `idx_messages_created_at` ON `created_at DESC`

---

### 3.6 Financial Tables

#### vendor_wallets
**Purpose:** Vendor earnings and payout tracking

**Key Columns:**
- `balance`: Available balance for payout
- `pending_payouts`: Funds in escrow
- `total_earnings`: Lifetime earnings
- `total_payouts`: Lifetime payouts

**Indexes:**
- `idx_vendor_wallets_vendor_id` ON `vendor_id`

---

#### escrow_accounts
**Purpose:** Escrow management for order payments

**Key Columns:**
- `status`: Escrow lifecycle status
- `held_until`: Auto-release timestamp

**Indexes:**
- `idx_escrow_accounts_order_id` ON `order_id`
- `idx_escrow_accounts_status` ON `status`

---

### 3.7 Admin & System Tables

#### audit_log
**Purpose:** Admin action logging for compliance

**Key Columns:**
- `action`: Action performed (e.g., 'vendor_verified', 'order_cancelled')
- `resource_type`: Type of resource ('vendor', 'user', 'product', 'order')
- `changes`: JSONB with before/after values
- `ip_address`, `user_agent`: Security tracking

**Indexes:**
- `idx_audit_log_profile_id` ON `profile_id`
- `idx_audit_log_admin_id` ON `admin_id`
- `idx_audit_log_action` ON `action`
- `idx_audit_log_resource_type` ON `resource_type`
- `idx_audit_log_created_at` ON `created_at DESC`

**RLS Policies:**
- Immutable (no updates/deletes)
- Admin-only read access

---

#### admin_permissions
**Purpose:** Granular RBAC for admin users

**Key Columns:**
- `permission`: Permission name (e.g., 'vendor.verify', 'order.cancel')
- `resource_type`: Resource scope (e.g., 'vendor', 'order', 'all')

**Indexes:**
- `idx_admin_permissions_admin_id` ON `admin_id`
- `idx_admin_permissions_permission` ON `permission`

---

#### system_settings
**Purpose:** Platform-wide configuration

**Example Settings:**
- `commission_rate`: 10
- `payout_delay_days`: 7
- `free_shipping_threshold_nairobi`: 5000
- `tax_rate`: 15

**Indexes:**
- `idx_system_settings_key` ON `key`

---

#### support_tickets
**Purpose:** Customer support ticket system

**Indexes:**
- `idx_support_tickets_user_id` ON `user_id`
- `idx_support_tickets_vendor_id` ON `vendor_id`
- `idx_support_tickets_status` ON `status`
- `idx_support_tickets_priority` ON `priority`
- `idx_support_tickets_created_at` ON `created_at DESC`

---

### 3.8 Additional Tables

#### coupons
**Purpose:** Discount codes and promotions

**Key Features:**
- Percentage or fixed discount
- Usage limits and per-user limits
- Applicable to specific products/categories
- Date-based validity

---

#### loyalty_programs
**Purpose:** Vendor loyalty point programs

**Key Features:**
- Points accumulation
- Tier-based rewards
- Lifetime points tracking

---

#### mega_brands
**Purpose:** Corporate brand features

**Key Features:**
- Featured products array
- Display order for carousel
- Brand-specific banners

---

#### fraud_alerts
**Purpose:** Fraud detection and monitoring

**Key Features:**
- Multiple fraud types
- Severity levels
- Status tracking
- Resolution tracking

---

#### security_events
**Purpose:** Security event logging

**Key Features:**
- Event type classification
- Severity levels
- IP and user agent tracking
- Resolution workflow

---

#### communication_logs
**Purpose:** Communication tracking

**Key Features:**
- Multi-channel support (chat, email, SMS, notification)
- Status tracking
- Sender/receiver logging

---

#### ad_revenue
**Purpose:** Advertising revenue tracking

**Key Features:**
- Ad type classification
- Date range tracking
- Status management

---

## 4. Foreign Key Relationships

### 4.1 Cascading Rules

**ON DELETE CASCADE:**
- `profiles` → `vendors` (delete vendor when profile deleted)
- `vendors` → `products` (delete products when vendor deleted)
- `products` → `product_variants` (delete variants when product deleted)
- `orders` → `order_items` (delete items when order deleted)
- `chats` → `messages` (delete messages when chat deleted)

**ON DELETE SET NULL:**
- `profiles` → `audit_log.profile_id` (preserve audit log)
- `orders` → `payments.order_id` (preserve payment history)

**ON DELETE RESTRICT:**
- None (cascade or set null used)

### 4.2 Relationship Summary

| Parent Table | Child Table | Relationship | Cascade Rule |
|--------------|-------------|--------------|--------------|
| profiles | vendors | 1:1 | CASCADE |
| profiles | orders | 1:N | SET NULL |
| profiles | reviews | 1:N | SET NULL |
| vendors | products | 1:N | CASCADE |
| vendors | orders | 1:N | SET NULL |
| vendors | vendor_subscriptions | 1:N | CASCADE |
| categories | categories | 1:N (self) | CASCADE |
| categories | products | 1:N | SET NULL |
| products | product_variants | 1:N | CASCADE |
| products | order_items | 1:N | SET NULL |
| orders | order_items | 1:N | CASCADE |
| orders | payments | 1:N | SET NULL |
| orders | escrow_accounts | 1:1 | CASCADE |
| chats | messages | 1:N | CASCADE |

---

## 5. Indexes & Performance Optimization

### 5.1 Index Strategy

**Primary Indexes:**
- All primary keys (automatic)
- All foreign keys (for join performance)

**Query Optimization Indexes:**
- Frequently filtered columns (status, is_active, is_verified)
- Sort columns (created_at DESC, rating DESC)
- Search columns (slug, email, order_number)
- Composite indexes for common query patterns

**Special Indexes:**
- GIN index on `categories.meta_keywords` (array search)
- Full-text search indexes (future)

### 5.2 Performance Considerations

**Query Optimization:**
- Use indexes for WHERE clauses
- Limit result sets with pagination
- Use SELECT specific columns (not SELECT *)
- Avoid N+1 queries with joins

**Database Functions:**
- `update_updated_at_column()`: Auto-update timestamps
- `generate_category_path_slug()`: Category path generation
- `populate_all_category_path_slugs()`: Batch path updates

---

## 6. Row Level Security (RLS) Policies

### 6.1 RLS Overview

**All tables have RLS enabled** for data protection. Policies enforce:
- Users can only access their own data
- Vendors can only access their own vendor data
- Admins have full access (with audit logging)
- Public read access where appropriate

### 6.2 Key RLS Policies

**Profiles:**
- Public read access
- Users can update own profile
- Admins have full access

**Vendors:**
- Public read for verified vendors
- Vendors can update own data
- Admins have full access

**Products:**
- Public read for active products
- Vendors can manage own products
- Admins have full access

**Orders:**
- Buyers can view own orders
- Vendors can view orders for their products
- Admins can view all orders

**Complete RLS policies documented in schema.sql file at `workspace/shadcn-ui/supabase/schema.sql`.**

---

## 7. Supabase Role-Based Access

### 7.1 Database Roles

**anon (Anonymous):**
- Limited read access
- Can create accounts
- Cannot access sensitive data

**authenticated:**
- Full access to own data
- Vendor access to own vendor data
- Subject to RLS policies

**service_role:**
- Bypasses RLS (backend only)
- Used for admin operations
- Used for webhook processing

### 7.2 Access Patterns

**Public Access:**
- Product listings (active only)
- Category browsing
- Vendor profiles (verified only)

**Authenticated Access:**
- Own profile, orders, cart, wishlist
- Own vendor dashboard (if vendor)
- Chat with vendors/buyers

**Admin Access:**
- All data (via service_role or admin policies)
- Audit logs
- System settings
- Fraud alerts

---

## 8. Example Records / Seed Data

### 8.1 Sample Profile

```sql
INSERT INTO profiles (id, email, full_name, role, is_verified)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'john.doe@example.com',
    'John Doe',
    'buyer',
    true
);
```

### 8.2 Sample Vendor

```sql
INSERT INTO vendors (
    id, profile_id, business_name, slug, description,
    city, country, is_verified, kyc_status
)
VALUES (
    '660e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'TechStore Kenya',
    'techstore-kenya',
    'Leading electronics retailer in Kenya',
    'Nairobi',
    'Kenya',
    true,
    'verified'
);
```

### 8.3 Sample Product

```sql
INSERT INTO products (
    id, vendor_id, category_id, name, slug,
    description, price, currency, stock_quantity,
    is_active, is_featured
)
VALUES (
    '770e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440000',
    '880e8400-e29b-41d4-a716-446655440000', -- category_id
    'Samsung Galaxy S23',
    'samsung-galaxy-s23',
    'Latest Samsung flagship smartphone',
    89999.00,
    'KES',
    50,
    true,
    true
);
```

### 8.4 Sample Order

```sql
INSERT INTO orders (
    id, order_number, buyer_id, vendor_id,
    status, subtotal, tax, shipping_cost, total, currency
)
VALUES (
    '990e8400-e29b-41d4-a716-446655440000',
    'ORD-2025-001',
    '550e8400-e29b-41d4-a716-446655440000',
    '660e8400-e29b-41d4-a716-446655440000',
    'confirmed',
    89999.00,
    13500.00,
    500.00,
    103999.00,
    'KES'
);
```

---

## 9. Data Migration Strategy

### 9.1 Migration Files

**Location:** `workspace/shadcn-ui/supabase/migrations/`

**Migration Sequence:**
1. `20250101000001_auth_setup.sql` - Authentication setup
2. `20250101000002_admin_portal_tables.sql` - Admin tables
3. `20250101000003_vendor_portal_enhancements.sql` - Vendor enhancements
4. `20250101000004_create_initial_super_admin.sql` - Initial admin
5. `20250101000005_category_attributes_table.sql` - Category attributes
6. `20250101000000_add_category_seo_fields.sql` - SEO fields

### 9.2 Migration Best Practices

**Version Control:**
- All migrations in Git
- Sequential naming (timestamp-based)
- Rollback scripts included

**Testing:**
- Test on staging first
- Backup before migration
- Verify data integrity after migration

**Rollback:**
- Reverse migration scripts
- Point-in-time recovery (Supabase)
- Manual data restoration if needed

---

## 10. Data Types & Enums

### 10.1 Custom ENUM Types

```sql
CREATE TYPE user_role AS ENUM ('buyer', 'vendor', 'admin');
CREATE TYPE subscription_tier AS ENUM ('basic', 'bronze', 'silver', 'gold', 'platinum');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('paystack', 'stripe', 'mpesa', 'card', 'paypal');
CREATE TYPE currency AS ENUM ('KES', 'USD');
CREATE TYPE staff_role AS ENUM ('manager', 'staff', 'viewer');
```

### 10.2 JSONB Usage

**JSONB Columns:**
- `vendors.kyc_documents`: KYC document metadata
- `products.images`: Array of image URLs
- `products.dimensions`: {length, width, height}
- `orders.shipping_address`: Address object
- `payments.provider_response`: Gateway response
- `messages.translated_content`: Translation object
- `vendor_subscriptions.features`: Tier features

**Benefits:**
- Flexible schema
- Efficient querying (GIN indexes)
- No schema migrations for new fields

---

## 11. Appendix

### 11.1 Complete Schema File
**Location:** `workspace/shadcn-ui/supabase/schema.sql`

### 11.2 Related Documents
- System Architecture Blueprint
- API Specification & Integration Map
- Security, Compliance & Infrastructure Policy

### 11.3 Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | Data Engineering Team | Initial authoritative ERD |

---

**End of Document 3: Database Schema & Data Models (ERD)**
