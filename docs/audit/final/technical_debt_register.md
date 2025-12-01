# The Bazaar - Final Technical Debt Register
**Date:** 2025-10-31

This document tracks identified technical debt items, their impact, and the estimated effort to resolve them, consolidated from all audit findings.

| ID | Item | Description | Impact | Effort (Story Points) | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TD-001** | Insecure RLS Policy on `profiles` | The current Row-Level Security policy allows users to view other users' profile data, which is a significant privacy violation. | **Critical** | 3 | P0 |
| **TD-002** | No Audit Trail | The absence of an audit log for administrative actions makes it impossible to track changes, investigate incidents, or ensure accountability. | **High** | 5 | P0 |
| **TD-003** | No Code Splitting | The entire application is bundled into a single JavaScript file, leading to poor initial page load times and a bad user experience on slower connections. | **High** | 5 | P1 |
| **TD-004** | Client-Side Search | Search functionality is not backed by a scalable backend, which will fail as the product catalog grows. | **High** | 8 | P1 |
| **TD-005** | Hardcoded UI/Layout Adjustments | UI spacing and layout issues are being fixed with one-off manual adjustments, indicating a poorly configured theme or layout system. This leads to inconsistent UI and high maintenance costs. | **Medium** | 3 | P2 |
| **TD-006** | Lack of Internationalization (i18n) | The codebase has no framework for handling multiple languages or currencies, limiting its global scalability. | **Medium** | 8 | P2 |
| **TD-007** | No Analytics or Error Monitoring | The complete absence of observability tools makes it impossible to make data-driven decisions or proactively identify issues. | **Critical** | 8 | P0 |
| **TD-008** | No Headless CMS Integration | Content is not manageable by non-technical teams, creating a major operational bottleneck and hindering marketing efforts. | **High** | 13 | P0 |
| **TD-009** | Missing Core Modules (Admin, Vendor, Payments) | Foundational pillars of the application are entirely conceptual and not implemented, representing massive scope-gap debt. | **Critical** | 100+ | P0 |