# Feature Specification: Payment, Wallet & Transactions
## The Bazaar Marketplace Platform

**Version:** 1.0.0  
**Date:** January 2025  
**Status:** Authoritative  
**Owner:** Product Management Team

---

## 1. Feature Purpose

This feature handles all payment processing for orders and subscriptions, manages vendor wallets and payouts, implements escrow accounts for order protection, and maintains comprehensive transaction history. It integrates with multiple payment gateways (Paystack, Stripe, M-Pesa) to support both Kenyan and international transactions.

---

## 2. Functional Flow

### 2.1 Order Payment Flow

```
1. Customer completes checkout
2. System creates order record
3. System creates payment intent:
   - Amount calculation (subtotal + tax + shipping - discount)
   - Payment method selection
   - Gateway selection (based on method)
4. Customer redirected to payment gateway
5. Payment processed by gateway
6. Webhook received from gateway
7. System updates payment record
8. System updates order status to 'confirmed'
9. System creates escrow account
10. Customer receives confirmation
11. Vendor receives notification
```

### 2.2 Subscription Payment Flow

```
1. Vendor selects subscription tier
2. System calculates subscription fee
3. System creates payment intent
4. Payment processed
5. Webhook received
6. System creates/updates vendor_subscription
7. System grants vendor access
8. Vendor receives confirmation
```

### 2.3 Escrow Management Flow

```
1. Order payment confirmed
2. System creates escrow_account:
   - Amount = order total - commission
   - Status = 'held'
   - Held until = delivery_date + 7 days
3. Order delivered
4. Customer confirms delivery
5. System releases escrow:
   - Status = 'released'
   - Amount transferred to vendor_wallet
   - Released_at timestamp set
6. Vendor receives payout
```

### 2.4 Vendor Payout Flow

```
1. Escrow released to vendor_wallet
2. System updates vendor_wallet:
   - balance += escrow amount
   - total_earnings += escrow amount
3. Vendor requests payout (or automatic)
4. System processes payout:
   - Deduct from balance
   - Create payout record
   - Transfer via M-Pesa B2C or bank transfer
5. System updates vendor_wallet:
   - balance -= payout amount
   - total_payouts += payout amount
   - last_payout_at = now
```

---

## 3. UI/UX Expectations

### 3.1 Payment Selection

**Components:**
- Payment method cards (M-Pesa, Paystack, Stripe)
- Method icons
- Security badges
- Selected state indicator

### 3.2 Payment Processing

**Components:**
- Loading spinner
- Payment gateway redirect
- Success/error messages
- Retry button (on failure)

### 3.3 Vendor Wallet Dashboard

**Components:**
- Balance display
- Pending payouts
- Total earnings
- Payout history table
- Request payout button

### 3.4 Transaction History

**Components:**
- Transaction list table
- Filter by type/date
- Export button
- Transaction details modal

---

## 4. API Endpoints Involved

### 4.1 Payment Processing

**POST /api/payments/create-intent**
- **Request:**
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
    "redirect_url": "https://paystack.com/..."
  }
  ```

**POST /api/payments/verify**
- **Request:**
  ```json
  {
    "payment_intent_id": "pi_xxx",
    "provider_transaction_id": "ref_xxx"
  }
  ```

### 4.2 Webhook Handlers

**POST /api/webhooks/paystack**
- **Request:** Paystack webhook payload
- **Actions:**
  - Verify signature
  - Update payment record
  - Update order status
  - Create escrow account

**POST /api/webhooks/stripe**
- **Request:** Stripe webhook payload

**POST /api/webhooks/mpesa**
- **Request:** M-Pesa webhook payload

### 4.3 Vendor Wallet

**GET /api/vendor/wallet**
- **Response:**
  ```json
  {
    "balance": 50000.00,
    "pending_payouts": 20000.00,
    "total_earnings": 500000.00,
    "total_payouts": 450000.00,
    "last_payout_at": "2025-01-10T00:00:00Z"
  }
  ```

**POST /api/vendor/wallet/payout-request**
- **Request:**
  ```json
  {
    "amount": 50000.00,
    "payment_method": "mpesa",
    "account_number": "254700000000"
  }
  ```

### 4.4 Escrow Management

**GET /api/escrow/{order_id}**
- **Response:** Escrow account details

**POST /api/escrow/{order_id}/release**
- **Request:**
  ```json
  {
    "reason": "order_delivered"
  }
  ```

---

## 5. Acceptance Criteria

### 5.1 Payment Processing
- ✅ Payment intents created correctly
- ✅ Gateway redirects work
- ✅ Webhooks processed correctly
- ✅ Payment records updated
- ✅ Order status updates
- ✅ Escrow accounts created

### 5.2 Multiple Gateways
- ✅ Paystack integration works
- ✅ Stripe integration works
- ✅ M-Pesa integration works
- ✅ Gateway selection logic works
- ✅ Fallback handling works

### 5.3 Escrow Management
- ✅ Escrow created on payment
- ✅ Escrow held correctly
- ✅ Escrow released on delivery
- ✅ Vendor wallet updated
- ✅ Commission deducted correctly

### 5.4 Vendor Payouts
- ✅ Payout requests processed
- ✅ Balance updates correctly
- ✅ Payout history tracked
- ✅ M-Pesa B2C works
- ✅ Bank transfers work (future)

### 5.5 Security
- ✅ Webhook signatures verified
- ✅ Payment data encrypted
- ✅ PCI-DSS compliance
- ✅ Fraud detection works

---

## 6. Dependencies

### 6.1 Required Systems
- Payment gateways (Paystack, Stripe, M-Pesa)
- Supabase (database)
- Webhook handlers (Edge Functions)

### 6.2 Database Tables
- `payments`
- `orders`
- `vendor_subscriptions`
- `escrow_accounts`
- `vendor_wallets`
- `fraud_alerts`

### 6.3 External Services
- Paystack API
- Stripe API
- M-Pesa Daraja API
- Bank API (for payouts)

---

## 7. Security Considerations

### 7.1 Payment Security
- PCI-DSS compliance
- Webhook signature verification
- Encrypted payment data
- Secure API keys storage

### 7.2 Fraud Prevention
- Transaction monitoring
- Fraud alert system
- Rate limiting
- Suspicious activity detection

---

## 8. Related Documents
- Master PRD
- Database Schema & ERD
- API Specification & Integration Map
- Security, Compliance & Infrastructure Policy

---

## 9. Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | Product Team | Initial payment specification |

---

**End of Feature Specification: Payment, Wallet & Transactions**
