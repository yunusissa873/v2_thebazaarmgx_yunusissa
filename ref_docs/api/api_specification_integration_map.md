# API Specification & Integration Map
## The Bazaar Marketplace Platform

**Version:** 1.0.0  
**Date:** January 2025  
**Status:** Authoritative  
**Owner:** Engineering Team

---

## 1. API Overview

The Bazaar platform uses a combination of:
- **Supabase REST API:** Auto-generated from database schema
- **Supabase Edge Functions:** Custom serverless functions
- **Third-Party APIs:** Payment gateways, translation, etc.

**Base URLs:**
- Supabase REST: `https://{project}.supabase.co/rest/v1/`
- Edge Functions: `https://{project}.supabase.co/functions/v1/`
- Custom API: `https://api.thebazaar.com/api/` (future)

---

## 2. Authentication & Authorization

### 2.1 Authentication Headers

**Supabase REST API:**
```
Authorization: Bearer {anon_key} or {service_role_key}
apikey: {anon_key}
```

**Edge Functions:**
```
Authorization: Bearer {service_role_key}
```

### 2.2 Role-Based Access

**anon (Anonymous):**
- Limited read access
- Can create accounts
- Subject to RLS policies

**authenticated:**
- Full access to own data
- Vendor access to own vendor data
- Subject to RLS policies

**service_role:**
- Bypasses RLS (backend only)
- Used for admin operations
- Used for webhook processing

---

## 3. Supabase REST API Endpoints

### 3.1 Profiles

**GET /rest/v1/profiles**
- List all profiles (public read)
- **Query Parameters:**
  - `id=eq.{uuid}`
  - `role=eq.vendor`
  - `is_verified=eq.true`

**PATCH /rest/v1/profiles?id=eq.{id}**
- Update own profile
- **Request Body:**
  ```json
  {
    "full_name": "John Doe",
    "phone": "+254700000000",
    "avatar_url": "https://..."
  }
  ```

### 3.2 Vendors

**GET /rest/v1/vendors**
- List verified vendors (public)
- **Query Parameters:**
  - `is_verified=eq.true`
  - `slug=eq.{slug}`
  - `city=eq.Nairobi`

**GET /rest/v1/vendors/{id}**
- Get vendor details

**PATCH /rest/v1/vendors?id=eq.{id}**
- Update own vendor data (vendor only)

### 3.3 Products

**GET /rest/v1/products**
- List active products (public)
- **Query Parameters:**
  - `is_active=eq.true`
  - `vendor_id=eq.{uuid}`
  - `category_id=eq.{uuid}`
  - `is_featured=eq.true`
  - `order=created_at.desc`
  - `limit=20`
  - `offset=0`

**GET /rest/v1/products/{id}**
- Get product details with variants

**POST /rest/v1/products**
- Create product (vendor only)
- **Request Body:**
  ```json
  {
    "vendor_id": "uuid",
    "category_id": "uuid",
    "name": "Product Name",
    "slug": "product-name",
    "description": "...",
    "price": 10000.00,
    "currency": "KES",
    "stock_quantity": 50,
    "images": ["url1", "url2"]
  }
  ```

**PATCH /rest/v1/products?id=eq.{id}**
- Update product (vendor only)

**DELETE /rest/v1/products?id=eq.{id}**
- Delete product (vendor only)

### 3.4 Orders

**GET /rest/v1/orders**
- List orders (buyer/vendor own orders)
- **Query Parameters:**
  - `buyer_id=eq.{uuid}`
  - `vendor_id=eq.{uuid}`
  - `status=eq.confirmed`

**POST /rest/v1/orders**
- Create order (buyer only)
- **Request Body:**
  ```json
  {
    "buyer_id": "uuid",
    "vendor_id": "uuid",
    "subtotal": 10000.00,
    "tax": 1500.00,
    "shipping_cost": 500.00,
    "total": 12000.00,
    "currency": "KES",
    "shipping_address": {...}
  }
  ```

**PATCH /rest/v1/orders?id=eq.{id}**
- Update order status (vendor/admin)

### 3.5 Cart & Wishlist

**GET /rest/v1/cart_items?buyer_id=eq.{uuid}**
- Get cart items

**POST /rest/v1/cart_items**
- Add to cart
- **Request Body:**
  ```json
  {
    "buyer_id": "uuid",
    "product_id": "uuid",
    "variant_id": "uuid",
    "quantity": 2
  }
  ```

**GET /rest/v1/wishlists?buyer_id=eq.{uuid}**
- Get wishlist items

**POST /rest/v1/wishlists**
- Add to wishlist

### 3.6 Reviews

**GET /rest/v1/reviews?product_id=eq.{uuid}&is_approved=eq.true**
- Get approved reviews

**POST /rest/v1/reviews**
- Create review (buyer only)

---

## 4. Custom API Endpoints

### 4.1 Vendor Registration

**POST /api/vendor/register**
- Register new vendor
- **Request Body:**
  ```json
  {
    "business_name": "TechStore",
    "email": "vendor@example.com",
    "phone": "+254700000000",
    "address": "123 Main St",
    "city": "Nairobi"
  }
  ```
- **Response:**
  ```json
  {
    "vendor_id": "uuid",
    "status": "created",
    "next_step": "kyc_verification"
  }
  ```

### 4.2 KYC Management

**POST /api/vendor/kyc/upload**
- Upload KYC document
- **Request:** Multipart form data
- **Response:**
  ```json
  {
    "document_id": "uuid",
    "document_type": "business_registration",
    "upload_status": "success"
  }
  ```

**GET /api/vendor/kyc/status**
- Get KYC status

### 4.3 Subscription Management

**GET /api/vendor/subscriptions/plans**
- List subscription plans

**POST /api/vendor/subscriptions/intent**
- Create payment intent for subscription

**POST /api/vendor/subscriptions/confirm**
- Confirm subscription payment

### 4.4 Payment Processing

**POST /api/payments/create-intent**
- Create payment intent
- **Request Body:**
  ```json
  {
    "order_id": "uuid",
    "amount": 15000.00,
    "currency": "KES",
    "payment_method": "paystack"
  }
  ```
- **Response:**
  ```json
  {
    "payment_intent_id": "pi_xxx",
    "client_secret": "xxx",
    "redirect_url": "https://..."
  }
  ```

**POST /api/payments/verify**
- Verify payment status

### 4.5 Analytics

**GET /api/admin/analytics/overview**
- Get platform analytics
- **Query Parameters:**
  - `start_date=2025-01-01`
  - `end_date=2025-01-31`
- **Response:**
  ```json
  {
    "mav": 150,
    "gmv": 5000000,
    "total_orders": 1200,
    "revenue": 500000
  }
  ```

---

## 5. Webhook Endpoints

### 5.1 Payment Webhooks

**POST /functions/v1/paystack-webhook**
- Paystack payment notifications
- **Headers:**
  - `x-paystack-signature`: Webhook signature
- **Payload:**
  ```json
  {
    "event": "charge.success",
    "data": {
      "reference": "ref_xxx",
      "amount": 15000.00,
      "status": "success"
    }
  }
  ```

**POST /functions/v1/stripe-webhook**
- Stripe payment notifications
- **Headers:**
  - `stripe-signature`: Webhook signature

**POST /functions/v1/mpesa-webhook**
- M-Pesa transaction notifications
- **Headers:**
  - `x-mpesa-signature`: Webhook signature

### 5.2 Webhook Processing Flow

```
1. Webhook received
2. Verify signature
3. Parse event type
4. Update payment record
5. Update order status
6. Create escrow account (if order)
7. Update vendor subscription (if subscription)
8. Send notifications
9. Return 200 OK
```

---

## 6. Third-Party Integrations

### 6.1 Paystack API

**Base URL:** `https://api.paystack.co/`

**Endpoints:**
- `POST /transaction/initialize` - Initialize payment
- `GET /transaction/verify/{reference}` - Verify payment
- `POST /transfer` - Vendor payout (B2B)

**Authentication:**
```
Authorization: Bearer {secret_key}
```

**Request Example:**
```json
{
  "email": "customer@example.com",
  "amount": 1500000, // in kobo (15000.00 KES)
  "reference": "ref_xxx",
  "callback_url": "https://..."
}
```

### 6.2 Stripe API

**Base URL:** `https://api.stripe.com/v1/`

**Endpoints:**
- `POST /payment_intents` - Create payment intent
- `GET /payment_intents/{id}` - Get payment intent
- `POST /refunds` - Process refund

**Authentication:**
```
Authorization: Bearer {secret_key}
```

### 6.3 M-Pesa (Safaricom Daraja API)

**Base URL:** `https://sandbox.safaricom.co.ke/` (sandbox)

**Endpoints:**
- `POST /mpesa/stkpush/v1/processrequest` - STK Push
- `POST /mpesa/b2c/v1/paymentrequest` - B2C Payout
- `GET /mpesa/transactionstatus/v1/query` - Query transaction

**Authentication:**
- OAuth token required
- Consumer key/secret

### 6.4 Google Translate API

**Base URL:** `https://translation.googleapis.com/language/translate/v2`

**Endpoint:**
- `POST /translate` - Translate text

**Request:**
```json
{
  "q": "Hello",
  "target": "sw",
  "source": "en",
  "key": "{api_key}"
}
```

**Response:**
```json
{
  "data": {
    "translations": [{
      "translatedText": "Hujambo"
    }]
  }
}
```

---

## 7. Request/Response Schemas

### 7.1 Standard Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {...}
  }
}
```

### 7.2 Pagination

**Query Parameters:**
- `limit`: Number of items (default: 20)
- `offset`: Skip items (default: 0)

**Response:**
```json
{
  "data": [...],
  "total": 150,
  "limit": 20,
  "offset": 0,
  "has_more": true
}
```

### 7.3 Filtering

**Supabase PostgREST Filters:**
- `eq`: Equal
- `neq`: Not equal
- `gt`: Greater than
- `gte`: Greater than or equal
- `lt`: Less than
- `lte`: Less than or equal
- `like`: Pattern match
- `ilike`: Case-insensitive pattern match
- `in`: In array
- `is`: Is null/not null

**Example:**
```
/products?price=gte.1000&price=lte.50000&is_active=eq.true
```

---

## 8. Error Handling

### 8.1 HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

### 8.2 Error Codes

**Authentication Errors:**
- `AUTH_REQUIRED`: Authentication required
- `AUTH_INVALID`: Invalid credentials
- `AUTH_EXPIRED`: Token expired

**Validation Errors:**
- `VALIDATION_FAILED`: Validation failed
- `MISSING_FIELD`: Required field missing
- `INVALID_FORMAT`: Invalid data format

**Business Logic Errors:**
- `INSUFFICIENT_STOCK`: Product out of stock
- `PAYMENT_FAILED`: Payment processing failed
- `ORDER_INVALID`: Invalid order state

---

## 9. Rate Limiting

### 9.1 Supabase Limits

**Free Tier:**
- 500 requests/second
- 2GB database
- 1GB storage

**Pro Tier:**
- 2,000 requests/second
- 8GB database
- 100GB storage

### 9.2 Custom Rate Limiting

**Per-User Limits:**
- 100 requests/minute (authenticated)
- 20 requests/minute (anonymous)

**Per-IP Limits:**
- 200 requests/minute

**Implementation:**
- Edge Functions middleware
- Redis-based rate limiting (future)

---

## 10. API Versioning Strategy

### 10.1 Current Version

**Version:** v1 (implicit)

**URL Structure:**
- `/rest/v1/` (Supabase REST)
- `/functions/v1/` (Edge Functions)
- `/api/v1/` (Custom API, future)

### 10.2 Versioning Approach

**URL-Based Versioning:**
- `/api/v1/...`
- `/api/v2/...`

**Header-Based Versioning (Future):**
- `API-Version: 1.0`

---

## 11. Related Documents
- System Architecture Blueprint
- Database Schema & ERD
- Feature Specification Sheets
- Security, Compliance & Infrastructure Policy

---

## 12. Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | Engineering Team | Initial API specification |

---

**End of Document 6: API Specification & Integration Map**



