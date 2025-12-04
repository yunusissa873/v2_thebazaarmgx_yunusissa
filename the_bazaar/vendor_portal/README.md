# The Bazaar Vendor Portal

## Overview

The Vendor Portal is a Next.js application for vendor registration, KYC/KYB verification, subscription management, and dashboard access.

## Features

- **Vendor Registration**: Complete registration form with validation
- **KYC/KYB Verification**: Multi-step document upload wizard
- **Subscription Management**: Choose from 5 subscription plans (Basic, Bronze, Silver, Gold, Platinum)
- **Dashboard**: Protected routes with nested pages (Profile, Commerce, Analytics, Finance)
- **Access Control**: Mandatory KYC verification and active subscription required for dashboard access

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Testing**: Playwright + Axe

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
STAGING=true  # Enables mock payment responses
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## Testing

Run Playwright tests:

```bash
npm test
```

Run accessibility tests:

```bash
npm run test:axe
```

## Project Structure

```
/app
  /vendor
    /register       # Registration page
    /verify         # KYC/KYB verification
    /subscription   # Subscription selection
    /dashboard      # Protected dashboard routes
      /profile
      /commerce
      /analytics
      /finance
    /support        # Support center
/components/vendor  # Vendor-specific components
/lib
  /api             # API client functions
  /payments        # Payment integration stubs
/state             # Zustand store
/theme             # Brand kit tokens
/tests             # Playwright tests
```

## API Routes

All API routes are stubbed for development. In production, implement:

- `POST /api/vendor/register` - Vendor registration
- `POST /api/vendor/kyc/upload` - KYC document upload
- `GET /api/vendor/kyc/status` - Get KYC status
- `GET /api/vendor/subscriptions/plans` - List subscription plans
- `POST /api/vendor/subscriptions/intent` - Create payment intent
- `POST /api/vendor/subscriptions/confirm` - Confirm subscription payment
- `GET /api/vendor/subscriptions` - Get vendor subscription

## Access Control

Dashboard access requires:
1. **Authentication**: Vendor must be logged in
2. **KYC Verification**: `kycStatus === 'verified'`
3. **Active Subscription**: `subscription.status === 'active'`

If conditions are not met, users are redirected:
- Not authenticated → `/vendor/register`
- KYC not verified → `/vendor/verify`
- No active subscription → `/vendor/subscription`

## Subscription Plans

| Plan | Monthly (KES) | Annual Discount | SKU Limit |
|------|--------------|-----------------|-----------|
| Basic | 2,000 | 10% | 50 |
| Bronze | 3,500 | 10% | 150 |
| Silver | 5,500 | 10% | 500 |
| Gold | 7,500 | 10% | 1,000 |
| Platinum | 12,000 | 10% | Unlimited |

## Payment Integration

Payment providers are stubbed. Implement:

- **M-Pesa**: `/lib/payments/mpesa.ts` - Daraja API integration
- **Stripe**: `/lib/payments/stripe.ts` - Stripe API integration

In development/staging mode, mock responses are returned automatically.

## Brand Kit

The portal uses The Bazaar Brand Kit v2.1:
- **Primary Color**: #E50914 (Netflix red)
- **Secondary Color**: #808080 (Light grey)
- **Dark Background**: #1F1F1F
- **Light Background**: #F5F5F5

See `/theme/brandKit.ts` for all tokens.

## License

Private - The Bazaar
