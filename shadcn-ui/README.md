# The Bazaar - Marketplace PWA

A Netflix-inspired Progressive Web App marketplace connecting buyers with verified vendors across Kenya and beyond.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Storage)
- **Payments**: Paystack (primary for Kenya/M-Pesa), Stripe (global)
- **UI Components**: shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Real-time**: Supabase Realtime + WebRTC for voice calls
- **Translation**: Google Translate API
- **PWA**: vite-plugin-pwa
- **Hosting**: Vercel

## 📋 Features

### For Buyers
- Browse products with infinite scroll
- Netflix-inspired dark theme UI
- Advanced search and filtering
- Shopping cart and wishlist
- Multi-currency support (KES/USD)
- Real-time chat with vendors
- Voice calls with vendors
- AI-powered translation
- Product reviews and ratings
- Order tracking

### For Vendors
- Multi-tier subscription plans (Basic, Bronze, Silver, Gold, Platinum)
- Vendor dashboard with analytics
- Stock management
- Order fulfillment
- Branch management with discounts
- Staff role management
- Coupon creation
- Loyalty programs
- Real-time chat with customers
- KYC verification

### For Admins
- Vendor management and verification
- Platform analytics (MAV, GMV, etc.)
- Payment tracking
- KYC verification oversight
- Support chat monitoring
- Global coupon management
- International shipping configuration

## 🏗️ Project Structure

```
bazaar.manus/
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── marketplace/          # Marketplace components
│   │   ├── vendor/               # Vendor components
│   │   └── shared/               # Shared components
│   ├── pages/                    # Page components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utilities & configurations
│   └── App.tsx                   # Root component
├── lib/
│   ├── supabase/                 # Supabase client & utilities
│   ├── payments/                 # Payment integrations
│   └── utils/                    # Helper functions
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
└── supabase/                     # Database schema & migrations
```

## 🗄️ Database Schema

The application uses Supabase PostgreSQL with 18 core tables:

1. **profiles** - User accounts (buyers/vendors/admins)
2. **vendors** - Vendor business information
3. **vendor_subscriptions** - Subscription tiers & status
4. **vendor_staff** - Staff roles for vendor accounts
5. **products** - Product catalog
6. **product_variants** - Size, color, etc.
7. **categories** - 4-level category hierarchy
8. **orders** - Order management
9. **order_items** - Line items
10. **payments** - Payment records
11. **reviews** - Product reviews
12. **cart_items** - Shopping cart
13. **wishlists** - Wishlist items
14. **coupons** - Discount codes
15. **loyalty_programs** - Vendor loyalty programs
16. **chats** - Chat conversations
17. **messages** - Chat messages
18. **mega_brands** - Corporate brands

All tables include Row Level Security (RLS) policies for data protection.

## 💳 Subscription Tiers

| Tier | Monthly Fee | SKU Limit | Features |
|------|------------|-----------|----------|
| **Basic** | TBD | 0 | Directory only |
| **Bronze** | KES 2,000 | 100 | B2C, 1 user |
| **Silver** | KES 3,500 | 300 | B2B/B2C, Chat, Call, Mini-storefront |
| **Gold** | TBD | 500 | Analytics, Featured listing |
| **Platinum** | TBD | Unlimited | International, Premium analytics, Carousel |

### Branch Discounts
- **Single profile, multiple branches**: 40% off per branch
- **Separate profiles per branch**: 20% off each additional profile

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account
- Paystack account (for Kenya payments)
- Stripe account (for global payments)
- Google Cloud account (for Translation API)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bazaar.manus
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
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

4. Set up the database:
```bash
# Run the schema.sql file in your Supabase SQL editor
# The complete schema is in supabase/schema.sql
```

5. Run the development server:
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm run build
pnpm run start
```

## 🎨 Design Philosophy

The Bazaar follows a Netflix-inspired design approach:

- **Dark theme** with #141414 base color
- **Image-first** product cards (85% image coverage)
- **Smooth animations** and transitions
- **Auto-rotating carousels** (hourly rotation)
- **Minimal text**, maximum visual impact
- **Hover effects** for enhanced interactivity
- **Responsive grid** (3-10 columns based on screen size)

## 📱 PWA Features

- Offline functionality
- Install to home screen
- Push notifications
- Background sync
- Service worker caching

## 🔒 Security

- Row Level Security (RLS) on all database tables
- JWT-based authentication
- Secure payment processing
- KYC verification for vendors
- Rate limiting on API endpoints
- HTTPS only in production

## 📊 Key Performance Indicators (KPIs)

- Monthly Active Vendors (MAV)
- Gross Merchandise Volume (GMV)
- User Retention Rate
- Cart-to-purchase conversion
- Vendor Subscription Renewal Rate
- Average Load Time (<2s mobile target)

## 🤝 Contributing

This is a proprietary project. For questions or issues, contact the development team.

## 📄 License

Proprietary - All rights reserved

## 🔗 Links

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Paystack Documentation](https://paystack.com/docs)
- [Stripe Documentation](https://stripe.com/docs)

## 📞 Support

For support, email support@thebazaar.manus or join our community channels.

---

Built with ❤️ by The Bazaar Team