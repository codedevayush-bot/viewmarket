# Enterprise Architecture — ViewMarket

> Authoritative technical architecture for the ViewMarket platform.
> Last updated: 2026-05-15

---

## 1. Stack Overview

| Layer        | Technology                                            | Version      |
| ------------ | ----------------------------------------------------- | ------------ |
| Framework    | Next.js (App Router)                                  | 16.x         |
| Language     | TypeScript (strict)                                   | 5.x          |
| UI Library   | React                                                 | 19.x         |
| Styling      | Tailwind CSS v4 + CSS Modules + CSS Custom Properties | 4.x          |
| Auth         | Auth.js v5 (NextAuth) with Neon adapter               | 5.0.0-beta.x |
| Database     | Neon Postgres (serverless)                            | —            |
| ORM          | Drizzle ORM + Drizzle Kit                             | (planned)    |
| State/Data   | SWR for client-side data fetching                     | —            |
| Charts       | Lightweight Charts (TradingView)                      | —            |
| File Storage | AWS S3 (ticket attachments)                           | —            |
| Hosting      | AWS ECS Fargate                                       | —            |
| CI/CD        | GitHub Actions (OIDC)                                 | —            |
| IaC          | Terraform                                             | —            |
| Testing      | Vitest + React Testing Library + MSW                  | 4.x          |

---

## 2. Project Structure

```
vm/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Public marketing routes (no URL slug)
│   │   ├── layout.tsx            # Navbar + ThemeSwitcher
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/page.tsx
│   │   └── contact/page.tsx
│   ├── (auth)/                   # Auth routes
│   │   ├── sign-in/page.tsx
│   │   └── error/page.tsx
│   ├── user-dashboard/           # Protected user area
│   │   ├── layout.tsx            # DashboardShell + session guard
│   │   ├── loading.tsx           # Suspense skeleton
│   │   ├── navigation.ts         # Sidebar nav config
│   │   ├── console/              # Main dashboard
│   │   ├── broker/               # Broker management
│   │   ├── charts/               # TradingView charts
│   │   ├── strategy-studio/      # Strategy builder
│   │   ├── support/              # Tickets, FAQ, callbacks
│   │   └── [...slug]/            # Catch-all for placeholder pages
│   ├── admin/                    # Protected admin area
│   │   ├── layout.tsx            # AdminSidebar
│   │   ├── loading.tsx
│   │   ├── navigation.ts
│   │   ├── users/
│   │   ├── brokers/
│   │   ├── tickets/
│   │   └── settings/
│   ├── api/                      # Route handlers (BFF pattern)
│   │   ├── auth/[...nextauth]/   # NextAuth catch-all
│   │   ├── health/               # Health check
│   │   ├── brokers/              # Broker registry + OAuth
│   │   ├── user/brokers/         # User broker connections
│   │   ├── tickets/              # Support tickets
│   │   └── cron/                 # Scheduled tasks
│   ├── components/               # Shared UI components
│   ├── legal/                    # Static legal pages
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Design tokens + Tailwind
│   ├── error.tsx                 # Root error boundary
│   ├── not-found.tsx             # Root 404
│   └── loading.tsx               # Root loading
├── lib/                          # Shared server-side utilities
│   ├── db.ts                     # Neon pool singleton
│   ├── encryption.ts             # AES-256-GCM
│   ├── s3.ts                     # S3 client
│   └── brokers/                  # Broker adapter system
│       ├── types.ts              # IBrokerAdapter interface
│       ├── BrokerFactory.ts      # Factory pattern
│       ├── adapters/             # 30+ broker implementations
│       ├── docs/                 # Per-broker documentation
│       └── utils/                # TOTP, helpers
├── db/
│   └── migrations/               # Raw SQL migrations
├── types/                        # Shared TypeScript declarations
├── tests/                        # Test suite (mirrors app structure)
├── infra/                        # Terraform IaC
├── handbook/                     # Living documentation
├── public/                       # Static assets
└── planning/                     # AI agent planning workspace
```

### Key Principles

- **Route groups** `(groupName)` apply different layouts without affecting URLs
- **Server Components by default** — only add `'use client'` when interactivity is needed
- **Co-located styles** — every component has a `.module.css` file alongside it
- **Shared components** in `app/components/`, route-specific components alongside their `page.tsx`
- **Single source of truth** for navigation in `navigation.ts` files per area

---

## 3. Theming & Styling Architecture

### Three-Layer System

```
┌─────────────────────────────────────────┐
│  Layer 1: CSS Custom Properties         │
│  globals.css — design tokens            │
│  Dark (#121212) / Light (#ffffff)       │
├─────────────────────────────────────────┤
│  Layer 2: Tailwind CSS v4               │
│  @theme directive maps tokens to        │
│  utility classes                        │
├─────────────────────────────────────────┤
│  Layer 3: CSS Modules                   │
│  Component-scoped styles                │
│  *.module.css co-located with component │
└─────────────────────────────────────────┘
```

### Design Tokens (CSS Custom Properties)

```css
/* Dark theme (default) */
--bg-page: #121212 --bg-surface-1: #1a1a1a --bg-surface-2: #242424
  --bg-hover: #2d2d2d --border-subtle: rgba(255, 255, 255, 0.08)
  --border-strong: rgba(255, 255, 255, 0.15) --text-primary: #e4e4e7
  --text-secondary: #a1a1aa /* Light theme */ --bg-page: #ffffff
  --bg-surface-1: #f5f5f7 --bg-surface-2: #e8e8ed --bg-hover: #d4d4d8
  --border-subtle: rgba(24, 24, 27, 0.08) --text-primary: #18181b
  --text-secondary: #52525b;
```

### Rules

1. **No hardcoded colors** — all colors must reference CSS custom properties
2. **No inline styles** — use CSS Modules or Tailwind utilities
3. **No component CSS in globals.css** — component styles belong in `.module.css` files
4. **Tailwind for layout utilities** — spacing, flex, grid, responsive breakpoints
5. **CSS Modules for component-specific styles** — complex selectors, animations, pseudo-elements
6. **Alpha overlays for elevation** — `rgba(255, 255, 255, 0.015)` for surface depth

---

## 4. Authentication Architecture

### Flow

```
User → middleware.ts → auth() check → redirect/allow
                ↓
         NextAuth v5 (Neon adapter)
                ↓
         Database sessions (not JWT)
                ↓
         Session cookie (httpOnly, sameSite: lax, secure in prod)
```

### Session Strategy

- **Database-backed sessions** — enables server-side revocation
- **24-hour maxAge**, 1-hour updateAge
- **Role-based access** — `user.role` field (admin/user) in session callback
- **OAuth providers** — Google, GitHub
- **Custom pages** — `/sign-in`, `/auth/error`

### Middleware Guards

| Route Pattern                           | Access                                        |
| --------------------------------------- | --------------------------------------------- |
| `/`, `/pricing`, `/contact`, `/legal/*` | Public                                        |
| `/sign-in`                              | Public (redirects authenticated users)        |
| `/user-dashboard/*`                     | Authenticated users                           |
| `/admin/*`                              | Admin role only                               |
| `/api/*`                                | Authenticated (except health, auth callbacks) |

---

## 5. Database Architecture

### Connection Pattern

```typescript
// lib/db.ts — Singleton pool
import { Pool } from '@neondatabase/serverless';

const dbPool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  const result = await dbPool.query(text, params);
  // Debug logging in non-production
  return result;
}
```

### Schema Management (Target State)

- **Drizzle ORM** for type-safe queries and schema definitions
- **Drizzle Kit** for migration generation and management
- **Schema file:** `db/schema.ts` — single source of truth
- **Migrations:** `db/migrations/` — generated by Drizzle Kit, version-controlled

### Core Tables

| Table                 | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `users`               | User accounts with roles                 |
| `accounts`            | OAuth provider links                     |
| `sessions`            | Database sessions                        |
| `verification_tokens` | Email verification                       |
| `brokers`             | Broker registry (30+)                    |
| `broker_connections`  | User-broker credential links (encrypted) |
| `trades`              | Trade execution records                  |
| `tickets`             | Support tickets                          |
| `ticket_messages`     | Ticket thread messages                   |
| `ticket_attachments`  | S3 file references                       |

---

## 6. API Architecture

### Conventions

- **BFF pattern** — API routes act as Backend-for-Frontend, orchestrating calls to external services
- **Domain-organized** — routes grouped by business domain (brokers, tickets, users)
- **Auth via middleware** — all `/api/*` routes pass through auth middleware
- **Input validation** — zod schemas for all request bodies (target state)
- **Standardized errors** — `{ error: string, code: string, status: number }` format

### Route Organization

```
/api/
├── auth/[...nextauth]/     # NextAuth handler
├── health/                 # GET — database connectivity
├── brokers/
│   ├── route.ts            # GET — list all brokers
│   ├── oauth/route.ts      # GET — initiate OAuth
│   └── callback/route.ts   # GET — OAuth callback
├── user/brokers/
│   ├── route.ts            # GET — user's connections
│   ├── connect/route.ts    # POST — add connection
│   ├── test/route.ts       # POST — test connection
│   └── token-exchange/     # POST — exchange tokens
├── tickets/
│   ├── route.ts            # GET/POST — list/create
│   ├── presigned-url/      # POST — S3 upload URL
│   └── [id]/
│       ├── route.ts        # GET/PUT — ticket detail
│       └── messages/       # GET/POST — messages
└── cron/
    └── refresh-tokens/     # GET — batch token refresh
```

### Error Response Format

```typescript
interface ApiError {
  error: string; // Human-readable message
  code: string; // Machine-readable code (e.g., 'BROKER_NOT_FOUND')
  status: number; // HTTP status code
  details?: unknown; // Additional context (dev only)
}
```

---

## 7. Broker Integration Architecture

### Adapter Pattern

```
┌──────────────────┐
│  IBrokerAdapter   │  ← Interface (lib/brokers/types.ts)
│  authenticate()   │
│  getProfile()     │
│  getFunds()       │
│  placeOrder()     │
│  refreshToken()?  │
└────────┬─────────┘
         │
    ┌────┴────┐
    │ Factory  │  ← BrokerFactory.createAdapter(brokerName)
    └────┬────┘
         │
    ┌────┴────────────────────────────┐
    │  30+ Adapter Implementations    │
    │  Zerodha, AngelOne, Fyers, ... │
    └─────────────────────────────────┘
```

### Credential Security

- **AES-256-GCM encryption** for all stored credentials
- **Format:** `iv:salt:tag:encryptedData`
- **Key derivation:** scrypt from `ENCRYPTION_KEY` environment variable
- **Token refresh cron** — batch job refreshes expiring tokens every 4 hours
- **No plaintext secrets** — API keys, secrets, and tokens always encrypted at rest

---

## 8. Performance Architecture

### Server-Side

- **Server Components by default** — zero JS sent to client for static content
- **Streaming with Suspense** — `loading.tsx` at every route level
- **Parallel data fetching** — `Promise.all()` for independent queries
- **`unstable_cache` with tags** — cache semi-static data (user profiles, broker lists)
- **`output: 'standalone'`** — minimal Docker image for deployment

### Client-Side

- **SWR for data fetching** — stale-while-revalidate for broker data, tickets
- **`optimizePackageImports`** — tree-shaking for lightweight-charts, SWR
- **Dynamic imports** — heavy components (charts) loaded with `next/dynamic`
- **AVIF/WebP images** — modern formats with fallbacks
- **CSS Modules** — automatic code-splitting per component

### Targets

| Metric                   | Target  |
| ------------------------ | ------- |
| First Contentful Paint   | < 1.5s  |
| Largest Contentful Paint | < 2.5s  |
| Cumulative Layout Shift  | < 0.1   |
| Time to Interactive      | < 3.5s  |
| API response time (p95)  | < 500ms |

---

## 9. Testing Architecture

### Pyramid

```
         ╱╲
        ╱ E2E ╲         Playwright (planned)
       ╱────────╲        Critical user flows
      ╱ Integration╲     MSW + page-level tests
     ╱────────────────╲  API routes, auth flows
    ╱   Component Tests ╲ React Testing Library
   ╱──────────────────────╲ UI in isolation
  ╱     Unit Tests         ╲ Vitest
 ╱────────────────────────────╲ Pure functions, utilities
```

### Current Coverage

- **30 broker adapter tests** — comprehensive
- **2 API route tests** — callback, oauth
- **1 component test** — BrokerModal
- **Missing:** middleware, auth, encryption, tickets API, dashboard pages

### Target Coverage

- All `lib/` utility functions: 100%
- All API routes: integration tests with MSW
- All shared components: render + interaction tests
- Middleware: isolated unit tests
- Critical flows: E2E (sign-in, connect broker, view charts)

---

## 10. Deployment Architecture

### Pipeline

```
GitHub Push (master)
    ↓
GitHub Actions (OIDC → AWS)
    ↓
Docker Build (multi-stage)
    ↓
Push to ECR
    ↓
ECS Task Definition Update
    ↓
CodeDeploy (blue/green target)
    ↓
Health Check (/api/health)
    ↓
Traffic Shift
```

### Docker

- **Base:** Node 20 Alpine
- **Multi-stage:** deps → builder → runner
- **Non-root user:** `nextjs:nodejs`
- **Standalone output:** minimal server.js + node_modules
- **Health check:** `curl -f http://localhost:3000/api/health`

### Infrastructure (Terraform)

- VPC with public/private subnets
- ECS Fargate service
- ECR repository
- Route53 DNS + ACM TLS
- CloudWatch monitoring
- S3 for attachments
- KMS for secrets
- GitHub OIDC for CI/CD

---

## 11. Security Architecture

### Headers (next.config.ts)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: (target — see fix plan)
```

### Data Protection

- **Credentials:** AES-256-GCM encryption at rest
- **Sessions:** Database-backed, server-side revocation
- **Cookies:** httpOnly, sameSite: lax, secure in production
- **OAuth state:** Encrypted to prevent CSRF
- **File uploads:** S3 presigned URLs with expiration

### Access Control

- **RBAC:** admin/user roles enforced in middleware
- **Route guards:** middleware.ts redirects based on role
- **API auth:** NextAuth session validation on all endpoints
- **Admin isolation:** separate layout, sidebar, and route group

---

## 12. Monitoring & Observability (Target State)

| Layer          | Tool                      | Purpose                        |
| -------------- | ------------------------- | ------------------------------ |
| Application    | Structured logging (pino) | Request/response audit trails  |
| Infrastructure | CloudWatch                | Container metrics, alarms      |
| Database       | Neon dashboard            | Query performance, connections |
| Uptime         | Health check endpoint     | `/api/health`                  |
| Errors         | Error boundaries          | Per-route `error.tsx`          |
| Performance    | Next.js instrumentation   | APM integration                |

---

## 13. Environment Variables

| Variable                | Required | Purpose                               |
| ----------------------- | -------- | ------------------------------------- |
| `DATABASE_URL`          | Yes      | Neon Postgres connection string       |
| `AUTH_SECRET`           | Yes      | NextAuth session encryption           |
| `AUTH_URL`              | Yes      | Application URL                       |
| `AUTH_TRUST_HOST`       | Yes      | Trust proxy headers                   |
| `AUTH_GOOGLE_ID`        | Yes      | Google OAuth client ID                |
| `AUTH_GOOGLE_SECRET`    | Yes      | Google OAuth client secret            |
| `AUTH_GITHUB_ID`        | Yes      | GitHub OAuth client ID                |
| `AUTH_GITHUB_SECRET`    | Yes      | GitHub OAuth client secret            |
| `ENCRYPTION_KEY`        | Yes      | AES-256 key for credential encryption |
| `CRON_SECRET`           | Yes      | Auth token for cron endpoints         |
| `AWS_REGION`            | Yes      | AWS region                            |
| `AWS_ACCESS_KEY_ID`     | Yes      | AWS credentials                       |
| `AWS_SECRET_ACCESS_KEY` | Yes      | AWS credentials                       |
| `AWS_S3_TICKETS_BUCKET` | Yes      | S3 bucket for ticket attachments      |
| `NEON_PROJECT_ID`       | Yes      | Neon project ID                       |

---

## 14. Decision Log

| Date       | Decision                                               | Rationale                                                                                            |
| ---------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| 2026-05-15 | CSS custom properties + CSS Modules over Tailwind-only | Design token system needs alpha overlays and layered surfaces that Tailwind doesn't natively support |
| 2026-05-15 | Database sessions over JWT                             | Server-side revocation for trading platform security                                                 |
| 2026-05-15 | Adapter pattern for brokers                            | 30+ broker integrations need consistent interface with independent implementations                   |
| 2026-05-15 | ECS Fargate over Vercel                                | AWS ecosystem for S3, CloudWatch, and infrastructure control                                         |
| 2026-05-15 | Drizzle ORM (planned) over Prisma                      | Lighter weight, better Neon serverless compatibility                                                 |
