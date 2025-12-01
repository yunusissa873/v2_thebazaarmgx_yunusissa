# The Bazaar - Multi-Portal Monorepo

A decoupled, multi-portal marketplace architecture with three independently deployed Vite/React applications sharing a common Supabase backend.

## Workspace Structure

```
the-bazaar/
├── shadcn-ui/              # Main app (Bazaar Manus)
│   ├── Port: 3000
│   └── Features: Shopping, browsing, order tracking
├── admin-portal/           # Admin console
│   ├── Port: 3001
│   └── Features: Admin dashboard, user management, analytics
├── vendor-dashboard/       # Vendor portal
│   ├── Port: 3002
│   └── Features: Vendor management, inventory, orders
└── docs/, ref_docs/        # Documentation
```

## Quick Start

### Installation

Install all workspace dependencies:

```bash
npm install
```

### Development

Start all three dev servers concurrently (recommended for local development):

**Via VS Code:**
- Press `Ctrl+Shift+B` → Select **"Dev: All (Main + Admin + Vendor)"**

**Via CLI:**

```bash
# Terminal 1: Main App
cd shadcn-ui && npm run dev

# Terminal 2: Admin Portal
cd admin-portal && npm run dev

# Terminal 3: Vendor Dashboard
cd vendor-dashboard && npm run dev
```

Access the apps:
- **Main App:** http://localhost:3000
- **Admin Portal:** http://localhost:3001
- **Vendor Dashboard:** http://localhost:3002

### Individual Dev Servers

Each workspace folder has its own dev script:

- `shadcn-ui`: `npm run dev` (Vite on port 3000)
- `admin-portal`: `npm run dev` (Vite on port 3001)
- `vendor-dashboard`: `npm run dev` (Vite on port 3002)

### Build

Build all apps:

```bash
npm run build --workspaces
```

Build individual apps:

```bash
cd shadcn-ui && npm run build
cd admin-portal && npm run build
cd vendor-dashboard && npm run build
```

### Linting

Lint all workspaces:

```bash
npm run lint --workspaces
```

## Environment Setup

Each app requires a `.env.local` file. Copy the example file and fill in your Supabase credentials:

```bash
cp shadcn-ui/.env.local.example shadcn-ui/.env.local
cp admin-portal/.env.local.example admin-portal/.env.local
cp vendor-dashboard/.env.local.example vendor-dashboard/.env.local
```

Required environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Technologies

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Data:** TanStack Query (React Query), Zustand (state management)
- **Styling:** Tailwind CSS, PostCSS
- **Linting:** ESLint, TypeScript strict mode
- **Testing:** Playwright (E2E, vendor portal)

## VS Code Tasks

VS Code tasks are configured in `.vscode/tasks.json`:

- **Dev: Main App** - Start main app dev server
- **Dev: Admin Portal** - Start admin portal dev server
- **Dev: Vendor Dashboard** - Start vendor portal dev server
- **Dev: All** - Start all three dev servers (default build task)
- **Build: Main App** - Build main app
- **Build: Admin Portal** - Build admin portal
- **Build: Vendor Dashboard** - Build vendor dashboard
- **Lint: All** - Run ESLint on all workspaces

Run any task via:
- `Ctrl+Shift+B` (default build task)
- `Ctrl+Shift+P` → "Tasks: Run Task"

## Workspace Settings

VS Code workspace settings are in `.vscode/settings.json`:

- **Formatter:** Prettier (on save)
- **Linting:** ESLint with auto-fix on save
- **TypeScript:** Uses workspace TypeScript (strict mode)
- **Excluded folders:** node_modules, dist, .vite

## Cleanup & Maintenance

### Remove Unused Dependencies

Unused dependencies have been cleaned from:
- `vendor-dashboard`: Removed `next`, `playwright`, `@axe-core/playwright`, `axios`, `framer-motion`
- `shadcn-ui`: Removed `sharp` (not needed for dev)

After cleanup, reinstall with:

```bash
npm install
```

### Port Normalization

All apps now use normalized ports:
- **Main App (shadcn-ui):** Port 3000
- **Admin Portal:** Port 3001
- **Vendor Dashboard:** Port 3002

These are configured in each app's `vite.config.ts`.

## Documentation

- `ref_docs/` - Reference documentation (API, architecture, features, design, security)
- `docs/` - Design artifacts and audit reports
- `COMPREHENSIVE_AUDIT_REPORT.md` - Full E2E audit
- `UNIFIED_DOCUMENTATION_SUMMARY.md` - Summary of ref_docs
- `build_plan_scratchpad.md` - Enhancement plan and implementation tasks

## Architecture

This is a **decoupled multi-portal architecture**:

1. **Three independent React/Vite SPAs** (no shared components, isolated state)
2. **Single Supabase backend** (shared DB, auth, realtime)
3. **Separate deployments** (each app can be deployed independently to Vercel)
4. **Role-based access** (RLS policies enforce data isolation per app)

Benefits:
- Teams can work independently on each portal
- Each app can use its own tech stack (currently all Vite/React)
- Deployments are independent and can be rolled back separately
- Shared backend enables real-time collaboration and cross-portal data integrity

## Contributing

Before committing:
1. Run linting: `npm run lint --workspaces`
2. Ensure all apps build: `npm run build --workspaces`
3. Test locally in all three apps

## Support

See `ref_docs/` for detailed feature specs, API documentation, architecture diagrams, and more.
