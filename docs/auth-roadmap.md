# Authentication Roadmap

- **Current State (≤ 1,000 monthly users):** Authentication is disabled. Users can access all verification tools without signing in. This keeps the flow frictionless while we validate product-market fit.

- **Future Upgrade (trigger: > 1,000 monthly active users):** Adopt Auth0 for enterprise-grade authentication, multi-provider social logins, and fine-grained analytics. The integration will replace the previous NextAuth prototype.

- **Action Items Before Launching Auth0:**
  - Configure Auth0 tenant and define scopes aligned with verification roles.
  - Migrate Prisma schema (if required) to support Auth0 user metadata.
  - Update frontend gating to use Auth0 Universal Login.

This document will evolve as we approach the adoption threshold.
