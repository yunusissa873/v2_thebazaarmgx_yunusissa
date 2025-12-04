# The Bazaar - Database Migrations

Complete modular Supabase/PostgreSQL database schema for The Bazaar marketplace platform.

## 📊 Overview

- **Total Migrations**: 11 files
- **Total Lines**: 2,079 SQL lines
- **Total Tables**: 30+
- **Database**: PostgreSQL 15 (Supabase)
- **Version**: 2.0 (Production-Ready)

## 🗂️ Migration Structure

### Migration Files (Execute in Order)

| File | Description | Lines | Size |
|------|-------------|-------|------|
| `0001_extensions_and_utils.sql` | PostgreSQL extensions & utility functions | 72 | 2.1KB |
| `0002_base_tables_core.sql` | Profiles, vendors, admin, settings | 208 | 7.4KB |
| `0003_categories_enhancements.sql` | Categories with SEO & hierarchy | 75 | 3.0KB |
| `0004_category_attributes_tables.sql` | Category attributes system | 94 | 4.0KB |
| `0005_products_and_variants.sql` | Products, variants, brands, prices | 215 | 7.0KB |
| `0006_vendor_wallets_payouts.sql` | Vendor wallets & payout system | 143 | 5.3KB |
| `0007_orders_reviews_chats_audit.sql` | Orders, reviews, chats, audit logs | 246 | 8.5KB |
| `0008_triggers_and_functions.sql` | Triggers & helper functions | 296 | 9.7KB |
| `0009_rls_policies.sql` | Row Level Security policies | 347 | 13KB |
| `0010_indices_and_performance.sql` | Performance indexes | 182 | 6.1KB |
| `0011_seed_initial_data.sql` | Initial data & super admin | 201 | 5.7KB |

## 🚀 Quick Start

### Option 1: Execute All at Once (Recommended)

```bash
# Combine all migrations into one file
cat supabase/migrations/*.sql > combined_schema.sql

# Execute in Supabase Dashboard SQL Editor
# Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
# Paste combined_schema.sql and click "Run"
```

### Option 2: Execute One by One

Execute each file in order (0001 → 0011) in Supabase SQL Editor.

### Option 3: Use Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Push migrations
supabase db push
```

## 📋 What Each Migration Does

### 0001: Extensions and Utils
- Enables `uuid-ossp`, `pg_trgm`, `unaccent`, `pgcrypto`
- Creates utility functions: `is_admin()`, `is_super_admin()`, `is_vendor()`, `get_vendor_id()`

### 0002: Base Tables Core
- **profiles** - User accounts (buyers, vendors, admins)
- **vendors** - Business information, KYC, ratings
- **vendor_subscriptions** - Tiered subscriptions (basic → platinum)
- **vendor_staff** - Multi-user vendor management
- **admin_staff** - Admin portal users with RBAC
- **system_settings** - Global configuration

### 0003: Categories Enhancements
- **categories** - 5-level hierarchy
- Auto-generated `path_slug` (e.g., "electronics/smartphones/apple-iphone")
- `ancestry` array for efficient queries
- SEO fields: `meta_title`, `meta_description`, `meta_keywords[]`

### 0004: Category Attributes
- **category_attributes** - Attribute definitions per category
- **category_attribute_values** - Predefined values
- Supports canonical (required) and optional attributes
- Display types: text, select, multiselect, range, checkbox, color, number

### 0005: Products and Variants
- **brands** - Product brands with SEO
- **products** - Full catalog with attributes JSONB
- **product_variants** - Size, color variations
- **price_history** - Track price changes
- Auto-generated `path_slug` for products

### 0006: Vendor Wallets & Payouts
- **vendor_wallets** - Current, pending, reserved balances
- **vendor_payout_requests** - Vendor-initiated requests
- **vendor_payout_transactions** - Completed payouts
- **vendor_statement_entries** - Financial ledger

### 0007: Orders, Reviews, Chats, Audit
- **orders** - Customer orders with status tracking
- **order_items** - Line items with vendor linkage
- **reviews** - Product reviews with verification
- **chat_threads** + **chat_messages** - Buyer ↔ Vendor chat
- **audit_logs** - System-wide audit trail

### 0008: Triggers and Functions
- Auto-update `updated_at` timestamps
- Auto-generate category `path_slug` and `ancestry`
- Auto-generate product `path_slug`
- Auto-update product ratings from reviews
- Auto-update vendor wallets on order payment
- Auto-update chat thread last message

### 0009: RLS Policies
- Enable Row Level Security on all 30+ tables
- Public read for active categories, products, vendors
- User-scoped for carts, wishlists, orders
- Vendor-scoped for products, orders (own data only)
- Admin bypass for super_admin role

### 0010: Performance Indexes
- Composite indexes for common queries
- Partial indexes for active records
- Full-text search indexes (GIN)
- Trigram indexes for fuzzy search
- JSONB indexes for attribute queries
- Covering indexes with INCLUDE columns

### 0011: Seed Initial Data
- Super Admin setup (zakariamusa53@gmail.com)
- System settings (currency, tax, commission)
- Sample vendor and buyer (optional, for testing)
- Idempotent (safe to re-run)

## 🔐 Super Admin

**Email**: zakariamusa53@gmail.com  
**Role**: super_admin  
**Permissions**: Full undiluted control over all 3 portals

- ✅ Manage all admins
- ✅ Manage all vendors
- ✅ Manage all customers
- ✅ Manage all products
- ✅ Manage all orders
- ✅ View all analytics
- ✅ System settings
- ✅ Cannot be deleted

## 📦 Database Tables (30+)

### Core (6 tables)
- profiles
- vendors
- vendor_subscriptions
- vendor_staff
- admin_staff
- system_settings

### Categories (3 tables)
- categories
- category_attributes
- category_attribute_values

### Products (4 tables)
- brands
- products
- product_variants
- price_history

### Orders (2 tables)
- orders
- order_items

### Reviews & Chat (4 tables)
- reviews
- chat_threads
- chat_messages
- audit_logs

### Vendor Finance (4 tables)
- vendor_wallets
- vendor_payout_requests
- vendor_payout_transactions
- vendor_statement_entries

## ⚡ Performance Features

- **60+ indexes** (BTREE, GIN, partial, composite)
- **Full-text search** on products, vendors, categories
- **Trigram search** for fuzzy matching
- **JSONB indexes** for dynamic attributes
- **Covering indexes** for list views
- **Partial indexes** for active records only

## 🔒 Security Features

- **Row Level Security (RLS)** on all tables
- **Super Admin** with full control
- **Role-based access control** (RBAC)
- **Vendor-scoped** data access
- **Audit logging** for all changes

## 🎯 Next Steps

After executing migrations:

1. ✅ **Verify Setup**
   ```sql
   -- Check tables
   SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
   -- Should return 30+

   -- Check Super Admin
   SELECT * FROM admin_staff WHERE is_super_admin = true;
   ```

2. ✅ **Create Storage Buckets** (in Supabase Dashboard)
   - product-images (public)
   - vendor-logos (public)
   - vendor-banners (public)
   - user-avatars (public)
   - review-images (public)
   - kyc-documents (private)

3. ✅ **Import Category Data**
   - Use your `categories.ts` file
   - Import via frontend or SQL

4. ✅ **Configure Frontend**
   - Update Supabase credentials in `.env`
   - Replace mock data with API calls

5. ✅ **Test Authentication**
   - Login as Super Admin
   - Test vendor and buyer flows

6. ✅ **Deploy**
   - Test all 3 portals
   - Configure payment gateways (Paystack, M-Pesa)
   - Go live!

## 📚 Documentation

- **ERD**: See `ERD_DIAGRAM.md` (if available)
- **API Docs**: Generate from schema
- **Frontend Integration**: See main project README

## 🐛 Troubleshooting

### Migration Fails
- Check Supabase logs
- Ensure migrations run in order
- Check for existing tables (drop if needed)

### RLS Policies Block Access
- Verify user authentication
- Check role assignments
- Test with Super Admin first

### Performance Issues
- Run `ANALYZE` on tables
- Check index usage with `EXPLAIN`
- Consider partitioning for large tables

## 📞 Support

For issues or questions:
- Check Supabase documentation
- Review migration logs
- Contact: zakariamusa53@gmail.com

---

**Status**: ✅ Production-Ready  
**Version**: 2.0  
**Last Updated**: November 21, 2025  
**License**: Proprietary (The Bazaar)
