```
/
|-- vendor-dashboard/
|   |-- src/
|   |   |-- components/
|   |   |   |-- layout/
|   |   |   |   |-- Sidebar.tsx
|   |   |   |   `-- Header.tsx
|   |   |   |-- dashboard/
|   |   |   |   `-- StatsCard.tsx
|   |   |   |-- products/
|   |   |   |   |-- ProductDataTable.tsx
|   |   |   |   `-- ProductForm.tsx
|   |   |   |-- orders/
|   |   |   |   `-- OrderDataTable.tsx
|   |   |   `-- ui/ (shadcn components)
|   |   |-- pages/
|   |   |   |-- Dashboard.tsx
|   |   |   |-- Products.tsx
|   |   |   |-- Orders.tsx
|   |   |   |-- Profile.tsx
|   |   |   `-- Login.tsx
|   |   |-- lib/
|   |   |   |-- supabaseClient.ts
|   |   |   `-- api.ts (data fetching functions)
|   |   |-- App.tsx
|   |   `-- main.tsx
|   |-- supabase/
|   |   |-- functions/
|   |   |   |-- get-orders/
|   |   |   |-- update-product/
|   |   |   `-- ... (other backend logic)
|   |   `-- schema.sql (updated schema)
|   |-- package.json
|   `-- vite.config.ts
|-- docs/
|   `-- design/
|       |-- architect.plantuml
|       |-- ui_navigation.plantuml
|       |-- class_diagram.plantuml
|       |-- sequence_diagram.plantuml
|       |-- er_diagram.plantuml
|       |-- file_tree.md
|       `-- vendor_dashboard_design.md
`-- ... (existing project structure)

```