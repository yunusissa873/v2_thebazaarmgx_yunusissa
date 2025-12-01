# Feature Specification: Admin Console
## The Bazaar Marketplace Platform

**Version:** 1.0.0  
**Date:** January 2025  
**Status:** Authoritative  
**Owner:** Product Management Team

---

## 1. Feature Purpose

The Admin Console provides platform administrators with comprehensive tools to manage vendors, monitor platform health, reconcile payments, detect fraud, handle support tickets, and configure system settings. It ensures platform governance, security, and operational excellence.

---

## 2. Functional Flow

### 2.1 Vendor Management Flow

```
1. Admin navigates to /admin/vendors
2. System displays vendor list with filters:
   - KYC status
   - Subscription status
   - Verification status
   - Registration date
3. Admin clicks on vendor
4. System displays vendor details:
   - Business information
   - KYC documents
   - Subscription details
   - Product count
   - Order history
   - Financial summary
5. Admin can:
   - Verify/reject KYC
   - Approve/suspend vendor
   - View/edit vendor details
   - View vendor analytics
```

### 2.2 Platform Analytics Flow

```
1. Admin navigates to /admin/analytics
2. System displays dashboard:
   - MAV (Monthly Active Vendors)
   - GMV (Gross Merchandise Volume)
   - Total orders
   - Revenue breakdown
   - User growth
   - Retention metrics
3. Admin can filter by date range
4. Admin can export reports
```

### 2.3 Payment Reconciliation Flow

```
1. Admin navigates to /admin/payments
2. System displays payment list with filters
3. Admin can:
   - View payment details
   - Reconcile payments
   - Process refunds
   - View vendor payouts
   - Export payment reports
```

### 2.4 Fraud Detection Flow

```
1. System detects suspicious activity
2. System creates fraud alert in `fraud_alerts` table
3. Admin receives notification
4. Admin navigates to /admin/fraud
5. Admin reviews alert details
6. Admin investigates (view related orders/users)
7. Admin resolves alert:
   - Mark as resolved
   - Mark as false positive
   - Take action (suspend account, etc.)
```

### 2.5 Support Ticket Flow

```
1. User/vendor creates support ticket
2. System creates ticket in `support_tickets` table
3. Admin receives notification
4. Admin navigates to /admin/support
5. Admin views ticket list
6. Admin assigns ticket to self or team member
7. Admin responds to ticket
8. Admin resolves/closes ticket
```

---

## 3. UI/UX Expectations

### 3.1 Admin Dashboard Layout

**Structure:**
- Sidebar navigation
- Top header with notifications
- Main content area with tabs
- Data tables with sorting/filtering
- Action buttons (verify, approve, etc.)

**Dashboard Sections:**
- Overview (key metrics)
- Vendors (management)
- Orders (monitoring)
- Payments (reconciliation)
- Analytics (reports)
- Support (tickets)
- Settings (system configuration)
- Security (fraud alerts, security events)

### 3.2 Vendor Management Interface

**Components:**
- Vendor list table (sortable, filterable)
- Vendor detail modal/page
- KYC document viewer
- Action buttons (verify, suspend, etc.)
- Bulk actions (future)

### 3.3 Analytics Dashboard

**Components:**
- Metric cards (MAV, GMV, etc.)
- Charts (line, bar, pie)
- Date range picker
- Export buttons
- Filter controls

---

## 4. API Endpoints Involved

### 4.1 Vendor Management

**GET /api/admin/vendors**
- **Query Parameters:**
  - `kyc_status=eq.pending`
  - `is_verified=eq.false`
  - `limit=50`
  - `offset=0`
- **Response:** Vendor list with details

**PATCH /api/admin/vendors/{id}/verify**
- **Request:**
  ```json
  {
    "kyc_status": "verified",
    "notes": "Documents verified"
  }
  ```

**PATCH /api/admin/vendors/{id}/suspend**
- **Request:**
  ```json
  {
    "reason": "Policy violation",
    "suspended_until": "2025-02-15T00:00:00Z"
  }
  ```

### 4.2 Analytics

**GET /api/admin/analytics/overview**
- **Query Parameters:**
  - `start_date=2025-01-01`
  - `end_date=2025-01-31`
- **Response:**
  ```json
  {
    "mav": 150,
    "gmv": 5000000,
    "total_orders": 1200,
    "revenue": 500000,
    "user_growth": 15.5,
    "retention_rate": 65.2
  }
  ```

### 4.3 Payments

**GET /api/admin/payments**
- **Response:** Payment list with reconciliation status

**POST /api/admin/payments/{id}/reconcile**
- **Request:**
  ```json
  {
    "status": "reconciled",
    "notes": "Payment verified"
  }
  ```

### 4.4 Fraud Detection

**GET /api/admin/fraud/alerts**
- **Response:** Fraud alerts list

**PATCH /api/admin/fraud/alerts/{id}/resolve**
- **Request:**
  ```json
  {
    "status": "resolved",
    "resolution_notes": "False positive",
    "action_taken": null
  }
  ```

### 4.5 Support Tickets

**GET /api/admin/support/tickets**
- **Response:** Support tickets list

**PATCH /api/admin/support/tickets/{id}**
- **Request:**
  ```json
  {
    "status": "in_progress",
    "assigned_to": "admin_uuid",
    "response": "We are looking into this issue..."
  }
  ```

---

## 5. Acceptance Criteria

### 5.1 Vendor Management
- ✅ Admin can view all vendors
- ✅ Admin can filter vendors by status
- ✅ Admin can verify/reject KYC
- ✅ Admin can approve/suspend vendors
- ✅ All actions logged in audit_log
- ✅ Admin can view vendor analytics

### 5.2 Analytics
- ✅ Dashboard displays key metrics
- ✅ Charts render correctly
- ✅ Date filtering works
- ✅ Reports can be exported
- ✅ Data updates in real-time

### 5.3 Payment Reconciliation
- ✅ Admin can view all payments
- ✅ Admin can reconcile payments
- ✅ Admin can process refunds
- ✅ Payment reports can be exported

### 5.4 Fraud Detection
- ✅ Fraud alerts are created automatically
- ✅ Admin receives notifications
- ✅ Admin can investigate alerts
- ✅ Admin can resolve alerts
- ✅ Actions are logged

### 5.5 Support Tickets
- ✅ Admin can view all tickets
- ✅ Admin can assign tickets
- ✅ Admin can respond to tickets
- ✅ Admin can resolve tickets
- ✅ Ticket status updates correctly

### 5.6 Security
- ✅ Only admins can access console
- ✅ All actions are audited
- ✅ RLS policies enforced
- ✅ Sensitive data protected

---

## 6. Dependencies

### 6.1 Required Systems
- Supabase (database, auth)
- Analytics service
- Email service (notifications)

### 6.2 Database Tables
- `profiles` (admin users)
- `vendors`
- `orders`
- `payments`
- `fraud_alerts`
- `security_events`
- `support_tickets`
- `audit_log`
- `admin_permissions`

### 6.3 External Services
- Analytics tools
- Email service
- Fraud detection service (future)

---

## 7. Security Considerations

### 7.1 Access Control
- Admin-only access (role='admin')
- Granular permissions via `admin_permissions`
- RLS policies for data access
- Audit logging for all actions

### 7.2 Data Protection
- Sensitive data encrypted
- PII data protected
- Payment data access restricted
- Audit trails maintained

---

## 8. Related Documents
- Master PRD
- Database Schema & ERD
- Security, Compliance & Infrastructure Policy
- Analytics, Tracking & Reporting Plan

---

## 9. Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | Product Team | Initial admin console specification |

---

**End of Feature Specification: Admin Console**
