# Vendor Dashboard MVP Implementation Plan

1.  **Create `src/components/Layout.tsx`**: This component will define the main structure with a sidebar and a content area for the pages.
2.  **Create `src/components/Sidebar.tsx`**: This will be the main navigation component with links to Dashboard, Products, Orders, and Profile.
3.  **Create `src/pages/Dashboard.tsx`**: A simple placeholder component for the dashboard landing page.
4.  **Create `src/pages/Products.tsx`**: A placeholder for the product management page.
5.  **Create `src/pages/Orders.tsx`**: A placeholder for the order management page.
6.  **Create `src/pages/Profile.tsx`**: A placeholder for the vendor profile editing page.
7.  **Update `src/App.tsx`**: Integrate the new layout and set up the routes for all the new pages using `react-router-dom`.