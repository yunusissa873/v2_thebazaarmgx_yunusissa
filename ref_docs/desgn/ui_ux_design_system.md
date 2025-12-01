# UI/UX Design System & Wireframes
## The Bazaar Marketplace Platform

**Version:** 1.0.0  
**Date:** January 2025  
**Status:** Authoritative  
**Owner:** Design Team

---

## 1. Design Philosophy

### 1.1 Netflix-Inspired Aesthetic
The Bazaar follows a **Netflix-inspired design approach** that prioritizes:
- **Visual-first experience:** Large, high-quality product images
- **Dark theme:** Reduces eye strain, creates premium feel
- **Minimal text:** Let products speak for themselves
- **Smooth animations:** Enhanced user engagement
- **Auto-rotating content:** Keeps experience fresh

### 1.2 Core Design Principles
1. **Image-First:** 85% image coverage on product cards
2. **Dark Theme:** #141414 base color for immersive experience
3. **Smooth Transitions:** All interactions feel fluid
4. **Auto-Rotation:** Carousels rotate hourly for freshness
5. **Minimal Text:** Maximum visual impact
6. **Hover Effects:** Enhanced interactivity
7. **Responsive Grid:** 3-10 columns based on screen size

---

## 2. Style Guide

### 2.1 Color Palette

**Primary Colors:**
- **Primary Red:** `#E50914` (Netflix red) - Main accent, CTAs
- **Secondary Grey:** `#808080` - Secondary elements
- **Dark Background:** `#141414` - Main background
- **Medium Grey:** `#2F2F2F` - Cards, borders
- **Black:** `#1F1F1F` - Dark backgrounds
- **Light Grey:** `#F5F5F5` - Light backgrounds
- **White:** `#FFFFFF` - Text on dark

**Usage:**
- Primary red for buttons, links, highlights
- Dark backgrounds for main content areas
- Medium grey for cards and elevated surfaces
- White/light grey for text on dark backgrounds

### 2.2 Typography

**Font Family:**
- **Primary:** Inter, system-ui, sans-serif
- **Fallback:** System fonts for performance

**Font Sizes:**
- `xs`: 0.75rem (12px)
- `sm`: 0.875rem (14px)
- `base`: 1rem (16px)
- `lg`: 1.125rem (18px)
- `xl`: 1.25rem (20px)
- `2xl`: 1.5rem (24px)
- `3xl`: 1.875rem (30px)
- `4xl`: 2.25rem (36px)

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Line Heights:**
- Tight: 1.25
- Normal: 1.5
- Relaxed: 1.75

### 2.3 Spacing

**Spacing Scale:**
- `xs`: 0.25rem (4px)
- `sm`: 0.5rem (8px)
- `md`: 1rem (16px)
- `lg`: 1.5rem (24px)
- `xl`: 2rem (32px)
- `2xl`: 3rem (48px)

**Usage:**
- Consistent spacing between elements
- Generous whitespace for readability
- Responsive spacing (scales on mobile)

### 2.4 Border Radius

**Radius Values:**
- `sm`: 0.25rem (4px)
- `md`: 0.5rem (8px)
- `lg`: 0.75rem (12px)
- `xl`: 1rem (16px)
- `full`: 9999px (circular)

**Usage:**
- Cards: `md` or `lg`
- Buttons: `md`
- Images: `md` or `lg`
- Avatars: `full`

---

## 3. Component Library (shadcn/ui)

### 3.1 Base Components

**Button:**
- Primary (red), Secondary (grey), Outline, Ghost
- Sizes: sm, md, lg
- Loading states
- Icon support

**Input:**
- Text, email, password, number
- Validation states
- Error messages
- Placeholder text

**Card:**
- Default, elevated, outlined
- Header, content, footer sections
- Image support

**Dialog/Modal:**
- Centered, fullscreen options
- Close button
- Backdrop blur
- Animation transitions

### 3.2 Form Components

**Form:**
- React Hook Form integration
- Validation with Zod
- Error handling
- Success states

**Select:**
- Dropdown with search
- Multi-select option
- Grouped options

**Checkbox/Radio:**
- Custom styled
- Accessible
- Group support

### 3.3 Navigation Components

**Navbar:**
- Logo
- Search bar
- Navigation links
- User menu (cart, wishlist, profile)
- Mobile hamburger menu

**Sidebar:**
- Collapsible
- Icon + text labels
- Active state
- Nested navigation

**Breadcrumb:**
- Hierarchical navigation
- Separator icons
- Clickable links

### 3.4 Data Display Components

**Table:**
- Sortable columns
- Filterable rows
- Pagination
- Row selection

**Badge:**
- Status indicators
- Count badges
- Color variants

**Avatar:**
- User profile pictures
- Fallback initials
- Size variants

### 3.5 Feedback Components

**Toast/Notification:**
- Success, error, warning, info
- Auto-dismiss
- Action buttons
- Position options

**Alert:**
- Inline messages
- Dismissible
- Icon support

**Progress:**
- Linear progress bar
- Circular progress
- Percentage display

---

## 4. Design Tokens

### 4.1 Brand Kit (from vendor_portal/theme/brandKit.ts)

```typescript
export const brandKit = {
  colors: {
    primary: "#E50914",      // Netflix red
    secondary: "#808080",    // Light grey
    dark: "#1F1F1F",        // Dark grey
    medium: "#2F2F2F",      // Medium grey
    black: "#141414",       // Main background
    light: "#F5F5F5",       // Light grey
    white: "#FFFFFF",       // White
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
  },
  typography: {
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
}
```

### 4.2 Tailwind CSS Configuration

**Theme Extension:**
- Custom colors from brand kit
- Custom spacing scale
- Custom typography
- Custom border radius

---

## 5. Page Wireframes

### 5.1 Homepage Wireframe

**Layout Structure:**
```
┌─────────────────────────────────────┐
│  Navbar (Logo, Search, User Menu)   │
├─────────────────────────────────────┤
│  Hero Carousel (Featured Products)   │
│  [Auto-rotating, full-width]        │
├─────────────────────────────────────┤
│  Category Carousel 1                 │
│  [Horizontal scroll, 10 items]      │
├─────────────────────────────────────┤
│  Category Carousel 2                 │
│  [Horizontal scroll, 10 items]      │
├─────────────────────────────────────┤
│  Product Grid (Infinite Scroll)      │
│  [3-10 columns responsive]           │
├─────────────────────────────────────┤
│  Footer (Links, Social, Legal)      │
└─────────────────────────────────────┘
```

**Key Elements:**
- Dark background (#141414)
- Large product images
- Minimal text
- Smooth scrolling

### 5.2 Product Detail Page Wireframe

**Layout Structure:**
```
┌─────────────────────────────────────┐
│  Navbar                               │
├──────────────────┬───────────────────┤
│  Image Gallery   │  Product Info     │
│  (Left, 60%)     │  (Right, 40%)     │
│                  │                   │
│  [Main Image]     │  Title            │
│  [Thumbnails]    │  Price            │
│                  │  Variants         │
│                  │  Quantity         │
│                  │  Add to Cart      │
│                  │  Add to Wishlist  │
│                  │  Vendor Info      │
├──────────────────┴───────────────────┤
│  Description                          │
├─────────────────────────────────────┤
│  Reviews (Filtered, Paginated)        │
├─────────────────────────────────────┤
│  Related Products                     │
└─────────────────────────────────────┘
```

### 5.3 Cart Page Wireframe

**Layout Structure:**
```
┌─────────────────────────────────────┐
│  Navbar                               │
├──────────────────┬───────────────────┤
│  Cart Items      │  Order Summary    │
│  (Left, 60%)     │  (Right, 40%)      │
│                  │                   │
│  [Item Card]     │  Subtotal         │
│  [Item Card]     │  Tax              │
│  [Item Card]     │  Shipping         │
│                  │  Discount         │
│  Coupon Input    │  ─────────────    │
│                  │  Total            │
│                  │  Checkout Button  │
└──────────────────┴───────────────────┘
```

### 5.4 Vendor Dashboard Wireframe

**Layout Structure:**
```
┌─────────────────────────────────────┐
│  Sidebar        │  Main Content      │
│  Navigation     │                    │
│                 │  [Dashboard Cards] │
│  - Overview     │  [Analytics Chart] │
│  - Products     │  [Recent Orders]   │
│  - Orders       │                    │
│  - Analytics    │                    │
│  - Finance      │                    │
│  - Settings     │                    │
└─────────────────────────────────────┘
```

---

## 6. Responsive Design Rules

### 6.1 Breakpoints

**Mobile:**
- Max width: 640px
- Single column layout
- Stacked navigation
- Full-width cards

**Tablet:**
- 641px - 1024px
- 2-column layout
- Collapsible sidebar
- Responsive grid

**Desktop:**
- 1025px+
- Multi-column layout
- Full sidebar
- 3-10 column product grid

### 6.2 Grid System

**Product Grid:**
- Mobile: 1 column
- Tablet: 2-3 columns
- Desktop: 3-10 columns (based on container width)

**Responsive Behavior:**
- Images scale proportionally
- Text sizes adjust
- Spacing scales
- Navigation adapts

---

## 7. Accessibility Standards

### 7.1 WCAG 2.1 Compliance

**Level AA Requirements:**
- Color contrast ratio: 4.5:1 for text
- Keyboard navigation: All interactive elements
- Screen reader support: ARIA labels
- Focus indicators: Visible focus states
- Alt text: All images

### 7.2 Accessibility Features

**Keyboard Navigation:**
- Tab order logical
- Skip links available
- Escape closes modals
- Arrow keys for carousels

**Screen Reader Support:**
- Semantic HTML
- ARIA labels
- Live regions for updates
- Form labels

**Visual Accessibility:**
- High contrast mode support
- Text size scaling
- Focus indicators
- Error messages clear

---

## 8. Animation & Interaction Guidelines

### 8.1 Animation Principles

**Smooth Transitions:**
- Duration: 200-300ms
- Easing: ease-in-out
- No jarring movements

**Hover Effects:**
- Image zoom: 1.05x scale
- Button lift: subtle shadow
- Color transitions: smooth

**Loading States:**
- Skeleton screens
- Progress indicators
- Smooth transitions

### 8.2 Interaction Patterns

**Carousels:**
- Auto-rotate: 1 hour intervals
- Manual navigation: arrow buttons
- Touch/swipe support
- Smooth scrolling

**Modals:**
- Fade in/out
- Backdrop blur
- Escape to close
- Click outside to close

**Forms:**
- Real-time validation
- Error messages inline
- Success states
- Loading states

---

## 9. Dark Theme Specifications

### 9.1 Color Usage

**Backgrounds:**
- Main: #141414
- Cards: #1F1F1F
- Elevated: #2F2F2F

**Text:**
- Primary: #FFFFFF
- Secondary: #808080
- Muted: #666666

**Borders:**
- Default: #2F2F2F
- Focus: #E50914
- Error: #EF4444

### 9.2 Component Styling

**Cards:**
- Background: #1F1F1F
- Border: #2F2F2F
- Shadow: Subtle dark shadow

**Buttons:**
- Primary: #E50914 background, white text
- Secondary: #2F2F2F background, white text
- Hover: Lighter shade

**Inputs:**
- Background: #1F1F1F
- Border: #2F2F2F
- Focus: #E50914 border

---

## 10. PWA Design Considerations

### 10.1 Offline Experience

**Offline Indicators:**
- Banner when offline
- Cached content display
- Sync when online

**Offline Pages:**
- Styled offline page
- Retry button
- Cached content access

### 10.2 Install Prompt

**PWA Install:**
- Custom install prompt
- Benefits messaging
- Install button

---

## 11. Related Documents
- Master PRD
- Feature Specification Sheets
- System Architecture Blueprint

---

## 12. Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | Design Team | Initial design system specification |

---

**End of Document 5: UI/UX Design System & Wireframes**
