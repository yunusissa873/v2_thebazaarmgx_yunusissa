# Operational Runbook / DevOps Guide
## The Bazaar Marketplace Platform

**Version:** 1.0.0  
**Date:** January 2025  
**Status:** Authoritative  
**Owner:** DevOps Team

---

## 1. Git Branching Model

### 1.1 Branch Strategy

**Main Branches:**
- `main`: Production-ready code
- `develop`: Integration branch for features
- `staging`: Pre-production testing

**Supporting Branches:**
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes
- `release/*`: Release preparation

### 1.2 Workflow

**Feature Development:**
```
1. Create feature branch from develop
2. Develop feature
3. Create pull request to develop
4. Code review and merge
5. Deploy to staging
6. Test and validate
7. Merge to main
8. Deploy to production
```

**Hotfix Process:**
```
1. Create hotfix branch from main
2. Fix critical issue
3. Test fix
4. Merge to main and develop
5. Deploy to production immediately
```

---

## 2. Environment Setup

### 2.1 Local Development

**Prerequisites:**
- Node.js 18+
- pnpm (package manager)
- Git
- Supabase CLI (optional)

**Setup Steps:**
```bash
# Clone repository
git clone <repository-url>
cd v2_thebazaarmgx_yunusissa

# Install dependencies
cd workspace/shadcn-ui
pnpm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
pnpm run dev
```

**Access:**
- Marketplace PWA: http://localhost:3000
- Vendor Portal: http://localhost:3000 (Next.js)
- Admin Portal: http://localhost:3001

### 2.2 Staging Environment

**Hosting:** Vercel Preview Deployments

**Setup:**
- Automatic on PR creation
- Preview URL generated
- Environment variables from Vercel dashboard

**Access:**
- Preview URL: `https://{pr-number}-{project}.vercel.app`

### 2.3 Production Environment

**Hosting:** Vercel Production

**Domains:**
- Marketplace: https://thebazaar.com
- Vendor Portal: https://vendor.thebazaar.com
- Admin Portal: https://admin.thebazaar.com

**Database:** Supabase Production

---

## 3. Development Workflow

### 3.1 Daily Workflow

**Morning:**
1. Pull latest changes from develop
2. Create feature branch
3. Start development

**During Development:**
1. Commit frequently with clear messages
2. Push to remote branch
3. Create PR when feature complete

**End of Day:**
1. Commit and push work
2. Update PR if needed
3. Sync with develop

### 3.2 Commit Message Convention

**Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

**Example:**
```
feat(vendor): Add KYC document upload

- Implement multi-step document upload
- Add file validation
- Integrate with Supabase Storage

Closes #123
```

---

## 4. Build & Deployment Process

### 4.1 Build Process

**Marketplace PWA:**
```bash
cd workspace/shadcn-ui
pnpm run build
```

**Vendor Portal:**
```bash
cd the_bazaar/vendor_portal
npm run build
```

**Admin Portal:**
```bash
cd workspace/admin-portal
pnpm run build
```

### 4.2 Deployment Process

**Vercel Deployment:**
1. Push to main branch
2. Vercel automatically builds
3. Deployment to production
4. Health checks run
5. Rollback if health checks fail

**Manual Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 4.3 Database Migrations

**Migration Process:**
1. Create migration file in `workspace/shadcn-ui/supabase/migrations/`
2. Test migration locally
3. Apply to staging
4. Verify staging
5. Apply to production
6. Monitor for issues

**Migration Commands:**
```bash
# Apply migrations
supabase db push

# Rollback migration
supabase migration repair --status reverted
```

---

## 5. Continuous Integration/Deployment

### 5.1 CI/CD Pipeline

**GitHub Actions / Vercel:**
1. Code pushed to repository
2. Automated tests run
3. Linting and type checking
4. Build process
5. Deployment to staging (PR)
6. Deployment to production (main)

### 5.2 Automated Tests

**Test Types:**
- Unit tests (future)
- Integration tests (future)
- E2E tests (Playwright for vendor portal)
- Accessibility tests (Axe)

**Test Commands:**
```bash
# Vendor Portal
cd the_bazaar/vendor_portal
npm test

# Accessibility tests
npm run test:axe
```

### 5.3 Quality Checks

**Pre-commit Hooks:**
- Linting (ESLint)
- Type checking (TypeScript)
- Formatting (Prettier, future)

**PR Checks:**
- Build success
- Tests pass
- No linting errors
- Code review required

---

## 6. Testing Strategy

### 6.1 Testing Levels

**Unit Tests:**
- Component tests
- Utility function tests
- API function tests

**Integration Tests:**
- API endpoint tests
- Database integration tests
- Payment integration tests

**E2E Tests:**
- Critical user flows
- Vendor registration
- Checkout process
- Payment processing

### 6.2 Test Environment

**Test Database:**
- Separate Supabase project
- Test data seeded
- Isolated from production

**Test Accounts:**
- Test vendor accounts
- Test buyer accounts
- Test admin accounts

---

## 7. Debugging Procedures

### 7.1 Local Debugging

**Browser DevTools:**
- Console logs
- Network tab
- Application tab
- React DevTools

**VS Code Debugging:**
- Launch configuration
- Breakpoints
- Step through code

### 7.2 Production Debugging

**Logs:**
- Vercel function logs
- Supabase logs
- Browser console errors
- Sentry (future)

**Error Tracking:**
- Error boundaries
- Global error handlers
- Error reporting

### 7.3 Database Debugging

**Supabase Dashboard:**
- Query logs
- Table editor
- SQL editor
- API logs

**Common Issues:**
- RLS policy blocking access
- Missing indexes
- Query performance
- Connection issues

---

## 8. Rollback Procedures

### 8.1 Frontend Rollback

**Vercel Rollback:**
1. Navigate to Vercel dashboard
2. Select deployment
3. Click "Promote to Production"
4. Previous deployment restored

**Git Rollback:**
```bash
# Revert last commit
git revert HEAD

# Rollback to specific commit
git reset --hard <commit-hash>
git push --force
```

### 8.2 Database Rollback

**Migration Rollback:**
```bash
# Rollback last migration
supabase migration repair --status reverted

# Point-in-time recovery
# Via Supabase dashboard
```

**Data Rollback:**
- Restore from backup
- Manual data correction
- Transaction rollback (if in transaction)

---

## 9. Monitoring & Alerting

### 9.1 Application Monitoring

**Vercel Analytics:**
- Page views
- Performance metrics
- Error rates
- Function execution

**Supabase Monitoring:**
- Database performance
- API usage
- Storage usage
- Realtime connections

### 9.2 Alerting

**Critical Alerts:**
- Payment failures
- Database errors
- High error rates
- Security events
- Deployment failures

**Alert Channels:**
- Email notifications
- Slack (future)
- PagerDuty (future)

---

## 10. Backup & Restore Procedures

### 10.1 Backup Schedule

**Database:**
- Automatic daily backups (Supabase)
- Manual backups before major changes
- Point-in-time recovery available

**Code:**
- Git repository (GitHub)
- Deployment snapshots (Vercel)

**Storage:**
- Supabase Storage replication
- CDN caching

### 10.2 Restore Procedures

**Database Restore:**
1. Navigate to Supabase dashboard
2. Select backup point
3. Restore database
4. Verify data integrity

**Code Restore:**
1. Checkout previous commit
2. Redeploy
3. Verify functionality

---

## 11. Performance Optimization

### 11.1 Frontend Optimization

**Code Splitting:**
- Route-based lazy loading
- Component-level splitting
- Dynamic imports

**Asset Optimization:**
- Image optimization (WebP)
- CSS minification
- JavaScript bundling
- Tree-shaking

**Caching:**
- Service Worker (PWA)
- React Query cache
- Browser caching
- CDN caching

### 11.2 Backend Optimization

**Database:**
- Index optimization
- Query optimization
- Connection pooling
- Read replicas (future)

**API:**
- Response caching
- Pagination
- Field selection
- Batch operations

---

## 12. Troubleshooting Guide

### 12.1 Common Issues

**Build Failures:**
- Check Node.js version
- Clear node_modules and reinstall
- Check environment variables
- Review build logs

**Database Connection:**
- Verify Supabase URL and keys
- Check network connectivity
- Verify RLS policies
- Check connection limits

**Payment Issues:**
- Verify payment gateway keys
- Check webhook endpoints
- Review payment logs
- Test with sandbox mode

### 12.2 Support Resources

**Documentation:**
- This runbook
- API documentation
- Feature specifications
- Architecture blueprint

**Team Contacts:**
- DevOps: devops@thebazaar.com
- Engineering: engineering@thebazaar.com
- Support: support@thebazaar.com

---

## 13. Related Documents
- System Architecture Blueprint
- Security, Compliance & Infrastructure Policy
- API Specification & Integration Map

---

## 14. Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2025 | DevOps Team | Initial operational runbook |

---

**End of Document 8: Operational Runbook / DevOps Guide**



