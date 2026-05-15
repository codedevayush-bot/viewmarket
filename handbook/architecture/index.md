# Architecture

Technical stack, API design, and infrastructure decisions.

## Goals

- Scalable, maintainable Next.js application
- Secure API layer with proper validation
- Reliable deployment pipeline (AWS ECS)
- Clear separation of concerns across layers

## Files

- `enterprise-architecture.md` — **Authoritative architecture reference** (stack, structure, patterns, security, deployment)
- `stack.md` — Framework, key dependencies, database, hosting
- `api.md` — API route conventions, request/response patterns
- `deployment.md` — AWS infrastructure, CI/CD, environment management

## Current Stack

- **Framework:** Next.js 16.x (App Router)
- **Language:** TypeScript 5.x (strict mode)
- **Styling:** Tailwind CSS v4 + CSS Modules + CSS Custom Properties
- **Auth:** Auth.js v5 (NextAuth) with Neon adapter
- **Database:** Neon Postgres (serverless)
- **Hosting:** AWS ECS (Fargate)
- **CI/CD:** GitHub Actions (OIDC)
- **IaC:** Terraform

## Status

_In progress — core infrastructure operational. See `enterprise-architecture.md` for full technical reference._
