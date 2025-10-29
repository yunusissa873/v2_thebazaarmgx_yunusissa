## Update: Restore Header/Navigation in App Viewer

Date: ${new Date().toISOString()}

Changes applied:
1) src/App.tsx
- Switched to named imports for both Navbar and Footer:
  - import { Navbar } from '@/components/shared/Navbar'
  - import { Footer } from '@/components/shared/Footer'
- Added global layout wrapper `min-h-screen flex flex-col`
- Rendered `<Navbar />` at top and `<Footer />` at bottom globally
- Gated BuildBadge: `{import.meta.env.VITE_SHOW_BADGE === 'true' && <BuildBadge />}`

2) src/components/shared/BuildBadge.tsx
- Lowered z-index and disabled interactions:
  - Wrapper className updated to include `z-30` and `pointer-events-none`

3) vite.config.ts
- Added badge toggle flag in define:
  - `'import.meta.env.VITE_SHOW_BADGE': JSON.stringify(process.env.VITE_SHOW_BADGE ?? 'true')`
- PWA remains disabled unless `VITE_ENABLE_PWA='true'` in production

Build output:
- Production build executed via `pnpm run build`
- Build succeeded; refer to terminal logs for exact sizes

Verification:
- App Viewer: Header/Navbar now visible and sticky; badge no longer interferes with header clicks
- Published site (https://thebazaar.mgx.world): Header visible; no “Mega Brands” content present

Notes:
- If any view still hides the header, provide device/viewport and which elements are missing to adjust responsive classes (`hidden` at small breakpoints) or z-index hierarchy.