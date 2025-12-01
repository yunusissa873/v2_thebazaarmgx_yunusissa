# Feature Specification: Shopper Experience
## The Bazaar Marketplace Platform

**Version:** 1.0.0  
**Date:** January 2025  
**Status:** Authoritative  
**Owner:** Product Management Team

---

## 1. Feature Purpose

This feature provides shoppers with a Netflix-inspired browsing experience to discover, evaluate, and purchase products from verified vendors. It includes product browsing, cart management, wishlist functionality, checkout process, and order tracking.

---

## 2. Functional Flow

### 2.1 Product Browsing Flow

```
1. User lands on homepage (/)
2. System displays:
   - Featured product carousel (auto-rotating)
   - Category carousels
   - Trending products
   - New arrivals
3. User scrolls (infinite scroll)
4. System loads more products asynchronously
5. User clicks product card
6. System navigates to /products/{slug}
```

**Browsing Features:**
- Infinite scroll product grid
- Category-based navigation
- Featured product carousels
- Trending products section
- New arrivals section
- Vendor spotlight sections

### 2.2 Product Detail Flow

```
1. User views product page
2. System displays:
   - Product images (gallery)
   - Product title and description
   - Price and variants
   - Stock availability
   - Vendor information
   - Reviews and ratings
3. User selects variant (if applicable)
4. User clicks "Add to Cart" or "Add to Wishlist"
5. System updates cart/wishlist
6. User can proceed to checkout or continue shopping
```

### 2.3 Shopping Cart Flow

```
1. User clicks cart icon
2. System displays cart items
3. User can:
   - Update quantities
   - Remove items
   - Apply coupon codes
   - View subtotal, tax, shipping
4. User clicks "Proceed to Checkout"
5. System navigates to /checkout
```

### 2.4 Checkout Flow

```
1. User lands on /checkout
2. System displays:
   - Cart summary
   - Shipping address form
   - Payment method selection
   - Order summary
3. User fills shipping address
4. User selects payment method (M-Pesa, Paystack, Stripe)
5. User reviews order total
6. User clicks "Place Order"
7. System creates order record
8. System processes payment
9. System redirects to /orders/{order_id}
```

### 2.5 Wishlist Flow

```
1. User clicks wishlist icon on product
2. System adds product to wishlist
3. User navigates to /wishlist
4. System displays wishlist items
5. User can:
   - Move items to cart
   - Remove items
   - Share wishlist (future)
```

### 2.6 Review & Rating Flow

```
1. User receives order delivery
2. User navigates to /orders/{order_id}
3. User clicks "Write Review"
4. User fills review form:
   - Rating (1-5 stars)
   - Title
   - Comment
   - Photos (optional)
5. User submits review
6. System creates review record
7. System updates product rating
8. Review appears on product page (after approval)
```

---

## 3. UI/UX Expectations

### 3.1 Homepage Design

**Netflix-Inspired Layout:**
- Dark theme (#141414 background)
- Large, image-first product cards
- Smooth horizontal scrolling carousels
- Minimal text, maximum visual impact
- Auto-rotating featured carousel (hourly)

**Components:**
- Hero carousel (featured products)
- Category carousels (horizontal scroll)
- Product grid (infinite scroll)
- Search bar (top navigation)
- User menu (cart, wishlist, profile)

### 3.2 Product Card Design

**Visual Hierarchy:**
- 85% image coverage
- Product title (truncated)
- Price (prominent)
- Rating stars
- "Add to Cart" button (on hover)
- Vendor badge

**Hover Effects:**
- Image zoom
- Button appearance
- Quick view option (future)

### 3.3 Product Detail Page

**Layout:**
- Image gallery (left)
- Product info (right)
- Sticky add-to-cart section
- Reviews section (below)
- Related products (bottom)

**Components:**
- Image carousel/gallery
- Variant selector
- Quantity selector
- Add to cart/wishlist buttons
- Vendor profile card
- Review section with filters

### 3.4 Cart Page

**Layout:**
- Cart items list (left)
- Order summary (right, sticky)
- Coupon code input
- Shipping calculator

**Components:**
- Cart item cards
- Quantity controls
- Remove item button
- Coupon input
- Order summary card
- Checkout button

### 3.5 Checkout Page

**Layout:**
- Multi-step form
- Progress indicator
- Order summary sidebar

**Steps:**
1. Shipping address
2. Payment method
3. Review & confirm

---

## 4. API Endpoints Involved

### 4.1 Product Browsing

**GET /rest/v1/products**
- **Query Parameters:**
  - `is_active=eq.true`
  - `is_featured=eq.true` (for featured)
  - `order=created_at.desc` (for new arrivals)
  - `limit=20`
  - `offset=0`
- **Response:** Array of product objects

**GET /rest/v1/products/{id}**
- **Response:** Single product with variants, reviews

### 4.2 Cart Management

**GET /rest/v1/cart_items?buyer_id=eq.{user_id}**
- **Response:** User's cart items

**POST /rest/v1/cart_items**
- **Request:**
  ```json
  {
    "buyer_id": "uuid",
    "product_id": "uuid",
    "variant_id": "uuid",
    "quantity": 2
  }
  ```

**PATCH /rest/v1/cart_items?id=eq.{id}**
- **Request:**
  ```json
  {
    "quantity": 3
  }
  ```

**DELETE /rest/v1/cart_items?id=eq.{id}**

### 4.3 Wishlist Management

**GET /rest/v1/wishlists?buyer_id=eq.{user_id}**
- **Response:** User's wishlist items

**POST /rest/v1/wishlists**
- **Request:**
  ```json
  {
    "buyer_id": "uuid",
    "product_id": "uuid"
  }
  ```

**DELETE /rest/v1/wishlists?id=eq.{id}**

### 4.4 Order Placement

**POST /api/orders/create**
- **Request:**
  ```json
  {
    "buyer_id": "uuid",
    "items": [
      {
        "product_id": "uuid",
        "variant_id": "uuid",
        "quantity": 2
      }
    ],
    "shipping_address": {...},
    "payment_method": "paystack"
  }
  ```
- **Response:**
  ```json
  {
    "order_id": "uuid",
    "order_number": "ORD-2025-001",
    "payment_intent_id": "pi_xxx",
    "total": 15000.00
  }
  ```

### 4.5 Reviews

**POST /rest/v1/reviews**
- **Request:**
  ```json
  {
    "product_id": "uuid",
    "buyer_id": "uuid",
    "order_id": "uuid",
    "rating": 5,
    "title": "Great product!",
    "comment": "Very satisfied with purchase",
    "images": ["url1", "url2"]
  }
  ```

**GET /rest/v1/reviews?product_id=eq.{id}&is_approved=eq.true**
- **Response:** Approved reviews for product

---

## 5. Acceptance Criteria

### 5.1 Product Browsing
- ✅ Homepage loads in <2s
- ✅ Infinite scroll works smoothly
- ✅ Product cards display correctly
- ✅ Carousels auto-rotate
- ✅ Category navigation works
- ✅ Search functionality works

### 5.2 Product Detail
- ✅ Product page loads with all information
- ✅ Image gallery works
- ✅ Variant selection updates price
- ✅ Stock availability displays correctly
- ✅ Add to cart/wishlist works
- ✅ Reviews display correctly

### 5.3 Shopping Cart
- ✅ Cart persists across sessions
- ✅ Quantity updates work
- ✅ Item removal works
- ✅ Coupon codes apply correctly
- ✅ Order summary calculates correctly
- ✅ Cart icon shows item count

### 5.4 Checkout
- ✅ Shipping address form validates
- ✅ Payment method selection works
- ✅ Order creation succeeds
- ✅ Payment processing works
- ✅ Order confirmation displays
- ✅ Email confirmation sent

### 5.5 Wishlist
- ✅ Add to wishlist works
- ✅ Wishlist page displays items
- ✅ Move to cart works
- ✅ Remove from wishlist works
- ✅ Wishlist persists across sessions

### 5.6 Reviews
- ✅ Review form validates
- ✅ Review submission works
- ✅ Reviews appear after approval
- ✅ Product rating updates
- ✅ Verified purchase badge shows

---

## 6. Dependencies

### 6.1 Required Systems
- Supabase (database, auth)
- Payment gateways
- Email service
- Image storage (Supabase Storage)

### 6.2 Database Tables
- `products`
- `product_variants`
- `cart_items`
- `wishlists`
- `orders`
- `order_items`
- `reviews`
- `payments`

### 6.3 External Services
- Payment gateway APIs
- Email service
- Image CDN

---

## 7. Performance Requirements

### 7.1 Response Times
- Homepage load: <2s
- Product page load: <1.5s
- Cart update: <500ms
- Checkout submission: <3s

### 7.2 Scalability
- Support 1,000+ concurrent users
- Handle 10,000+ products
- Process 1,000+ orders per day

---

## 8. Related Documents
- Master PRD
- Database Schema & ERD
- API Specification & Integration Map
- UI/UX Design System

---

## 9. Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | Product Team | Initial shopper experience specification |

---

**End of Feature Specification: Shopper Experience**
