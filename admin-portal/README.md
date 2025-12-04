# The Bazaar - Admin Portal

Enterprise-grade admin portal for managing The Bazaar marketplace platform.

## Features

### Core Management
- **Vendor Management**: Approval workflow, KYC review, profile management
- **User Management**: User list, role assignment, suspension/ban
- **Product Moderation**: Product list, bulk actions, category management
- **Order Management**: Order tracking, status updates, dispute resolution, refunds

### Financial Management
- **Finance Dashboard**: Revenue overview, KPIs, financial reports
- **Payout Management**: Vendor wallet management, payout processing
- **Subscription Revenue**: MRR tracking, subscription management
- **Escrow Accounts**: Order escrow monitoring and management
- **Payment Tracking**: All payment transactions

### Security & Compliance
- **Security Dashboard**: Real-time security event monitoring
- **Fraud Monitoring**: Fraud detection alerts and investigation
- **Audit Logs**: Complete audit trail of all admin actions
- **Access Control**: Admin user management and permissions

### Analytics & Reporting
- **Platform KPIs**: Real-time metrics and analytics
- **Financial Reports**: Revenue, commissions, payouts
- **Custom Reports**: Generate and export reports

### Content Moderation
- **Review Moderation**: Approve/reject product reviews
- **Banner Management**: Manage promotional banners
- **Content Flags**: Review flagged content

### System Configuration
- **Platform Settings**: General platform configuration
- **Payment Settings**: Payment gateway configuration
- **Feature Flags**: Enable/disable platform features
- **Maintenance Mode**: Platform maintenance control

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui
- **State Management**: TanStack Query, Zustand
- **Backend**: Supabase (PostgreSQL, Auth)
- **Charts**: Recharts
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account with admin access

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Run the development server:
```bash
pnpm dev
```

The admin portal will be available at `http://localhost:3001`

## Project Structure

```
admin-portal/
├── src/
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── lib/            # Utilities and API
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React contexts
│   └── types/          # TypeScript types
```

## Security

- Admin-only access with role-based authentication
- All actions are logged in audit_log table
- Service role key used for elevated permissions (server-side only)
- IP whitelisting support
- 2FA enforcement for admin users

## Integration

The admin portal is separate but interlinked with:
- **Main App** (The Bazaar): Customer-facing marketplace
- **Vendor Portal**: Vendor dashboard for store management

All three applications share the same Supabase backend and database.


