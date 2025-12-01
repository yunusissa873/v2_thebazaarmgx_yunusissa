# Feature Specification: Vendor Registration, Onboarding & Dashboard
## The Bazaar Marketplace Platform

**Version:** 1.0.0  
**Date:** January 2025  
**Status:** Authoritative  
**Owner:** Product Management Team

---

## 1. Feature Purpose

This feature enables new vendors to register on The Bazaar platform, complete KYC/KYB verification, select a subscription tier, and access their vendor dashboard. The workflow ensures only verified vendors with active subscriptions can manage their storefront.

---

## 2. Functional Flow

### 2.1 Vendor Registration Flow

```
1. User navigates to /vendor/register
2. User fills registration form:
   - Business name
   - Business type
   - Contact information (email, phone)
   - Business address
   - Tax ID / Registration number
3. System creates profile with role='vendor'
4. System creates vendor record in `vendors` table
5. User redirected to /vendor/verify (KYC step)
```

**Registration Form Fields:**
- Business name (required)
- Business type (required)
- Email (required, validated)
- Phone (required, validated)
- Business registration number (optional)
- Tax ID (optional)
- Address (required)
- City (required)
- Country (default: Kenya)
- Website (optional)

### 2.2 KYC/KYB Verification Flow

```
1. User lands on /vendor/verify
2. Multi-step document upload:
   Step 1: Business registration documents
   Step 2: Tax identification documents
   Step 3: Identity verification (ID/Passport)
   Step 4: Proof of address
3. Documents uploaded to Supabase Storage (kyc-documents bucket)
4. System updates `vendors.kyc_documents` (JSONB)
5. System sets `vendors.kyc_status` = 'pending'
6. Admin notification sent
7. User redirected to /vendor/subscription (pending verification)
```

**KYC Document Types:**
- Business registration certificate
- Tax identification certificate
- National ID or Passport
- Proof of business address
- Bank account details (for payouts)

**KYC Status Values:**
- `pending`: Documents submitted, awaiting review
- `under_review`: Admin is reviewing documents
- `verified`: KYC approved, vendor can proceed
- `rejected`: KYC failed, vendor must resubmit
- `requires_attention`: Additional information needed

### 2.3 Subscription Selection Flow

```
1. User lands on /vendor/subscription
2. System displays subscription tiers:
   - Basic (KES 2,000/month)
   - Bronze (KES 3,500/month)
   - Silver (KES 5,500/month)
   - Gold (KES 7,500/month)
   - Platinum (KES 12,000/month)
3. User selects tier
4. System calculates pricing (monthly/annual)
5. User proceeds to payment
6. Payment processed (Paystack/Stripe/M-Pesa)
7. System creates `vendor_subscriptions` record
8. System sets subscription status = 'active'
9. User redirected to /vendor/dashboard
```

**Subscription Features by Tier:**
- **Basic:** 50 SKUs, directory listing
- **Bronze:** 150 SKUs, B2C sales, 1 user
- **Silver:** 500 SKUs, B2B/B2C, Chat, Call, Mini-storefront
- **Gold:** 1,000 SKUs, Analytics, Featured listing
- **Platinum:** Unlimited SKUs, International, Premium analytics, Carousel

### 2.4 Dashboard Access Control

```
1. User attempts to access /vendor/dashboard/*
2. System checks:
   - Is user authenticated? → Redirect to /vendor/register
   - Is user role = 'vendor'? → Redirect to /vendor/register
   - Is KYC verified? → Redirect to /vendor/verify
   - Is subscription active? → Redirect to /vendor/subscription
3. If all checks pass → Grant dashboard access
```

**Access Requirements:**
- Authentication: User must be logged in
- Role: User must have role='vendor'
- KYC: `vendors.kyc_status` = 'verified'
- Subscription: `vendor_subscriptions.status` = 'active'

---

## 3. UI/UX Expectations

### 3.1 Registration Page

**Layout:**
- Clean, single-column form
- Progress indicator (Step 1 of 3)
- Clear field labels and validation messages
- Mobile-responsive design

**Components:**
- Text inputs for business information
- Dropdown for business type
- Address autocomplete (future)
- Form validation with real-time feedback
- Submit button with loading state

### 3.2 KYC Verification Page

**Layout:**
- Multi-step wizard interface
- Document upload zones (drag & drop)
- File preview after upload
- Progress indicator (Step 2 of 3)
- Clear instructions for each document type

**Components:**
- File upload component
- Document preview
- Step navigation (Next/Back)
- Upload progress indicators
- Success/error messages

### 3.3 Subscription Selection Page

**Layout:**
- Card-based tier comparison
- Feature comparison table
- Pricing display (monthly/annual toggle)
- Clear CTA buttons

**Components:**
- Subscription tier cards
- Feature list per tier
- Pricing calculator
- Payment method selector
- Payment processing modal

### 3.4 Dashboard Layout

**Structure:**
- Sidebar navigation
- Top header with notifications
- Main content area
- Breadcrumb navigation

**Dashboard Sections:**
- Overview (analytics snapshot)
- Products (catalog management)
- Orders (fulfillment)
- Analytics (reports)
- Finance (earnings, payouts)
- Settings (profile, subscription)

---

## 4. API Endpoints Involved

### 4.1 Registration Endpoints

**POST /api/vendor/register**
- **Request Body:**
  ```json
  {
    "business_name": "TechStore Kenya",
    "business_type": "retail",
    "email": "vendor@example.com",
    "phone": "+254700000000",
    "address": "123 Main St",
    "city": "Nairobi",
    "country": "Kenya",
    "tax_id": "P123456789",
    "business_registration_number": "C123456"
  }
  ```
- **Response:**
  ```json
  {
    "vendor_id": "uuid",
    "profile_id": "uuid",
    "status": "created",
    "next_step": "kyc_verification"
  }
  ```

### 4.2 KYC Endpoints

**POST /api/vendor/kyc/upload**
- **Request:** Multipart form data with document files
- **Response:**
  ```json
  {
    "document_id": "uuid",
    "document_type": "business_registration",
    "upload_status": "success",
    "kyc_status": "pending"
  }
  ```

**GET /api/vendor/kyc/status**
- **Response:**
  ```json
  {
    "kyc_status": "pending",
    "documents_submitted": 4,
    "documents_required": 5,
    "review_notes": null
  }
  ```

### 4.3 Subscription Endpoints

**GET /api/vendor/subscriptions/plans**
- **Response:**
  ```json
  {
    "plans": [
      {
        "tier": "basic",
        "monthly_fee": 2000,
        "annual_fee": 21600,
        "sku_limit": 50,
        "features": [...]
      }
    ]
  }
  ```

**POST /api/vendor/subscriptions/intent**
- **Request:**
  ```json
  {
    "tier": "silver",
    "billing_period": "monthly",
    "payment_method": "paystack"
  }
  ```
- **Response:**
  ```json
  {
    "subscription_id": "uuid",
    "payment_intent_id": "pi_xxx",
    "amount": 5500,
    "currency": "KES"
  }
  ```

**POST /api/vendor/subscriptions/confirm**
- **Request:**
  ```json
  {
    "subscription_id": "uuid",
    "payment_intent_id": "pi_xxx"
  }
  ```
- **Response:**
  ```json
  {
    "subscription_status": "active",
    "start_date": "2025-01-15T00:00:00Z",
    "end_date": "2025-02-15T00:00:00Z"
  }
  ```

### 4.4 Dashboard Endpoints

**GET /api/vendor/dashboard/overview**
- **Response:**
  ```json
  {
    "total_products": 45,
    "active_orders": 12,
    "total_sales": 150000,
    "pending_payouts": 50000,
    "recent_orders": [...]
  }
  ```

---

## 5. Acceptance Criteria

### 5.1 Registration
- ✅ User can complete registration form with all required fields
- ✅ System validates email format and phone number
- ✅ System creates vendor record upon successful registration
- ✅ User receives confirmation email
- ✅ User redirected to KYC verification step

### 5.2 KYC Verification
- ✅ User can upload all required KYC documents
- ✅ Documents are stored securely in Supabase Storage
- ✅ System tracks KYC status and document submission
- ✅ Admin receives notification for KYC review
- ✅ User can view KYC status and review notes
- ✅ User cannot proceed to subscription until KYC verified

### 5.3 Subscription
- ✅ User can view all available subscription tiers
- ✅ User can select monthly or annual billing
- ✅ System calculates correct pricing with discounts
- ✅ Payment processing works for all payment methods
- ✅ System creates subscription record upon payment
- ✅ User receives subscription confirmation

### 5.4 Dashboard Access
- ✅ Unauthenticated users redirected to registration
- ✅ Users without vendor role redirected to registration
- ✅ Users with pending KYC redirected to verification
- ✅ Users without active subscription redirected to subscription
- ✅ Verified vendors with active subscription can access dashboard
- ✅ Dashboard displays correct vendor data only

### 5.5 Error Handling
- ✅ Form validation errors displayed clearly
- ✅ Payment failures handled gracefully
- ✅ Network errors show retry options
- ✅ Invalid document uploads rejected with clear messages
- ✅ KYC rejection shows actionable feedback

---

## 6. Dependencies

### 6.1 Required Systems
- Supabase Auth (authentication)
- Supabase Storage (document storage)
- Payment gateways (Paystack, Stripe, M-Pesa)
- Email service (notifications)

### 6.2 Database Tables
- `profiles`
- `vendors`
- `vendor_subscriptions`
- `payments`
- `audit_log`

### 6.3 External Services
- Payment gateway APIs
- Email service (SendGrid/SMTP)
- Document verification service (future)

---

## 7. Security Considerations

### 7.1 Data Protection
- KYC documents encrypted at rest
- Secure file upload validation
- Payment data never stored (PCI-DSS compliance)
- PII data protected per GDPR/Kenya DPA

### 7.2 Access Control
- Row Level Security (RLS) on vendor data
- Vendor can only access own data
- Admins can view all vendor data (with audit log)
- KYC documents only accessible to vendor and admins

### 7.3 Audit Trail
- All registration actions logged
- KYC status changes logged
- Subscription changes logged
- Admin actions logged in `audit_log` table

---

## 8. Performance Requirements

### 8.1 Response Times
- Registration form submission: <2s
- Document upload: <5s per document
- Subscription selection: <1s
- Dashboard load: <3s

### 8.2 Scalability
- Support 100+ concurrent registrations
- Handle 1,000+ document uploads per day
- Process 500+ subscription payments per day

---

## 9. Related Documents
- Master PRD
- Database Schema & ERD
- API Specification & Integration Map
- Security, Compliance & Infrastructure Policy

---

## 10. Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | Product Team | Initial vendor registration specification |

---

**End of Feature Specification: Vendor Registration, Onboarding & Dashboard**
