# The Bazaar Security Policy

## Supported Versions

This table shows which branches/releases are currently supported with security updates.

| Version/Branch | Supported |
| -------------- | --------- |
| master/main    | ✅         |
| dev            | ❌         |
| v1.0.x         | ✅         |
| < v1.0        | ❌         |

---

## Scope
This security policy applies to all components of The Bazaar:
- **Frontend applications:** main-app, vendor-portal, admin-portal
- **Backend services:** Supabase Edge Functions, Fastify/Next.js deployments
- **Database:** Postgres schemas, RLS policies, Supabase configuration
- **Payments:** Stripe and M-Pesa integration
- **CI/CD pipelines:** Vercel, Cloudflare Pages, any backend deployment targets
- **Third-party dependencies:** packages, libraries, and integrations

---

## Reporting a Vulnerability
To report a security vulnerability, please contact us via **lumiotech30@gmail.com**.  
All reports should include:
- Description of the vulnerability
- Steps to reproduce (if possible)
- Potential impact (optional)

> **Note:** Do not publicly disclose vulnerabilities until they have been patched.

---

## Response Timeline
The Bazaar team commits to the following response times:

| Severity Level | Acknowledgment | Notes |
|----------------|----------------|-------|
| Critical       | 24 hours       | Immediate investigation and fix |
| High           | 48 hours       | Prompt investigation and mitigation |
| Medium/Low     | 72 hours       | Reviewed and planned resolution |

> All reports will be handled internally; no external triage will be performed.

---

## Issue Tracking
- All security reports will be logged internally in GitHub Issues with the `security` label.
- Verification and remediation will be performed by the core security/development team.

---

## Standards & Compliance
The Bazaar follows enterprise-grade security best practices, including:
- **OWASP Top 10** for web application security
- **PCI-DSS** standards for payment processing
- **ISO 27001** principles for data protection and risk management
- Secure coding practices and CI/CD enforcement with CodeQL and automated scans

---

## Confidentiality & NDA
- All security reports are **confidential** until addressed and patched.  
- External researchers reporting vulnerabilities may be asked to sign a **Non-Disclosure Agreement (NDA)**.  
- Public disclosure of unpatched vulnerabilities is strictly prohibited.  

---

## Secret Management & Safe Practices
- No secrets (API keys, service roles, or passwords) should be stored in the repository.  
- All sensitive information must reside in **Supabase Vault**, **GitHub Environment Secrets**, or an approved enterprise secret manager.  
- LFS is used for large assets; secrets must **never** be included in LFS files.

---

## CI/CD & Pre-Deployment Security
- All Pull Requests modifying critical components must pass **automated security scans** (CodeQL, ESLint security rules) before merging.  
- Branch protection rules enforce required code review approvals and status checks.  
- Environment secrets are restricted to authorized personnel only.

