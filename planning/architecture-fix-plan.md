# ViewMarket — Architecture & Optimization Fix Plan

> Comprehensive audit and remediation plan for all architectural, security, and code quality issues.
> Created: 2026-05-15

---

## Executive Summary

A full audit of the ViewMarket codebase identified **41 findings** across security, architecture, code quality, and missing enterprise features. This plan organizes them into actionable phases by priority.

**Critical (must fix now):** 4 items
**High (fix this sprint):** 8 items
**Medium (fix next sprint):** 12 items
**Low (backlog):** 9 items
**Already good (no action):** 8 items

---

## Phase 0: Critical — Security Holes (Do First)

### 0.1 Remove `.mcp.json` from Git & Rotate Exposed Keys

**Problem:** `.mcp.json` contains hardcoded API keys (Context7, Neon, Firecrawl) in plaintext. Already committed to git history.

**Fix:**

1. Add `.mcp.json` to `.gitignore`
2. Remove from git tracking: `git rm --cached .mcp.json`
3. Rotate all three API keys (Context7, Neon, Firecrawl)
4. Document key rotation in `handbook/architecture/` or runbook

**Files:**

- `.gitignore` (add `.mcp.json`)
- `.mcp.json` (remove from tracking, keep locally)

---

### 0.2 Remove Hardcoded Encryption Fallback Key

**Problem:** `lib/encryption.ts` line 8 has a hardcoded fallback key `0123456789abcdef...` used when `ENCRYPTION_KEY` is unset. If deployed without the env var, all broker credentials use a publicly known key.

**Fix:**

1. Remove the fallback key entirely
2. Throw a startup error if `ENCRYPTION_KEY` is not set in production
3. Keep fallback only in development/test with a clear warning log

**File:** `lib/encryption.ts`

---

### 0.3 Add Content-Security-Policy Header

**Problem:** No CSP header configured. Essential for a financial platform to prevent XSS.

**Fix:** Add CSP to the security headers in `next.config.ts`:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.viewmarket.in wss:; frame-ancestors 'none';
```

**File:** `next.config.ts`

---

### 0.4 Remove OAuth Dummy Fallback Values

**Problem:** `auth.ts` lines 19-20 use `process.env.AUTH_GOOGLE_ID || 'dummy'` — causes confusing runtime errors instead of failing fast.

**Fix:**

1. Remove fallback values
2. Add startup validation that required OAuth env vars are set
3. Fail with clear error message if missing

**File:** `auth.ts`

---

## Phase 1: High Priority — Core Architecture Fixes

### 1.1 Add Input Validation with Zod

**Problem:** No validation library. API routes do manual checks or none at all.

**Fix:**

1. Install zod: `npm install zod`
2. Create validation schemas for all API route request bodies:
   - `POST /api/user/brokers/connect` — broker credentials schema
   - `POST /api/tickets` — ticket creation schema
   - `POST /api/tickets/[id]/messages` — message schema
   - `POST /api/user/brokers/test` — test connection schema
3. Create a `validateRequest()` helper in `lib/`
4. Apply to all POST/PUT handlers

**Files:**

- `package.json` (add zod)
- `lib/validate.ts` (new — shared validation helper)
- `app/api/user/brokers/connect/route.ts`
- `app/api/tickets/route.ts`
- `app/api/tickets/[id]/messages/route.ts`
- `app/api/user/brokers/test/route.ts`

---

### 1.2 Add Rate Limiting

**Problem:** No rate limiting on any API endpoint. Financial endpoints vulnerable to abuse.

**Fix:**

1. Implement in-memory rate limiter (or use `@upstash/ratelimit` with Redis for production)
2. Apply to:
   - `/api/tickets` — 10 requests/minute per user
   - `/api/user/brokers/connect` — 5 requests/minute per user
   - `/api/user/brokers/token-exchange` — 5 requests/minute per user
   - `/api/brokers/callback` — 10 requests/minute per IP
3. Add rate limit headers (`X-RateLimit-*`)

**Files:**

- `lib/rate-limit.ts` (new)
- All financial API route files

---

### 1.3 Implement Structured Logging

**Problem:** All logging is `console.log`/`console.error`. No structured output for monitoring.

**Fix:**

1. Install pino: `npm install pino pino-pretty`
2. Create `lib/logger.ts` with structured logger
3. Replace all `console.log`/`console.error` in:
   - `auth.ts` (security audit events)
   - `lib/db.ts` (query logging)
   - `lib/encryption.ts`
   - All API route handlers
4. Add request ID generation in middleware for distributed tracing

**Files:**

- `package.json` (add pino)
- `lib/logger.ts` (new)
- `middleware.ts` (add request ID)
- `auth.ts`
- `lib/db.ts`
- `lib/encryption.ts`
- All API route files

---

### 1.4 Implement Drizzle ORM

**Problem:** CLAUDE.md references Drizzle but it's not installed. Raw SQL with manual migrations is fragile.

**Fix:**

1. Install: `npm install drizzle-orm @neondatabase/serverless` and `npm install -D drizzle-kit`
2. Create `db/schema.ts` — define all tables with Drizzle schema
3. Create `drizzle.config.ts` — Drizzle Kit configuration
4. Add scripts to `package.json`: `db:generate`, `db:push`, `db:migrate`
5. Create `lib/db-drizzle.ts` — Drizzle client instance
6. Gradually migrate API routes from raw SQL to Drizzle queries
7. Generate initial migration from existing schema

**Files:**

- `package.json` (add drizzle deps + scripts)
- `drizzle.config.ts` (new)
- `db/schema.ts` (new — Drizzle schema definitions)
- `lib/db-drizzle.ts` (new — Drizzle client)
- API route files (gradual migration)

---

### 1.5 Add Per-Route Error Boundaries

**Problem:** Only root `error.tsx` exists. Route-level errors fall through to root.

**Fix:** Add `error.tsx` to each route group:

- `app/(main)/error.tsx`
- `app/(auth)/error.tsx`
- `app/user-dashboard/error.tsx`
- `app/admin/error.tsx`

**Files:** 4 new `error.tsx` files

---

### 1.6 Standardize Error Response Format

**Problem:** API routes return inconsistent error shapes.

**Fix:** Create shared error types and helper:

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public code: string,
    public status: number
  ) {
    super(message);
  }
}

export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }
  return Response.json(
    { error: 'Internal server error', code: 'INTERNAL' },
    { status: 500 }
  );
}
```

**Files:**

- `lib/api-error.ts` (new)
- All API route files (apply pattern)

---

### 1.7 Add API Versioning

**Problem:** All routes under `/api/` with no version prefix. Breaking changes will affect all clients.

**Fix:**

1. Create `app/api/v1/` directory
2. Move all current routes to `app/api/v1/`
3. Update all client-side fetch calls to use `/api/v1/`
4. Add redirect from `/api/*` to `/api/v1/*` for backward compatibility

**Files:**

- All API route files (move to `api/v1/`)
- All client-side fetch calls

---

### 1.8 Fix TypeScript Strict Configuration

**Problem:** `tsconfig.json` uses conservative `ES2017` target and misses stricter checks.

**Fix:** Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**File:** `tsconfig.json`

---

## Phase 2: Medium Priority — Code Quality & Patterns

### 2.1 Extract Navbar CSS from globals.css

**Problem:** `globals.css` contains ~250 lines of navbar-specific CSS. Violates project rule of co-located styles.

**Fix:** Move navbar styles to `app/components/Navbar.module.css`

**Files:**

- `app/globals.css` (remove navbar styles)
- `app/components/Navbar.module.css` (add navbar styles)

---

### 2.2 Replace Inline Styles in Error/Loading Pages

**Problem:** `error.tsx`, `not-found.tsx`, `loading.tsx` use inline styles instead of CSS tokens.

**Fix:** Convert inline styles to CSS Modules or Tailwind utilities referencing CSS custom properties.

**Files:**

- `app/error.tsx`
- `app/not-found.tsx`
- `app/loading.tsx`

---

### 2.3 Replace Browser `prompt()` and `alert()`

**Problem:** `app/user-dashboard/broker/page.tsx` uses native `prompt()` and `alert()` dialogs. Not suitable for enterprise.

**Fix:** Replace with custom modal components (reuse existing `SettingsModal` pattern).

**File:** `app/user-dashboard/broker/page.tsx`

---

### 2.4 Decouple Admin CSS from User Dashboard

**Problem:** `app/admin/layout.tsx` imports from `../user-dashboard/UserDashboard.module.css`.

**Fix:** Create dedicated `app/admin/AdminLayout.module.css` with admin-specific styles.

**Files:**

- `app/admin/AdminLayout.module.css` (new)
- `app/admin/layout.tsx` (update import)

---

### 2.5 Fix package.json Identity

**Problem:** `name` is `"my-app"` — should be `"viewmarket"`.

**Fix:** Update `package.json` name to `"viewmarket"`.

**File:** `package.json`

---

### 2.6 Remove Duplicate Theme Script

**Problem:** `public/theme-init.js` duplicates the inline script in `app/layout.tsx`.

**Fix:** Verify `theme-init.js` is not referenced anywhere, then delete it.

**Files:**

- `public/theme-init.js` (delete if unused)

---

### 2.7 Add Missing Loading States

**Problem:** Only root and admin have `loading.tsx`. Most dashboard sub-routes lack loading states.

**Fix:** Add `loading.tsx` to key dashboard routes:

- `app/user-dashboard/charts/loading.tsx`
- `app/user-dashboard/broker/loading.tsx`
- `app/user-dashboard/support/loading.tsx`

**Files:** 3 new `loading.tsx` files

---

### 2.8 Add Missing Navigation Pages

**Problem:** Dashboard nav references pages that fall through to catch-all placeholder:

- `/user-dashboard/strategy-portfolio`
- `/user-dashboard/profile`
- `/user-dashboard/api-key`

**Fix:** Either create dedicated page files or update navigation to explicitly mark them as placeholder routes.

**Files:**

- `app/user-dashboard/navigation.ts` (update or create pages)

---

### 2.9 Add CORS Configuration

**Problem:** No explicit CORS configuration beyond Next.js defaults.

**Fix:** Add CORS headers for API routes in middleware or next.config.ts, restricting to `viewmarket.in` origins.

**File:** `next.config.ts` or `middleware.ts`

---

### 2.10 Add Request Size Limits

**Problem:** No request size limits configured on API routes.

**Fix:** Add body size limits in middleware or route handlers (e.g., 1MB for ticket creation, 10MB for file uploads via presigned URL).

**File:** `middleware.ts` or individual route handlers

---

### 2.11 Add Database Connection Pool Monitoring

**Problem:** No visibility into connection pool health.

**Fix:** Add pool event listeners in `lib/db.ts` for connection/error events, log via structured logger.

**File:** `lib/db.ts`

---

### 2.12 Add Graceful Shutdown

**Problem:** No graceful shutdown handling for the database pool.

**Fix:** Add `process.on('SIGTERM')` handler to drain the pool before exit.

**File:** `lib/db.ts`

---

## Phase 3: Low Priority — Polish & Backlog

### 3.1 Add `format:check` Script

**Problem:** Referenced in CLAUDE.md but missing from package.json.

**Fix:** Add `"format:check": "prettier --check ."` to scripts.

**File:** `package.json`

---

### 3.2 Document Missing Env Vars in `.env.local.example`

**Problem:** Missing `ENCRYPTION_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`.

**Fix:** Add to `.env.local.example` with descriptions.

**File:** `.env.local.example`

---

### 3.3 Add Middleware Tests

**Problem:** No tests for middleware logic.

**Fix:** Create `tests/middleware.test.ts` testing:

- Public route access
- Auth redirects
- Admin route protection
- WWW redirect

**File:** `tests/middleware.test.ts` (new)

---

### 3.4 Add API Route Integration Tests

**Problem:** Only 2 API routes have tests. Tickets, user brokers untested.

**Fix:** Add integration tests for:

- `POST /api/tickets` (create ticket)
- `GET /api/user/brokers` (list connections)
- `POST /api/user/brokers/connect` (connect broker)

**Files:** New test files in `tests/app/api/`

---

### 3.5 Add E2E Testing with Playwright

**Problem:** No end-to-end tests for critical flows.

**Fix:**

1. Install Playwright: `npm install -D @playwright/test`
2. Create E2E tests for:
   - Sign-in flow (OAuth)
   - Connect broker
   - View charts
   - Create ticket

**Files:**

- `package.json` (add playwright)
- `playwright.config.ts` (new)
- `e2e/` directory (new)

---

### 3.6 Add Bundle Analysis

**Problem:** No visibility into bundle size.

**Fix:** Install `@next/bundle-analyzer` and add `analyze` script.

**Files:**

- `package.json` (add analyzer + script)
- `next.config.ts` (wrap with analyzer)

---

### 3.7 Add Database Migration Rollback Strategy

**Problem:** `002_fix_column_names.sql` uses `DROP TABLE ... CASCADE` with no rollback.

**Fix:** Create rollback migrations and document migration procedures.

**Files:**

- `db/migrations/002_fix_column_names_rollback.sql` (new)
- `handbook/architecture/database-migrations.md` (new)

---

### 3.8 Add `unstable_cache` for Semi-Static Data

**Problem:** No caching strategy for data that changes infrequently.

**Fix:** Cache with tags for:

- Broker list (`GET /api/brokers`)
- User profile data
- FAQ content

**Files:** Relevant API route files

---

### 3.9 Update CLAUDE.md to Match Reality

**Problem:** CLAUDE.md references Drizzle ORM and scripts that don't exist yet.

**Fix:** Update CLAUDE.md to accurately reflect current state, or implement the missing pieces (Phase 1.4).

**File:** `CLAUDE.md`

---

## Phase 4: Already Good (No Action Needed)

These are strengths to maintain:

1. **Broker adapter pattern** — clean interface, factory, 30+ implementations
2. **AES-256-GCM encryption** — proper credential protection
3. **Database sessions** — server-side revocation over JWT
4. **Security headers** — HSTS, X-Frame-Options, etc.
5. **Theme flash prevention** — inline script pattern
6. **Shared DB pool** — singleton pattern
7. **RBAC in middleware** — admin/user routing
8. **OAuth state encryption** — CSRF protection
9. **Token refresh cron** — batch processing
10. **S3 presigned URLs** — secure uploads
11. **Broker adapter tests** — 30 test files
12. **Multi-stage Docker** — non-root user, standalone
13. **OIDC GitHub Actions** — no long-lived AWS keys
14. **Health check endpoint** — container orchestration

---

## Execution Summary

| Phase                 | Items             | Effort       | Dependencies     |
| --------------------- | ----------------- | ------------ | ---------------- |
| 0 — Critical Security | 4                 | 1-2 days     | None             |
| 1 — High Priority     | 8                 | 3-5 days     | Phase 0 complete |
| 2 — Medium Priority   | 12                | 3-4 days     | Phase 1 complete |
| 3 — Low Priority      | 9                 | 2-3 days     | Can parallelize  |
| **Total**             | **33 actionable** | **~2 weeks** |                  |

### Recommended Execution Order

1. **Day 1:** Phase 0 (all 4 critical security fixes)
2. **Day 2-3:** Phase 1.1-1.3 (zod, rate limiting, structured logging)
3. **Day 4-5:** Phase 1.4-1.8 (Drizzle, error boundaries, API versioning, TS config)
4. **Day 6-8:** Phase 2 (code quality fixes, can parallelize)
5. **Day 9-10:** Phase 3 (polish, testing, documentation)

---

## Verification Checklist

After all phases complete:

- [ ] No hardcoded secrets in git history
- [ ] All API routes have input validation
- [ ] Rate limiting on financial endpoints
- [ ] Structured logging throughout
- [ ] Drizzle ORM managing schema
- [ ] Error boundaries at every route level
- [ ] API versioned under `/api/v1/`
- [ ] TypeScript strict config applied
- [ ] No inline styles or hardcoded colors
- [ ] All CSS in modules or Tailwind
- [ ] Loading states on all routes
- [ ] Middleware + API tests passing
- [ ] Build succeeds with no warnings
- [ ] Health check returns 200
