# System Design: Vendor Dashboard

**Author:** Bob, Architect
**Date:** 2025-10-31
**Status:** Initial Draft

## 1. Implementation Approach

We will develop a new, standalone frontend application for the Vendor Dashboard using React, Vite, and shadcn-ui. This approach ensures a clean separation from the customer-facing storefront, simplifying development, deployment, and security.

The backend will leverage our existing Supabase project. We will enforce strict access control using a combination of Supabase's Row Level Security (RLS) policies and business logic within Deno Edge Functions. A `role` field will be added to the user profiles to manage permissions for `vendor` and `admin` users.

Development will follow the phased approach from the PRD, starting with the **Basic (MVP)** features.

## 2. Main User-UI Interaction Patterns

- **Login:** A vendor or admin enters their credentials on a dedicated login page for the vendor portal.
- **Dashboard View:** Upon login, the user sees a main dashboard (initially simple, later with analytics) with clear navigation to other sections.
- **Product Management:** Vendors can view a table of their products, click to add a new one (opening a form in a dialog or new page), or edit an existing one.
- **Order Management:** Vendors view a list of their incoming orders, with options to click into an order to see details and update its fulfillment status.

## 3. Architecture

The system consists of a new **Vendor Dashboard Frontend**, the existing **Supabase Backend**, and the existing **Customer Frontend**. The new frontend will be a separate single-page application that communicates with Supabase for authentication, data, and file storage.

```plantuml
@startuml
!theme plain

package "Vendor Dashboard (New Frontend)" {
  [Vendor UI Components] as VendorUI
  [Vendor State Management] as VendorState
}

package "The Bazaar (Existing Frontend)" {
  [Customer UI Components]
}

package "Backend (Supabase)" {
  database "Database" as DB
  [Authentication] as Auth
  [Edge Functions] as Functions
  [File Storage] as Storage
}

VendorUI --> VendorState
VendorState --> Auth : Authenticate Vendor/Admin
VendorState --> Functions : API Calls (e.g., getOrders, updateProduct)
Functions --> DB : Query/Mutate Data (with RLS)
VendorUI --> Storage : Upload Product Images

Auth -> DB : Verifies user roles (vendor, admin)

note right of VendorUI
  A separate React/Vite application
  using shadcn-ui and TypeScript.
end note

note right of Functions
  Deno functions will handle business logic,
  ensuring data access is validated against
  the user's role and ownership.
end note

@enduml
```

## 4. UI Navigation Flow

The navigation is designed to be flat and intuitive, focusing on the core tasks of a vendor.

```plantuml
@startuml
!theme plain

state "Login" as Login
state "Dashboard" as Dashboard
state "Products" as Products
state "Orders" as Orders
state "Profile" as Profile

[*] --> Login

Login --> Dashboard : on successful login

Dashboard --> Products : "Manage Products"
Dashboard --> Orders : "View Orders"
Dashboard --> Profile : "Edit Profile"

Products --> Dashboard : back
Products --> Products : "Add/Edit Product"

Orders --> Dashboard : back
Orders --> Orders : "View Order Details"

Profile --> Dashboard : back

@enduml
```

## 5. Data Structures and Interfaces (Class Diagram)

The core data models include `VendorProfile`, `Product`, and `Order`. A `VendorService` class will encapsulate the logic for interacting with the backend.

```plantuml
@startuml
!theme plain

interface IVendorService {
  +getProfile(): Promise<VendorProfile>
  +updateProfile(data: VendorProfile): Promise<void>
  +listProducts(): Promise<Product[]>
  +getProduct(id: string): Promise<Product>
  +createProduct(data: NewProduct): Promise<Product>
  +updateProduct(id: string, data: Partial<Product>): Promise<Product>
  +listOrders(): Promise<Order[]>
  +getOrder(id: string): Promise<Order>
  +updateOrderStatus(id: string, status: string): Promise<Order>
}

class VendorService implements IVendorService {
  -supabase: SupabaseClient
  +getProfile(): Promise<VendorProfile>
  +updateProfile(data: VendorProfile): Promise<void>
  +listProducts(): Promise<Product[]>
  +getProduct(id: string): Promise<Product>
  +createProduct(data: NewProduct): Promise<Product>
  +updateProduct(id: string, data: Partial<Product>): Promise<Product>
  +listOrders(): Promise<Order[]>
  +getOrder(id: string): Promise<Order>
  +updateOrderStatus(id: string, status: string): Promise<Order>
}

class VendorProfile {
  +id: string
  +shop_name: string
  +shop_logo_url: string
  +description: string
}

class Product {
  +id: string
  +vendor_id: string
  +title: string
  +description: string
  +price: number
  +stock_quantity: number
  +image_urls: string[]
}

class Order {
  +id: string
  +customer_id: string
  +vendor_id: string
  +status: "new" | "shipped" | "delivered"
  +items: OrderItem[]
  +total_price: number
  +shipping_address: string
}

class OrderItem {
  +product_id: string
  +quantity: number
  +price_at_purchase: number
}

VendorService ..> VendorProfile
VendorService ..> Product
VendorService ..> Order

Order *-- "1..*" OrderItem

@enduml
```

## 6. Program Call Flow (Sequence Diagram)

This diagram illustrates the sequence for a vendor fetching their orders, highlighting the security checks involved.

```plantuml
@startuml
!theme plain

actor Vendor
participant "Vendor Portal UI" as UI
participant "Backend (Edge Functions)" as Functions
participant "Database (Supabase)" as DB

Vendor -> UI: Enters credentials and clicks Login
UI -> Functions: POST /auth/login\n(email, password)
Functions -> DB: Verify user credentials and role
DB --> Functions: Return user session (with vendor_id)
Functions --> UI: Return JWT
UI -> UI: Store JWT, redirect to Dashboard

Vendor -> UI: Clicks "Orders"
UI -> Functions: GET /vendor/orders\n(Authorization: Bearer JWT)
    note right
        Function decodes JWT to get vendor_id.
        Admin role bypasses vendor_id check.
    end note
Functions -> DB: SELECT * FROM orders WHERE vendor_id = current_vendor_id
DB --> Functions: Return list of orders
Functions --> UI: Return orders JSON
UI -> Vendor: Display list of orders

@enduml
```

## 7. Database ER Diagram

To support the vendor dashboard, we will introduce a `vendors` table and add a `role` column to the `users` (or `profiles`) table.

```plantuml
@startuml
!theme plain

entity "users" {
  * id : uuid <<PK>>
  --
  email : varchar
  role: "admin" | "vendor" | "customer"
}

entity "vendors" {
  * id : uuid <<PK>>
  --
  user_id : uuid <<FK>>
  shop_name : varchar
  description: text
  logo_url: varchar
}

entity "products" {
  * id : uuid <<PK>>
  --
  vendor_id : uuid <<FK>>
  title : varchar
  price : decimal
  stock_quantity: integer
}

entity "orders" {
  * id : uuid <<PK>>
  --
  vendor_id : uuid <<FK>>
  customer_id : uuid <<FK>>
  status: varchar
}

users ||--o{ vendors : "user_id"
vendors ||--|{ products : "vendor_id"
vendors ||--|{ orders : "vendor_id"
users ||--o{ orders : "customer_id"

note right of users
  We will add a 'role' column to the
  existing 'users' table (or profiles table)
  to differentiate between user types.
end note

@enduml
```

## 8. Unclear Aspects or Assumptions

- **Admin Access Mechanism:** We assume admins will access vendor data through a dedicated "Admin View" within the same vendor portal, where they can search for or select a vendor to view their specific dashboard. The exact UI for this is TBD.
- **Database Schema:** The ER diagram assumes we will modify the existing `users` or `profiles` table. The exact implementation will depend on the current schema, which needs to be confirmed from `supabase/schema.sql`.
- **Payouts:** The MVP design defers the financial/payout features. The database schema will need significant additions to support transaction ledgers and payout records in the future.