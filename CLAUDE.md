# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ViewMarket — an enterprise-grade algorithmic trading platform integrating 30+ brokers, built with Next.js 16 App Router, React 19, and Neon Postgres.

## Delegation Protocol

- For **all ViewMarket project work**, the top-level/main agent must act only as an **orchestration layer**.
- Any task involving **writing, editing, refactoring, implementing, or debugging code** MUST be routed to the **coding-agent** instead of being completed directly by the main agent.
- Any task involving **research, investigation, discovery, comparison, or information gathering** MUST be routed to the **research-agent**.
- The **coding-agent** and **research-agent** are the working specialists and may orchestrate their own subtasks as needed.
- If either specialist agent needs clarification, the top-level agent should ask the user, relay the answer back to that specialist, and continue execution through the specialist rather than taking over the work directly.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run format:check # Check Prettier formatting
npm run analyze      # Bundle analysis
npm run db:push      # Push Drizzle schema to Neon
npm run db:generate  # Generate Drizzle migration
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
npx vitest           # Run tests in watch mode
npx vitest run       # Single test pass
npm run e2e          # Run Playwright E2E tests
npm run e2e:ui       # Run Playwright with UI
```

## Architecture

### Routing & Layout

- **App Router** (`app/`) with route groups: `(main)` for public pages, `(auth)` for auth pages, `user-dashboard/` for authenticated users, `admin/` for admin-only
- **Middleware** (`middleware.ts`) handles: auth protection, admin/user role redirects, www redirect, public route allowlisting, request ID generation
- **Root layout** (`app/layout.tsx`) sets up: Inter font via `next/font/google`, ThemeProvider, SessionProvider, and inline theme-flash-prevention script
- **Dashboard layout** (`app/user-dashboard/layout.tsx`) is a server component; client interactivity (popout detection via `useSearchParams`) lives in `DashboardShell.tsx`
- **Error boundaries** at every route level: `app/error.tsx`, `app/(main)/error.tsx`, `app/(auth)/error.tsx`, `app/user-dashboard/error.tsx`, `app/admin/error.tsx`

### Auth

- **next-auth v5** (`auth.ts`) with Neon adapter (`@auth/neon-adapter`)
- Providers: Google OAuth, GitHub OAuth
- Session strategy: database (not JWT), 24h maxAge, 1h updateAge
- RBAC: `user.role` field drives admin vs user routing in middleware
- `SessionProvider` (`app/providers/SessionProvider.tsx`) wraps the app as a client component
- OAuth env vars validated at startup — fails fast in production if missing

### Database

- **Neon Postgres** via `@neondatabase/serverless`
- Shared connection pool in `lib/db.ts` (`dbPool`) — all routes must import from here, never create `new Pool()`
- **Drizzle ORM** for schema management (`db/schema.ts`, `drizzle.config.ts`)
- Pool monitoring via event listeners, graceful shutdown on SIGTERM
- Slow query logging (>1s threshold)

### Theming

- CSS custom properties in `globals.css` drive all colors — no hardcoded hex values in components
- Dark theme (`:root`): `#121212` base (Material Design standard)
- Light theme (`[data-theme='light']`): `#ffffff` base (industry standard)
- ThemeProvider (`app/providers/ThemeProvider.tsx`) manages dark/light/system via `data-theme` attribute on `<html>`
- Inline script in `<head>` prevents flash of wrong theme before React hydrates

### CSS Strategy

- **globals.css**: Design tokens (colors, borders, text, semantic accents) and Tailwind import — keep under 500 lines
- **CSS Modules** (`.module.css`): Per-component scoped styles — 41+ files, auto-scoped, tree-shakeable
- **Shared error styles** in `app/components/ErrorPage.module.css` for error/loading/not-found pages
- Never put component styles in globals.css; never use hardcoded hex values — always reference CSS custom properties

### Data Fetching

- **SWR** for client-side data fetching with caching (admin ticket pages)
- **Server components** for static/SEO content — prefer server components by default
- `use client` only for: state, effects, browser APIs, event handlers

### API Architecture

- **BFF pattern** — API routes act as Backend-for-Frontend
- **Input validation** via zod schemas (`lib/validate.ts`) on all POST/PUT handlers
- **Rate limiting** via in-memory limiter (`lib/rate-limit.ts`) on financial endpoints
- **Structured logging** via pino (`lib/logger.ts`) — replaces all console.log/console.error
- **Standardized errors** via `ApiError` class and `errorResponse()` helper (`lib/api-error.ts`)
- **CORS headers** configured in `next.config.ts` for API routes
- **Request IDs** added in middleware for distributed tracing

### Broker Integration (Factory + Adapter)

- **`IBrokerAdapter` interface** (`lib/brokers/types.ts`) defines the contract: `authenticate()`, `handleOAuthCallback?()`, `refreshToken?()`, `getProfile()`, `getFunds()`, `placeOrder()`
- **`BrokerFactory.createAdapter()`** (`lib/brokers/BrokerFactory.ts`) maps broker name strings to adapter instances
- **30+ adapters** in `lib/brokers/adapters/` (Zerodha, Upstox, AngelOne, Fyers, Dhan, Groww, KotakNeo, Shoonya, etc.)
- **TOTP support** in `lib/brokers/utils/totp.ts` for brokers requiring 2FA
- **AES-256-GCM encryption** (`lib/encryption.ts`) for broker credentials: `encrypt()`, `decrypt()`, `maskSecret()`
- **Encryption key required in production** — throws at startup if ENCRYPTION_KEY is missing
- **S3 integration** (`lib/s3.ts`) for ticket attachment uploads

### Testing

- **Vitest** with `jsdom` environment, globals enabled
- Setup file: `tests/setup.ts`
- Test pattern: `tests/**/*.{test,spec}.{ts,tsx}`
- **@testing-library/react** for component tests, **msw** for API mocking
- **Playwright** for E2E tests in `e2e/` directory

### Key Libraries

- `lightweight-charts` — TradingView charting (dynamically imported with `ssr: false`)
- `swr` — stale-while-revalidate data fetching
- `next-auth` — authentication
- `@auth/neon-adapter` — Neon DB session storage
- `@aws-sdk/client-s3` — S3 for ticket attachments
- `zod` — schema validation
- `pino` — structured logging
- `drizzle-orm` — type-safe ORM for Neon Postgres

## Critical Rules

1. **NEVER** run `npm run dev` or `npm run build` unless explicitly instructed
2. **Main agent is orchestration-only** — for ViewMarket work, route coding tasks to `coding-agent` and research/investigation tasks to `research-agent` instead of doing that work directly
3. **Server components by default** — only add `'use client'` when the component needs interactivity
4. **Dynamic imports** for heavy modals/charts — use `next/dynamic` with `{ ssr: false }` for browser-only components
5. **Use `next/image`** for all images — never raw `<img>` tags (configure `remotePatterns` in `next.config.ts` for external hosts)
6. **CSS tokens only** — all colors must reference `var(--bg-*)`, `var(--text-*)`, `var(--border-*)` custom properties, never hardcoded hex
7. **Shared DB pool** — import `dbPool` from `@/lib/db`, never instantiate `new Pool()`
8. **MCP servers**: Context7 for library docs, Firecrawl for web research, Neon for database operations (ask before destructive DB commands)
9. **Enterprise security** — no `allowDangerousEmailAccountLinking`, CSP headers configured, session token entropy via `crypto.randomUUID()`, ENCRYPTION_KEY required in production
10. **Use skills** — consult the relevant skill in `.agents/skills/` before performing tasks in its domain (see Skills section below)
11. **Input validation** — all API POST/PUT handlers must use zod schemas from `lib/validate.ts`
12. **Rate limiting** — financial endpoints must use `rateLimit()` from `lib/rate-limit.ts`
13. **Structured logging** — use `import logger from '@/lib/logger'` instead of console.log/console.error

## Skills (`.agents/skills/`)

Skills are specialized knowledge modules located in `.agents/skills/`. **You MUST consult the relevant skill before performing any task in its domain.** Read the skill's `SKILL.md` (and any `references/` or `rules/` files) before writing code.

### When to Use Each Skill

| Skill                             | Use When                                                               | Key Files                                                            |
| --------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **next-best-practices**           | Writing or reviewing any Next.js code (automatic — not user-invocable) | `SKILL.md`, `directives.md`, `rsc-boundaries.md`, `data-patterns.md` |
| **vercel-react-best-practices**   | Writing React components, optimizing performance, data fetching        | `SKILL.md`, `rules/*.md` (70 rules across 8 categories)              |
| **neon-postgres**                 | Any Neon database work — connections, branching, pooling, Auth         | `SKILL.md`                                                           |
| **neon-drizzle**                  | Drizzle ORM setup, schema creation, migrations, query patterns         | `SKILL.md`, `guides/*.md`, `references/*.md`                         |
| **typescript-advanced-types**     | Complex type patterns — generics, conditional types, mapped types      | `SKILL.md`                                                           |
| **tailwind-design-system**        | Tailwind v4 config, design tokens, component libraries, theming        | `SKILL.md`, `references/advanced-patterns.md`                        |
| **charting**                      | TradingView charts, candlestick rendering, technical indicators        | `SKILL.md`                                                           |
| **battle-plan**                   | Before new features, multi-file refactors, integrations, migrations    | `SKILL.md`                                                           |
| **planning-setup**                | Multi-session work, complex projects needing persistent context        | `SKILL.md`, `templates/*.md`                                         |
| **scalability-playbook**          | Performance bottlenecks, capacity planning, growth strategy            | `SKILL.md`                                                           |
| **devops-engineer**               | CI/CD, Docker, Kubernetes, Terraform, GitHub Actions, deployments      | `SKILL.md`, `references/*.md`                                        |
| **aws-cli**                       | AWS resource management — EC2, S3, ECS, Lambda, IAM                    | `SKILL.md`, `references/*.md`                                        |
| **webapp-testing**                | Playwright testing, UI verification, browser screenshots               | `SKILL.md`                                                           |
| **vercel-react-view-transitions** | Page transitions, route animations, shared element animations          | `SKILL.md`, `references/css-recipes.md`                              |
| **context7-mcp**                  | Fetching current library/framework documentation via Context7          | `SKILL.md`                                                           |
| **firecrawl**                     | Web research, scraping, crawling, fetching external content            | `SKILL.md`                                                           |

### Skill Usage Rules

1. **Read before writing** — Always read the relevant `SKILL.md` before starting work in that domain
2. **Follow the skill's patterns** — Skills contain curated best practices specific to this project; follow them over generic knowledge
3. **Reference files matter** — Check `references/` and `rules/` subdirectories for detailed guidance beyond the main SKILL.md
4. **Planning first for complex tasks** — Use `battle-plan` or `planning-setup` before any task with >5 tool calls or multi-file changes
5. **MCP skills for external data** — Use `context7-mcp` for library docs, `firecrawl` for web research, `neon-postgres` for DB operations

## File Conventions

- `app/**/page.tsx` — Route pages (server components unless interactive)
- `app/**/layout.tsx` — Route layouts (server components)
- `app/**/loading.tsx` — Loading skeletons (server components)
- `app/**/error.tsx` — Error boundaries (must have `'use client'`)
- `app/components/**/*.tsx` — Shared components
- `app/components/**/*.module.css` — Scoped component styles
- `app/providers/*.tsx` — Client-side context providers
- `lib/*.ts` — Shared utilities (db, auth, logging, validation, rate limiting)
- `middleware.ts` — Route protection, redirects, request ID generation
- `lib/brokers/adapters/*.ts` — Individual broker adapter implementations
- `lib/encryption.ts` — AES-256-GCM encryption for broker credentials
- `db/schema.ts` — Drizzle ORM schema definitions
- `drizzle.config.ts` — Drizzle Kit configuration

## Environment Variables

See `.env.local.example` for the full list. Key variables:

| Variable                                | Purpose                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------- |
| `AUTH_SECRET`                           | NextAuth secret (min 32 chars)                                            |
| `AUTH_URL`                              | Application URL                                                           |
| `DATABASE_URL`                          | Neon PostgreSQL connection string                                         |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth                                                              |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth                                                              |
| `ENCRYPTION_KEY`                        | 32-byte hex key for broker credential encryption (required in production) |
| `CRON_SECRET`                           | Auth token for cron endpoints                                             |
| `AWS_S3_TICKETS_BUCKET`                 | S3 bucket for ticket attachments                                          |
| `NEXT_PUBLIC_APP_URL`                   | Public app URL for OAuth callbacks                                        |
