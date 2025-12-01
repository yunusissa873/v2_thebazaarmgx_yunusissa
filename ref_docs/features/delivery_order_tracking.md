# Feature Specification: Delivery & Order Tracking
## The Bazaar Marketplace Platform

**Version:** 1.0.0  
**Date:** January 2025  
**Status:** Authoritative  
**Owner:** Product Management Team

---

## 1. Feature Purpose

This feature manages the order fulfillment lifecycle from order confirmation through delivery, including shipping address management, tracking number assignment, order status updates, and delivery confirmation. It ensures transparency for both vendors and customers throughout the delivery process.

---

## 2. Functional Flow

### 2.1 Order Fulfillment Flow

```
1. Order payment confirmed
2. System updates order status to 'confirmed'
3. Vendor receives notification
4. Vendor prepares order
5. Vendor marks order as 'processing'
6. Vendor adds tracking number (if available)
7. Vendor marks order as 'shipped'
8. System updates:
   - order.status = 'shipped'
   - order.tracking_number = 'xxx'
   - order.shipped_at = now
9. Customer receives notification
10. Customer can track delivery
```

### 2.2 Delivery Tracking Flow

```
1. Customer navigates to /orders/{order_id}
2. System displays:
   - Order status timeline
   - Tracking number (if shipped)
   - Estimated delivery date
   - Delivery address
3. Customer can:
   - View tracking details
   - Contact vendor
   - Report delivery issue
4. Delivery completed
5. Customer confirms delivery
6. System updates:
   - order.status = 'delivered'
   - order.delivered_at = now
7. Escrow released to vendor
```

### 2.3 Shipping Address Management Flow

```
1. Customer adds address during checkout
2. System validates address
3. System calculates shipping cost
4. Customer can save address for future
5. Customer can manage addresses in profile
6. System stores address in orders.shipping_address (JSONB)
```

### 2.4 Order Status Updates Flow

```
Order Statuses:
- pending: Payment not yet completed
- confirmed: Payment completed, awaiting processing
- processing: Vendor preparing order
- shipped: Order shipped, in transit
- delivered: Order delivered to customer
- cancelled: Order cancelled
- refunded: Order refunded

Status Transitions:
- pending → confirmed (on payment)
- confirmed → processing (vendor action)
- processing → shipped (vendor action)
- shipped → delivered (customer confirmation or auto)
- Any → cancelled (vendor/admin action)
- Any → refunded (admin action)
```

---

## 3. UI/UX Expectations

### 3.1 Order Details Page

**Layout:**
- Order summary card
- Status timeline (visual progress)
- Order items list
- Shipping address
- Tracking information
- Action buttons

**Components:**
- Status indicator
- Timeline component
- Tracking number display
- Map view (future)
- Contact vendor button

### 3.2 Vendor Order Management

**Layout:**
- Order list table
- Filter by status
- Bulk actions
- Order detail view

**Components:**
- Status dropdown
- Tracking number input
- Mark as shipped button
- Print shipping label (future)

### 3.3 Shipping Address Form

**Components:**
- Address input fields
- City/Country dropdowns
- Postal code input
- Address validation
- Save for future checkbox

---

## 4. API Endpoints Involved

### 4.1 Order Management

**GET /rest/v1/orders?buyer_id=eq.{user_id}**
- **Response:** User's orders

**GET /rest/v1/orders/{id}**
- **Response:** Order details with items

**PATCH /rest/v1/orders?id=eq.{id}**
- **Request:**
  ```json
  {
    "status": "shipped",
    "tracking_number": "TRACK123456",
    "shipped_at": "2025-01-15T10:00:00Z"
  }
  ```

### 4.2 Order Status Updates

**POST /api/orders/{id}/update-status**
- **Request:**
  ```json
  {
    "status": "processing",
    "notes": "Preparing order"
  }
  ```

**POST /api/orders/{id}/confirm-delivery**
- **Request:**
  ```json
  {
    "delivered_at": "2025-01-20T14:00:00Z"
  }
  ```

### 4.3 Shipping Address

**POST /api/addresses**
- **Request:**
  ```json
  {
    "user_id": "uuid",
    "label": "Home",
    "address": "123 Main St",
    "city": "Nairobi",
    "country": "Kenya",
    "postal_code": "00100"
  }
  ```

**GET /api/addresses?user_id=eq.{user_id}**
- **Response:** User's saved addresses

### 4.4 Tracking

**GET /api/orders/{id}/tracking**
- **Response:**
  ```json
  {
    "tracking_number": "TRACK123456",
    "status": "in_transit",
    "estimated_delivery": "2025-01-20",
    "carrier": "DHL",
    "tracking_url": "https://..."
  }
  ```

---

## 5. Acceptance Criteria

### 5.1 Order Fulfillment
- ✅ Vendor can view orders
- ✅ Vendor can update order status
- ✅ Vendor can add tracking number
- ✅ Status updates trigger notifications
- ✅ Order timeline displays correctly

### 5.2 Delivery Tracking
- ✅ Customer can view order status
- ✅ Tracking number displays
- ✅ Status timeline works
- ✅ Delivery confirmation works
- ✅ Escrow releases on delivery

### 5.3 Shipping Address
- ✅ Address form validates
- ✅ Shipping cost calculates
- ✅ Address saves correctly
- ✅ Multiple addresses supported

### 5.4 Notifications
- ✅ Order confirmation sent
- ✅ Shipping notification sent
- ✅ Delivery notification sent
- ✅ Status change notifications work

---

## 6. Dependencies

### 6.1 Required Systems
- Supabase (database)
- Email service (notifications)
- SMS service (future)
- Tracking API (future)

### 6.2 Database Tables
- `orders`
- `order_items`
- `escrow_accounts`
- `communication_logs`

### 6.3 External Services
- Email service
- SMS gateway (future)
- Shipping carrier APIs (future)

---

## 7. Related Documents
- Master PRD
- Database Schema & ERD
- Payment, Wallet & Transactions
- API Specification & Integration Map

---

## 8. Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | Product Team | Initial delivery specification |

---

**End of Feature Specification: Delivery & Order Tracking**
