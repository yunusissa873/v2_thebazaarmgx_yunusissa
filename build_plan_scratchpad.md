# Build Plan Scratch-pad
Generated: December 1, 2025

This scratch-pad captures the DETAILED TASKS section of the Project Enhancement & Implementation Plan. Use this file as a living checklist during the implementation sprints.

---

## Summary (one-line per task)

1. Project Kickoff & Environment Validation — Owners: Product + Eng Lead + DevOps — Est: 2d — Docs: `operations/operational_runbook_devops.md`
2. Implement Unit Tests (Vitest) & CI Integration — Owners: Frontend Eng + QA — Est: 5–8d — Docs: `architecture/system_architecture_blueprint.md`
3. Write E2E Tests (Playwright) for Critical Flows — Owners: QA + Frontend Eng — Est: 6–12d — Docs: `features/vendor_registration_onboarding.md`, `features/shopper_experience.md`
4. Integrate Error Tracking & Monitoring (Sentry) — Owners: SRE + Eng — Est: 2–3d — Docs: `analytics/analytics_tracking_reporting.md`
5. Implement Admin 2FA & Harden Authentication — Owners: Backend + Security Eng — Est: 5d — Docs: `security/security_compliance_infrastructure.md`, `features/admin_console.md`
6. Security Hardening: CSP, IP Whitelisting, Service Key Handling — Owners: Security + DevOps — Est: 4–6d — Docs: `security/security_compliance_infrastructure.md`
7. Publish API Docs (OpenAPI) & Integration Map — Owners: Backend + API Writer — Est: 3–4d — Docs: `api/api_specification_integration_map.md`
8. Analytics Setup & Event Schema Implementation — Owners: Data Eng + Product + Frontend — Est: 8–12d — Docs: `analytics/analytics_tracking_reporting.md`
9. Performance Optimization: Code-Splitting, Image Opt, SW Strategy — Owners: Frontend + Design — Est: 6–10d — Docs: `desgn/ui_ux_design_system.md`, `architecture/system_architecture_blueprint.md`
10. Vendor Experience Enhancements: KYC Automation & Subscription UX — Owners: Product + Backend + Vendor UX — Est: 10–20d — Docs: `features/vendor_registration_onboarding.md`
11. Payments & Escrow Flow Finalization + Webhooks — Owners: Backend + Payments Specialist — Est: 8–12d — Docs: `api/api_specification_integration_map.md`, `features/payment_wallet_transactions.md`
12. Audit Logging, Retention & Compliance Automation — Owners: Security + Data Eng — Est: 5–8d — Docs: `security/security_compliance_infrastructure.md`, `database/database_schema_erd.md`
13. Accessibility Audit & Remediation (axe-core) — Owners: Design + Frontend + QA — Est: 6–10d — Docs: `desgn/ui_ux_design_system.md`
14. DevOps & Release Automation (migrations, previews, rollback) — Owners: DevOps/SRE — Est: 5–8d — Docs: `operations/operational_runbook_devops.md`
15. Developer Docs, Onboarding & Component Storybook — Owners: Eng + Docs Writer + Design — Est: 6–10d — Docs: `index/documentation_index_dependency_map.md`

---

## Detailed task entries (expandable checklist)

### 1) Project Kickoff & Environment Validation
- Owner: Product + Eng Lead + DevOps
- Estimate: 2 team-days
- Docs: `operations/operational_runbook_devops.md`, `index/documentation_index_dependency_map.md`
- Acceptance Criteria:
  - `.env.local.example` exists for all apps and documented
  - Dev servers for `shadcn-ui`, `admin-portal`, `vendor-dashboard` boot locally
  - CI env secret handoff documented
- Notes / Next actions:
  - Confirm local ports and Vercel env mappings

### 2) Implement Unit Tests (Vitest) & CI
- Owner: Frontend Eng + QA
- Estimate: 5–8 team-days
- Docs: `architecture/system_architecture_blueprint.md`
- Acceptance Criteria:
  - `vitest` + `@testing-library/react` installed in each repo
  - CI pipeline runs `lint`, `typecheck`, `test`
  - Baseline tests for `AuthContext`, `supabase/client`, cart logic, product list

### 3) Write E2E Tests (Playwright) for Critical Flows
- Owner: QA + Frontend Eng
- Estimate: 6–12 team-days
- Docs: `features/vendor_registration_onboarding.md`, `features/shopper_experience.md`
- Acceptance Criteria:
  - Playwright tests for: signup/login, product browse → cart → checkout (mock), vendor onboarding + KYC, admin verify vendor
  - Axe accessibility checks integrated into E2E

### 4) Integrate Error Tracking & Monitoring (Sentry)
- Owner: SRE + Eng
- Estimate: 2–3 team-days
- Docs: `analytics/analytics_tracking_reporting.md`
- Acceptance Criteria:
  - Sentry DSN configured in staging & prod envs
  - Example error appears in Sentry from test payload
  - Alerts configured into Slack/Email

### 5) Implement Admin 2FA & Harden Authentication
- Owner: Backend + Security
- Estimate: 5 team-days
- Docs: `security/security_compliance_infrastructure.md`, `features/admin_console.md`
- Acceptance Criteria:
  - Admin accounts require TOTP or SMS 2FA
  - Service-role operations only accessible via Edge Functions / server

### 6) Security Hardening: CSP, IP Whitelisting, Service Key Handling
- Owner: Security + DevOps
- Estimate: 4–6 team-days
- Docs: `security/security_compliance_infrastructure.md`
- Acceptance Criteria:
  - CSP headers in production
  - Admin IP whitelist configurable via envs
  - No `VITE_` prefixed service-role secrets in client code

### 7) Publish API Docs (OpenAPI) & Integration Map
- Owner: Backend + API Writer
- Estimate: 3–4 team-days
- Docs: `api/api_specification_integration_map.md`
- Acceptance Criteria:
  - `openapi.json` for key endpoints (profiles, products, orders, payments)
  - Published docs site accessible internally

### 8) Analytics Setup & Event Schema Implementation
- Owner: Data Eng + Product + Frontend
- Estimate: 8–12 team-days
- Docs: `analytics/analytics_tracking_reporting.md`
- Acceptance Criteria:
  - Canonical event schema agreed and documented
  - Instrumentation for product_view, add_to_cart, purchase, kyc_submitted
  - Dashboards for GMV and conversion

### 9) Performance Optimization: Code-Splitting, Image Opt, SW
- Owner: Frontend + Design
- Estimate: 6–10 team-days
- Docs: `desgn/ui_ux_design_system.md`, `architecture/system_architecture_blueprint.md`
- Acceptance Criteria:
  - Route-based lazy loading implemented
  - Image pipeline in place (sharp or Vercel Image Optimization)
  - Lighthouse targets met (FCP, LCP)

### 10) Vendor Experience Enhancements: KYC Automation & Subscription UX
- Owner: Product + Backend + Vendor UX
- Estimate: 10–20 team-days
- Docs: `features/vendor_registration_onboarding.md`, `features/feature_specifications_index.md`
- Acceptance Criteria:
  - KYC upload flow robust and stored in `kyc-documents` bucket
  - Admin review queue with action buttons
  - Subscription upgrade/downgrade flows work and reflect SKU limits

### 11) Payments & Escrow Flow Finalization and Webhooks
- Owner: Backend + Payments Specialist
- Estimate: 8–12 team-days
- Docs: `api/api_specification_integration_map.md`, `features/payment_wallet_transactions.md`
- Acceptance Criteria:
  - Webhooks verify signature and are idempotent
  - Escrow hold → release → refund lifecycle tested

### 12) Audit Logging, Retention & Compliance Automation
- Owner: Security + Data Eng
- Estimate: 5–8 team-days
- Docs: `security/security_compliance_infrastructure.md`, `database/database_schema_erd.md`
- Acceptance Criteria:
  - `audit_log` captures admin actions, IP, user-agent
  - Retention & anonymization workflows documented and runnable

### 13) Accessibility Audit & Remediation
- Owner: Design + Frontend + QA
- Estimate: 6–10 team-days
- Docs: `desgn/ui_ux_design_system.md`
- Acceptance Criteria:
  - No critical AXE violations on primary flows
  - Keyboard navigation & ARIA attributes verified

### 14) DevOps & Release Automation (migrations, previews, rollback)
- Owner: DevOps/SRE
- Estimate: 5–8 team-days
- Docs: `operations/operational_runbook_devops.md`
- Acceptance Criteria:
  - DB migrations applied via CI with pre-checks and backups
  - Preview deployments for PRs + smoke tests

### 15) Developer Docs, Onboarding & Component Storybook
- Owner: Eng + Docs Writer + Design
- Estimate: 6–10 team-days
- Docs: `index/documentation_index_dependency_map.md`
- Acceptance Criteria:
  - Storybook covers core components and is published
  - New developer onboarding guide enables run in <1 hour

---

## Tracking / Next actions
- Current status: this scratch-pad created; use it to create tickets and start Sprint 1.
- Suggested immediate next action: create issues for items 2,3,4,7 and assign owners.

---

## File location
`/build_plan_scratchpad.md` (repo root)
