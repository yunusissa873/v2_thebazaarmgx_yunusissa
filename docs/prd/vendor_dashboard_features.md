# PRD: Vendor Dashboard Features
**Author:** Emma, Product Manager
**Date:** 2025-10-31
**Status:** Draft

## 1. Overview
This document outlines the feature requirements for the Vendor Dashboard, a new, separate portal for "The Bazaar" marketplace. This dashboard will serve as the central command center for vendors to manage their storefronts, products, and orders independently.

**Key Constraints:**
- **Separate Portal:** The Vendor Dashboard MUST be a distinct application from the customer-facing storefront.
- **Access Control:**
    - Each vendor's access is strictly limited to their own data (products, orders, analytics).
    - The Admin team MUST have supervisory access to all vendor dashboards for oversight, support, and governance.

## 2. Feature Categorization

Features are categorized into three tiers to guide a phased development approach:
- **Basic (MVP):** The absolute minimum required for a vendor to operate.
- **Core:** Standard features expected in any modern e-commerce marketplace.
- **Optional Add-ons:** Advanced features that enhance productivity, marketing, and analytics capabilities.

---

### 2.1. Basic Features (MVP)

These features represent the minimum viable product to launch the vendor portal.

#### **B1: Secure Authentication & Profile Management**
- **Description:** A secure login system for the separate vendor portal. Once logged in, vendors can manage their public-facing profile.
- **User Stories:**
    - As a new vendor, I want a simple and secure registration and login process so that I can access my dashboard.
    - As a vendor, I want to update my shop name, logo, and description so that I can brand my storefront.
- **Access:** Vendor (own profile), Admin (view/edit all profiles).

#### **B2: Product & Inventory Management (Simplified)**
- **Description:** Basic functionality to create, view, edit, and delete product listings. Includes essential inventory tracking.
- **User Stories:**
    - As a vendor, I want to add a new product with a title, description, price, and images so that customers can see what I'm selling.
    - As a vendor, I want to manually update the stock quantity for my products so that I can prevent overselling.
    - As a vendor, I want to see a list of all my products so I can manage my catalog.
- **Access:** Vendor (own products), Admin (view/edit all products).

#### **B3: Order Management & Fulfillment**
- **Description:** A centralized view of incoming orders with the ability to manage their status.
- **User Stories:**
    - As a vendor, I want to receive a notification for new orders so that I can process them quickly.
    - As a vendor, I want to view order details (customer info, products purchased) so that I can prepare the shipment.
    - As a vendor, I want to mark an order as "Shipped" and add a tracking number so that the customer is notified.
- **Access:** Vendor (own orders), Admin (view all orders).

---

### 2.2. Core Features

These features are standard expectations for a competitive marketplace dashboard.

#### **C1: Main Dashboard & Analytics Snapshot**
- **Description:** A home screen that provides an at-a-glance overview of key business metrics and pending tasks.
- **User Stories:**
    - As a vendor, I want to see my total sales, number of orders, and visitor count on a single dashboard so I can quickly check my business performance.
    - As a vendor, I want to see a list of urgent tasks (e.g., "3 new orders to fulfill") so I know what to prioritize.
- **Access:** Vendor (own data), Admin (can view individual vendor dashboards).

#### **C2: Advanced Product Management**
- **Description:** Enhancements to product management, including variations, bulk actions, and organization.
- **User Stories:**
    - As a vendor, I want to add product variations (e.g., size, color) so that I can sell different versions of the same item.
    - As a vendor, I want to bulk-edit the prices of multiple products at once to save time during a sale.
- **Access:** Vendor (own products), Admin (view/edit all products).

#### **C3: Financial Management & Payouts**
- **Description:** Transparent tracking of earnings, commission deductions, and payout history.
- **User Stories:**
    - As a vendor, I want to see a clear breakdown of my earnings, including marketplace commissions, for each sale so I understand my revenue.
    - As a vendor, I want to view my payout history and upcoming payout schedule so I can manage my finances.
- **Access:** Vendor (own financial data), Admin (view all financial data for reconciliation).

#### **C4: Customer Communication Hub**
- **Description:** An integrated messaging system for vendors to communicate directly with buyers.
- **User Stories:**
    - As a vendor, I want to receive and reply to messages from customers regarding their orders so that I can provide good customer service.
- **Access:** Vendor (own messages), Admin (can monitor messages for dispute resolution).

#### **C5: Ratings & Reviews Management**
- **Description:** A tool to view and respond to customer reviews.
- **User Stories:**
    - As a vendor, I want to be notified of new reviews so I can monitor my reputation.
    - As a vendor, I want the ability to publicly reply to a review to thank a customer or address a concern.
- **Access:** Vendor (own reviews), Admin (view all reviews).

---

### 2.3. Optional Add-ons (Future Enhancements)

These are advanced features that can be added post-launch to provide more value and drive vendor growth.

#### **O1: Advanced Analytics & Reporting**
- **Description:** In-depth reports on sales trends, customer behavior, and product performance.
- **User Stories:**
    - As a vendor, I want to see which of my products are best-sellers so I can optimize my inventory.
    - As a vendor, I want to understand my traffic sources (e.g., direct, social media) so I can focus my marketing efforts.
- **Access:** Vendor (own analytics), Admin (platform-wide and per-vendor analytics).

#### **O2: Marketing & Promotions Tools**
- **Description:** Self-service tools for vendors to create discounts and run promotional campaigns.
- **User Stories:**
    - As a vendor, I want to create a discount code (e.g., "10% off") so I can run a marketing campaign.
    - As a vendor, I want to put specific items on sale for a limited time to drive conversions.
- **Access:** Vendor (own promotions), Admin (view/approve promotions).

#### **O3: Automated Inventory & Low-Stock Alerts**
- **Description:** Automated stock level adjustments and proactive alerts.
- **User Stories:**
    - As a vendor, I want to receive an email alert when a product's stock level falls below 5 units so I know when to restock.
- **Access:** Vendor (own alerts), Admin (platform-level inventory insights).

#### **O4: AI-Powered Tools**
- **Description:** Integration of AI to help vendors optimize their listings and communications.
- **User Stories:**
    - As a vendor, I want AI-powered suggestions for my product titles and descriptions to improve my SEO.
    - As a vendor, I want an AI assistant to help me draft quick replies to common customer questions.
- **Access:** Vendor (own usage).