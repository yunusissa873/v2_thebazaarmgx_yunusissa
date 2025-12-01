# System Architecture Blueprint (SAB)
## The Bazaar Marketplace Platform

**Version:** 1.0.0  
**Date:** January 2025  
**Status:** Authoritative  
**Owner:** Engineering/Architecture Team

---

## 1. Architecture Overview

### 1.1 System Architecture Philosophy
The Bazaar follows a **modern, serverless-first architecture** leveraging:
- **Frontend:** React-based applications with component-driven architecture
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Hosting:** Vercel for frontend, Supabase for backend
- **Payments:** Multiple gateway integrations (Paystack, Stripe, M-Pesa)
- **CDN:** Vercel Edge Network + Cloudflare (optional)

### 1.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────┤
│  Marketplace PWA (React+Vite)  │  Vendor Portal (Next.js)     │
│  Admin Portal (React+Vite)     │  Mobile Web (PWA)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
├─────────────────────────────────────────────────────────────┤
│  Supabase REST API  │  Supabase Realtime  │  Edge Functions │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                          │
├─────────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL  │  Supabase Auth  │  Supabase Storage  │
│  Row Level Security   │  Webhooks       │  Edge Functions    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                     │
├─────────────────────────────────────────────────────────────┤
│  Paystack API  │  Stripe API  │  M-Pesa (Daraja)  │  Google  │
│  Translate API │  Email (SMTP)│  SMS Gateway      │          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend Technologies

**Marketplace PWA:**
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.11
- **Language:** TypeScript 5.6.2
- **Styling:** Tailwind CSS 3.4.17
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State Management:** TanStack Query (React Query) 5.62.11
- **Routing:** React Router DOM 7.0.2
- **PWA:** vite-plugin-pwa 0.20.5
- **Forms:** React Hook Form 7.54.2
- **Charts:** Recharts 2.15.0

**Vendor Portal:**
- **Framework:** Next.js 15.5.6 (App Router)
- **Language:** TypeScript 5.9.3
- **Styling:** Tailwind CSS 3.4.18
- **State Management:** Zustand 5.0.8
- **Data Fetching:** TanStack Query 5.90.7
- **Animations:** Framer Motion 11.18.2
- **Testing:** Playwright 1.56.1

**Admin Portal:**
- **Framework:** React 18.3.1 + Vite 5.4.11
- **Language:** TypeScript 5.6.2
- **Styling:** Tailwind CSS 3.4.17
- **UI Components:** shadcn/ui
- **State Management:** Zustand 5.0.2
- **Data Fetching:** TanStack Query 5.62.11
- **Charts:** Recharts 2.15.0

### 2.2 Backend Technologies

**Supabase Services:**
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth (JWT-based)
- **Realtime:** Supabase Realtime (WebSocket)
- **Storage:** Supabase Storage (S3-compatible)
- **Edge Functions:** Supabase Edge Functions (Deno runtime)

**Database Features:**
- Row Level Security (RLS) policies
- PostgreSQL extensions (uuid-ossp, pgcrypto)
- Triggers for automatic timestamp updates
- Full-text search capabilities
- JSONB for flexible data storage

### 2.3 Payment Integrations

**Primary (Kenya):**
- **Paystack:** Primary payment gateway for Kenya
- **M-Pesa:** Via Safaricom Daraja API

**Secondary (Global):**
- **Stripe:** International payments
- **PayPal:** Alternative global payment (future)

### 2.4 External Services

**Communication:**
- **Google Translate API:** AI-powered translation
- **Email Service:** SMTP (via Supabase or SendGrid)
- **SMS Gateway:** For OTP and notifications (future)

**Infrastructure:**
- **Vercel:** Frontend hosting and CDN
- **Supabase:** Backend-as-a-Service
- **Cloudflare:** Additional CDN and DDoS protection (optional)

---

## 3. System Components & Modules

### 3.1 Marketplace PWA (`workspace/shadcn-ui/`)

**Structure:**
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── marketplace/     # Product browsing, search, filters
│   ├── vendor/          # Vendor profiles and listings
│   ├── orders/          # Order management
│   ├── profile/         # User profile management
│   ├── reviews/         # Review components
│   └── shared/          # Shared components (Navbar, Footer)
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── lib/
│   ├── supabase/        # Supabase client and utilities
│   └── utils.ts         # Helper functions
├── contexts/            # React contexts (Auth, Cart, Wishlist)
└── types/               # TypeScript definitions
```

**Key Features:**
- Netflix-inspired dark theme UI
- Infinite scroll product browsing
- Real-time chat with vendors
- PWA offline functionality
- Multi-currency support

### 3.2 Vendor Portal (`the_bazaar/vendor_portal/`)

**Structure:**
```
app/
├── vendor/
│   ├── register/        # Vendor registration
│   ├── verify/          # KYC/KYB verification
│   ├── subscription/    # Subscription management
│   └── dashboard/       # Protected dashboard routes
│       ├── profile/     # Vendor profile
│       ├── commerce/    # Products, orders
│       ├── analytics/   # Analytics dashboard
│       └── finance/     # Financial management
├── components/vendor/   # Vendor-specific components
├── lib/
│   ├── api/             # API client functions
│   └── payments/        # Payment integration stubs
└── state/               # Zustand store
```

**Key Features:**
- Multi-step registration and KYC
- Subscription tier selection
- Product and inventory management
- Order fulfillment dashboard
- Analytics and reporting

### 3.3 Admin Portal (`workspace/admin-portal/`)

**Structure:**
```
src/
├── components/          # Admin UI components
├── pages/              # Admin pages
├── lib/
│   └── supabase/       # Supabase admin client
└── types/              # TypeScript definitions
```

**Key Features:**
- Vendor management and verification
- Platform analytics (MAV, GMV)
- Payment reconciliation
- Fraud detection monitoring
- Support ticket management

---

## 4. Frontend Architecture

### 4.1 Component Architecture

**Design Pattern:** Component-driven development with shadcn/ui

**Component Hierarchy:**
```
App (Root)
├── AuthContext (Authentication state)
├── CartContext (Shopping cart state)
├── WishlistContext (Wishlist state)
└── Routes
    ├── Public Routes
    │   ├── HomePage
    │   ├── ProductsPage
    │   ├── VendorProfilePage
    │   └── ProductPage
    └── Protected Routes
        ├── ProfilePage
        ├── CartPage
        ├── OrdersPage
        └── WishlistPage
```

**Component Categories:**
1. **UI Components:** Reusable shadcn/ui components
2. **Feature Components:** Business logic components
3. **Page Components:** Route-level components
4. **Layout Components:** Shared layouts (Navbar, Footer)

### 4.2 State Management

**Marketplace PWA:**
- **Server State:** TanStack Query (React Query)
- **Client State:** React Context (Auth, Cart, Wishlist)
- **Form State:** React Hook Form

**Vendor Portal:**
- **Server State:** TanStack Query
- **Client State:** Zustand store
- **Form State:** React Hook Form

**Admin Portal:**
- **Server State:** TanStack Query
- **Client State:** Zustand store

### 4.3 Routing Strategy

**Marketplace PWA:**
- React Router DOM v7
- Route-based code splitting (lazy loading)
- Protected routes with authentication checks

**Vendor Portal:**
- Next.js App Router
- Server-side routing
- Middleware for route protection

**Admin Portal:**
- React Router DOM
- Protected admin routes

### 4.4 Performance Optimization

**Code Splitting:**
- Route-based lazy loading
- Component-level code splitting
- Dynamic imports for heavy components

**Asset Optimization:**
- Image optimization (Sharp)
- CSS minification
- JavaScript bundling and tree-shaking
- PWA caching strategies

**Caching:**
- Service Worker caching (PWA)
- React Query cache
- Browser caching headers

---

## 5. Backend Architecture

### 5.1 Supabase Architecture

**Database Layer:**
- PostgreSQL 15+ database
- 28 core tables (profiles, vendors, products, orders, etc.)
- Row Level Security (RLS) policies
- Database functions and triggers
- Full-text search indexes

**Authentication Layer:**
- Supabase Auth (JWT-based)
- Email/password authentication
- OAuth providers (future: Google, Facebook)
- Magic link authentication
- Session management

**Storage Layer:**
- Supabase Storage buckets:
  - `product-images`: Product photos
  - `vendor-assets`: Vendor logos, banners
  - `kyc-documents`: KYC verification documents
  - `user-avatars`: User profile pictures

**Realtime Layer:**
- WebSocket connections for:
  - Chat messages
  - Order status updates
  - Inventory changes
  - Notification delivery

### 5.2 API Architecture

**REST API (Supabase PostgREST):**
- Auto-generated REST endpoints from database schema
- Row Level Security enforcement
- Automatic API documentation
- Request/response validation

**Edge Functions:**
- Payment webhook handlers:
  - `paystack-webhook`
  - `stripe-webhook`
  - `mpesa-webhook`
  - `flutterwave-webhook`
  - `paypal-webhook`
- Payment processing:
  - `create-payment`
  - `verify-payment`

**Custom API Endpoints:**
- Vendor registration API
- KYC document upload
- Subscription management
- Analytics aggregation

### 5.3 Database Schema

**Core Tables (28 total):**
1. `profiles` - User accounts
2. `vendors` - Vendor business info
3. `vendor_subscriptions` - Subscription tiers
4. `vendor_staff` - Staff management
5. `categories` - 4-level category hierarchy
6. `products` - Product catalog
7. `product_variants` - Product variations
8. `orders` - Order management
9. `order_items` - Order line items
10. `payments` - Payment records
11. `reviews` - Product reviews
12. `cart_items` - Shopping cart
13. `wishlists` - Wishlist items
14. `coupons` - Discount codes
15. `loyalty_programs` - Loyalty points
16. `chats` - Chat conversations
17. `messages` - Chat messages
18. `mega_brands` - Corporate brands
19. `audit_log` - Admin action logs
20. `admin_permissions` - RBAC permissions
21. `system_settings` - Platform settings
22. `support_tickets` - Support system
23. `vendor_wallets` - Vendor earnings
24. `escrow_accounts` - Escrow management
25. `fraud_alerts` - Fraud detection
26. `security_events` - Security monitoring
27. `communication_logs` - Communication tracking
28. `ad_revenue` - Advertising revenue

**See Database Schema & ERD document for complete details.**

---

## 6. Authentication & Authorization Flow

### 6.1 Authentication Flow

**User Registration:**
```
1. User submits registration form
2. Supabase Auth creates user account
3. Profile record created in `profiles` table
4. Email verification sent (if required)
5. JWT token issued
6. User redirected to appropriate dashboard
```

**User Login:**
```
1. User submits credentials
2. Supabase Auth validates credentials
3. JWT token issued
4. User role determined from `profiles.role`
5. Redirect based on role:
   - buyer → Marketplace
   - vendor → Vendor Portal
   - admin → Admin Portal
```

**Vendor Registration:**
```
1. Vendor submits registration form
2. Profile created with role='vendor'
3. Vendor record created in `vendors` table
4. KYC verification workflow initiated
5. Subscription selection required
6. Access granted after KYC + subscription
```

### 6.2 Authorization (Row Level Security)

**RLS Policy Examples:**

**Profiles:**
- Public read access
- Users can update own profile
- Admins have full access

**Products:**
- Public read for active products
- Vendors can manage own products
- Admins have full access

**Orders:**
- Buyers can view own orders
- Vendors can view orders for their products
- Admins can view all orders

**Complete RLS policies documented in Database Schema document.**

### 6.3 Role-Based Access Control (RBAC)

**User Roles:**
- `buyer`: Can browse, purchase, review
- `vendor`: Can manage products, orders, analytics
- `admin`: Full platform access

**Vendor Staff Roles:**
- `manager`: Full vendor dashboard access
- `staff`: Limited access (orders, products)
- `viewer`: Read-only access

**Admin Permissions:**
- Granular permissions via `admin_permissions` table
- Resource-type specific permissions
- Audit logging for all admin actions

---

## 7. Payment Gateway Integration

### 7.1 Payment Flow

**Order Payment Flow:**
```
1. Customer adds items to cart
2. Proceeds to checkout
3. Selects payment method (M-Pesa, Paystack, Stripe)
4. Payment intent created
5. Customer redirected to payment gateway
6. Payment processed
7. Webhook received from gateway
8. Payment record created in `payments` table
9. Order status updated to 'confirmed'
10. Escrow account created
11. Vendor notified
```

**Subscription Payment Flow:**
```
1. Vendor selects subscription tier
2. Payment intent created
3. Payment processed
4. Webhook received
5. `vendor_subscriptions` record created/updated
6. Vendor access granted
```

### 7.2 Payment Providers

**Paystack (Primary - Kenya):**
- Card payments
- Bank transfers
- USSD payments
- Mobile money

**M-Pesa (Safaricom Daraja API):**
- STK Push (Lipa na M-Pesa)
- B2C payments (payouts)
- Transaction status queries

**Stripe (Global):**
- International card payments
- SEPA (Europe)
- Additional payment methods

### 7.3 Webhook Handlers

**Location:** `workspace/shadcn-ui/supabase/functions/`

**Webhook Endpoints:**
- `/paystack-webhook`: Paystack payment notifications
- `/stripe-webhook`: Stripe payment notifications
- `/mpesa-webhook`: M-Pesa transaction notifications
- `/flutterwave-webhook`: Flutterwave notifications
- `/paypal-webhook`: PayPal notifications

**Webhook Processing:**
1. Verify webhook signature
2. Parse payment event
3. Update payment record
4. Update order status
5. Trigger notifications
6. Update escrow account

---

## 8. API Gateway & Webhook Flows

### 8.1 Supabase REST API

**Auto-Generated Endpoints:**
- `GET /rest/v1/{table}`: List records
- `GET /rest/v1/{table}?id=eq.{id}`: Get single record
- `POST /rest/v1/{table}`: Create record
- `PATCH /rest/v1/{table}?id=eq.{id}`: Update record
- `DELETE /rest/v1/{table}?id=eq.{id}`: Delete record

**Query Parameters:**
- `select`: Column selection
- `filter`: Row filtering (eq, gt, lt, etc.)
- `order`: Sorting
- `limit`: Pagination
- `offset`: Pagination offset

### 8.2 Edge Functions

**Payment Functions:**
- `create-payment`: Initialize payment
- `verify-payment`: Verify payment status

**Webhook Functions:**
- Payment gateway webhook handlers
- Event processing and database updates

### 8.3 API Rate Limiting

**Supabase Limits:**
- Free tier: 500 requests/second
- Pro tier: 2,000 requests/second
- Enterprise: Custom limits

**Custom Rate Limiting:**
- Implemented in Edge Functions
- Per-user rate limits
- Per-IP rate limits for public endpoints

---

## 9. External Integrations

### 9.1 Google Translate API

**Purpose:** AI-powered translation for global accessibility

**Integration:**
- Real-time message translation
- Product description translation
- Multi-language support

**Usage:**
- Chat message translation
- Product listing translation
- Vendor communication

### 9.2 Email Service

**Purpose:** Transactional and marketing emails

**Use Cases:**
- Order confirmations
- Payment receipts
- Password reset
- Email verification
- Vendor notifications

**Implementation:**
- Supabase built-in email (development)
- SendGrid or similar (production)

### 9.3 SMS Gateway (Future)

**Purpose:** OTP and notifications

**Use Cases:**
- Two-factor authentication
- Order status updates
- Payment confirmations

---

## 10. Hosting & Infrastructure

### 10.1 Frontend Hosting (Vercel)

**Marketplace PWA:**
- Vercel deployment
- Automatic CI/CD from Git
- Edge network for global CDN
- Preview deployments for PRs

**Vendor Portal:**
- Vercel deployment
- Next.js serverless functions
- Edge middleware

**Admin Portal:**
- Vercel deployment
- Static site generation

### 10.2 Backend Hosting (Supabase)

**Database:**
- Managed PostgreSQL
- Automatic backups
- Point-in-time recovery
- Read replicas (enterprise)

**Storage:**
- S3-compatible object storage
- CDN integration
- Image transformations

**Edge Functions:**
- Deno runtime
- Global edge deployment
- Auto-scaling

### 10.3 CDN & Performance

**Vercel Edge Network:**
- Global CDN
- Edge caching
- Automatic optimization

**Cloudflare (Optional):**
- Additional CDN layer
- DDoS protection
- WAF (Web Application Firewall)

---

## 11. Environment Setup

### 11.1 Environment Variables

**Marketplace PWA (.env.local):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
VITE_PAYSTACK_SECRET_KEY=your_paystack_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_GOOGLE_TRANSLATE_API_KEY=your_google_translate_key
VITE_APP_URL=http://localhost:3000
```

**Vendor Portal (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
STAGING=true
```

**Supabase Edge Functions:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PAYSTACK_SECRET_KEY=your_paystack_secret
STRIPE_SECRET_KEY=your_stripe_secret
MPESA_CONSUMER_KEY=your_mpesa_key
MPESA_CONSUMER_SECRET=your_mpesa_secret
```

### 11.2 Local Development Setup

**Prerequisites:**
- Node.js 18+
- pnpm (package manager)
- Supabase CLI (optional)
- Git

**Setup Steps:**
1. Clone repository
2. Install dependencies: `pnpm install`
3. Copy `.env.local.example` to `.env.local`
4. Configure environment variables
5. Run development server: `pnpm run dev`
6. Access at `http://localhost:3000`

---

## 12. Deployment Strategy

### 12.1 CI/CD Pipeline

**GitHub Actions / Vercel:**
1. Code pushed to repository
2. Automated tests run
3. Build process initiated
4. Deployment to staging (on PR)
5. Deployment to production (on merge to main)

**Deployment Stages:**
- **Development:** Local development
- **Staging:** Preview deployments (Vercel)
- **Production:** Main branch deployments

### 12.2 Database Migrations

**Migration Strategy:**
- Version-controlled SQL migrations
- Located in `workspace/shadcn-ui/supabase/migrations/`
- Applied via Supabase CLI or dashboard
- Rollback procedures documented

**Migration Files:**
- `20250101000001_auth_setup.sql`
- `20250101000002_admin_portal_tables.sql`
- `20250101000003_vendor_portal_enhancements.sql`
- `20250101000004_create_initial_super_admin.sql`
- `20250101000005_category_attributes_table.sql`

### 12.3 Rollback Procedures

**Frontend Rollback:**
- Vercel instant rollback to previous deployment
- Git revert and redeploy

**Database Rollback:**
- Restore from backup
- Apply reverse migrations
- Point-in-time recovery (Supabase)

---

## 13. Security Layers

### 13.1 Application Security

**Authentication:**
- JWT tokens with expiration
- Secure password hashing (Supabase)
- Email verification
- Two-factor authentication (future)

**Authorization:**
- Row Level Security (RLS) policies
- Role-based access control (RBAC)
- API endpoint protection
- Resource-level permissions

### 13.2 Data Security

**Encryption:**
- Data at rest: Supabase encryption
- Data in transit: HTTPS/TLS
- Sensitive data: Encrypted fields
- Payment data: PCI-DSS compliance

**Data Privacy:**
- GDPR compliance
- Kenya DPA compliance
- User data anonymization
- Right to deletion

### 13.3 Infrastructure Security

**Network Security:**
- HTTPS only
- CORS configuration
- Rate limiting
- DDoS protection

**Monitoring:**
- Security event logging
- Fraud detection
- Anomaly detection
- Audit trails

**See Security, Compliance & Infrastructure Policy document for complete details.**

---

## 14. Performance Optimization

### 14.1 Frontend Optimization

**Code Splitting:**
- Route-based lazy loading
- Component-level splitting
- Dynamic imports

**Asset Optimization:**
- Image optimization (WebP, lazy loading)
- CSS minification
- JavaScript bundling
- Tree-shaking

**Caching:**
- Service Worker (PWA)
- React Query cache
- Browser caching
- CDN caching

### 14.2 Backend Optimization

**Database:**
- Indexed queries
- Query optimization
- Connection pooling
- Read replicas

**API:**
- Response caching
- Pagination
- Field selection
- Batch operations

### 14.3 Performance Targets

- **Page Load Time:** <2s on mobile
- **Time to Interactive:** <3s
- **First Contentful Paint:** <1.5s
- **Largest Contentful Paint:** <2.5s
- **API Response Time:** <200ms (p95)

---

## 15. Monitoring & Observability

### 15.1 Application Monitoring

**Frontend:**
- Error tracking (Sentry, future)
- Performance monitoring
- User analytics
- Real User Monitoring (RUM)

**Backend:**
- Supabase logs
- Edge Function logs
- Database query logs
- API response times

### 15.2 Infrastructure Monitoring

**Vercel:**
- Deployment status
- Build logs
- Function execution logs
- Analytics dashboard

**Supabase:**
- Database performance
- Storage usage
- API usage
- Realtime connections

### 15.3 Alerting

**Critical Alerts:**
- Payment failures
- Database errors
- High error rates
- Security events

**See Analytics, Tracking & Reporting Plan document for complete details.**

---

## 16. Scalability Considerations

### 16.1 Horizontal Scaling

**Frontend:**
- Stateless application
- CDN distribution
- Edge function scaling

**Backend:**
- Supabase auto-scaling
- Database read replicas
- Connection pooling

### 16.2 Database Scaling

**Current Capacity:**
- Supabase Free: 500MB database
- Supabase Pro: 8GB database
- Supabase Enterprise: Custom

**Scaling Strategy:**
- Database optimization
- Read replicas
- Partitioning (future)
- Archiving old data

### 16.3 Performance at Scale

**Expected Load:**
- 1,000+ concurrent users
- 10,000+ daily active users
- 100,000+ products
- 1,000+ vendors

**Optimization:**
- Caching strategies
- Database indexing
- API rate limiting
- CDN utilization

---

## 17. Disaster Recovery

### 17.1 Backup Strategy

**Database Backups:**
- Automatic daily backups (Supabase)
- Point-in-time recovery
- Manual backup exports

**Code Backups:**
- Git repository (GitHub)
- Version control history
- Deployment snapshots

### 17.2 Recovery Procedures

**Database Recovery:**
- Restore from backup
- Point-in-time recovery
- Migration rollback

**Application Recovery:**
- Git revert
- Vercel rollback
- Environment variable restoration

### 17.3 Business Continuity

**High Availability:**
- Multi-region deployment (future)
- Failover procedures
- Redundant services

**Data Redundancy:**
- Database backups
- Storage replication
- Code versioning

---

## 18. Appendix

### 18.1 Technology Versions

**Frontend:**
- React: 18.3.1
- Next.js: 15.5.6
- Vite: 5.4.11
- TypeScript: 5.6.2 - 5.9.3

**Backend:**
- Supabase: Latest
- PostgreSQL: 15+
- Deno: Latest (Edge Functions)

### 18.2 Related Documents
- Database Schema & ERD
- API Specification & Integration Map
- Security, Compliance & Infrastructure Policy
- Operational Runbook / DevOps Guide

### 18.3 Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | Architecture Team | Initial authoritative SAB |

---

**End of Document 2: System Architecture Blueprint**
