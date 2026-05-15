# Authentication

User authentication and session management for ViewMarket.

## Goals

- Secure, frictionless sign-up and sign-in
- Support multiple auth providers (email/password, OAuth)
- Financial-grade session security
- Clear error states and recovery flows

## Files

- `flow.md` — Sign-up, sign-in, password reset, email verification flows
- `providers.md` — Supported providers (Google, GitHub, email) and configuration
- `security.md` — Token strategy, session handling, CSRF, rate limiting

## Current Implementation

- Auth.js (NextAuth v5) with Neon adapter
- Google and GitHub OAuth providers
- Email/password with bcrypt
- Session strategy: JWT

## Status

_In progress — core auth working, refinement ongoing._
