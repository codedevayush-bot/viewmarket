# Broker Authorization Audit Plan: ViewMarket

This document outlines the systematic audit process for the 32 broker integrations to ensure enterprise-grade security, documentation compliance, and robust multi-tenant credential management.

## 1. Objective

To verify that every broker adapter follows the latest official API documentation, handles authentication securely, and adheres to the multi-tenant storage model where permanent credentials are preserved while transient session tokens are managed dynamically.

## 2. Audit Methodology

For each of the 32 brokers, we will follow this 4-step ritual:

### Step 1: Up-to-Date Research

- **Tools**: Context7 MCP (Primary for Library/SDK docs), Firecrawl MCP (Primary for Web Scraped API docs).
- **Target**: Fetch the latest "Authentication", "Login Flow", and "Token Management" sections from official developer portals.

### Step 2: Implementation Comparison

- **File**: `lib/brokers/adapters/[Broker]Adapter.ts`
- **Action**: Compare the current logic with the researched docs.
- **Verification points**:
  - Correct Base URLs (UAT vs Production).
  - Header requirements (e.g., User-Agent, Vendor-specific headers).
  - Signature/Checksum algorithms (HMAC-SHA256, SHA256, etc.).
  - 2FA/TOTP handling.

### Step 3: Database & Schema Compatibility

- **Table**: `broker_connections`
- **Audit Requirement**: Ensure that all fields defined in the broker's `form_schema` are stored in a way that:
  - Preserves fixed credentials (API Keys, Secrets, PINs).
  - Separates session-specific data (Access Tokens, Public Tokens).
- **Proposed Refinement**: Move away from flat `api_key`/`api_secret` columns in `broker_connections` to a `credentials` JSONB column for maximum flexibility across 32+ brokers.

### Step 4: Token Expiry & Session Logic

- **Requirement**: Users should NOT re-enter credentials once saved.
- **Audit**:
  - Verify `token_expires_at` logic in each adapter.
  - Define a "Session Refresh" workflow where the system uses stored credentials to obtain a new `access_token` automatically (if possible) or via a single-click "Re-authenticate" button.

### Step 5: Technical Documentation Generation

- **Action**: Create a dedicated Markdown file for the broker in `lib/brokers/docs/`.
- **Content**:
  - **Implementation Details**: Authentication flow type (OAuth, API Key, TOTP, etc.).
  - **Storage Map**: Exactly which fields are stored in `encrypted_credentials` vs `session_data`.
  - **Refresh Mechanism**: How the session is renewed.
  - **Endpoints**: Base URLs and relevant auth endpoints.
  - **Gotchas**: Any broker-specific quirks (e.g., specific header requirements or daily token resets).

---

## 3. Broker Audit List

| #   | Broker             | Status  | Primary Doc Source    | Findings/Notes                         |
| --- | ------------------ | ------- | --------------------- | -------------------------------------- |
| 1   | Zerodha (Kite)     | ✅ Done | Kite Connect Docs     | Verified v3 compliance.                |
| 2   | Upstox             | ✅ Done | Upstox API Docs       | Verified v2 OAuth compliance.          |
| 3   | Angel One          | ✅ Done | SmartAPI Docs         | Verified SmartAPI v1 compliance.       |
| 4   | Fyers              | ✅ Done | Fyers API Docs        | Verified v3 OAuth compliance.          |
| 5   | Dhan               | ✅ Done | Dhan HQ Docs          | Verified v2 static token compliance.   |
| 6   | Alice Blue         | ✅ Done | ANT API Docs          | Verified v2 OAuth compliance.          |
| 7   | Shoonya (Finvasia) | ✅ Done | Shoonya API Docs      | Verified v2 OAuth compliance.          |
| 8   | Kotak Neo          | ✅ Done | Neo API Docs          | Verified v2 multi-step auth.           |
| 9   | Paytm Money        | ✅ Done | Paytm Developer Docs  | Verified v2 token exchange compliance. |
| 10  | IIFL (Standard)    | ✅ Done | IIFL Developer Docs   | Verified XTS compliance.               |
| 11  | IIFL Capital       | ✅ Done | IIFL Capital Docs     | Verified ANT-based compliance.         |
| 12  | Groww              | ✅ Done | Groww API Docs        | Verified v1 token compliance.          |
| 13  | FivePaisa          | ✅ Done | 5Paisa API Docs       | Verified v2 REST compliance.           |
| 14  | FivePaisa XTS      | ✅ Done | XTS API Docs          | Verified XTS compliance.               |
| 15  | Tradejini          | ✅ Done | Tradejini Docs        | Verified CubePlus v2 compliance.       |
| 16  | FlatTrade          | ✅ Done | FlatTrade Docs        | Verified NorenAPI compliance.          |
| 17  | Zebu               | ✅ Done | Zebu API Docs         | Verified NorenAPI compliance.          |
| 18  | Firstock           | ✅ Done | Firstock Docs         | Verified v1 API compliance.            |
| 19  | Delta Exchange     | ✅ Done | Delta Exchange Docs   | Verified HMAC signing compliance.      |
| 20  | I-Bulls            | ✅ Done | XTS/I-Bulls Docs      | Verified XTS compliance.               |
| 21  | RMoney             | ✅ Done | XTS/RMoney Docs       | Verified XTS compliance.               |
| 22  | Jainam XTS         | ✅ Done | XTS/Jainam Docs       | Verified XTS compliance.               |
| 23  | Compositedge       | ✅ Done | XTS/Compositedge Docs | Verified XTS compliance.               |
| 24  | Wisdom             | ✅ Done | XTS/Wisdom Docs       | Verified XTS compliance.               |
| 25  | Indmoney           | ✅ Done | Indmoney Docs         | Verified static token compliance.      |
| 26  | Nubra              | ✅ Done | Nubra API Docs        | Verified v1 API compliance.            |
| 27  | Samco              | ✅ Done | Samco Docs            | Verified StockNote API compliance.     |
| 28  | Motilal Oswal      | ✅ Done | Motilal Docs          | Verified OpenAPI v3 compliance.        |
| 29  | MStock             | ✅ Done | MStock Docs           | Verified Type-B API compliance.        |
| 30  | Pocketful          | ✅ Done | Pocketful Docs        | Verified OAuth2 compliance.            |
| 31  | Definedge          | ✅ Done | Definedge Docs        | Verified Noren-style API compliance.   |
| 32  | Dhan Sandbox       | ✅ Done | Dhan HQ Docs          | Verified static token compliance.      |

## 4. Infrastructure Improvements (Completed)

### A. Database Schema Migration ✅

The `broker_connections` table has been evolved to support the "Permanent Credentials vs. Transient Tokens" model.

- Added `encrypted_credentials` JSONB column for permanent secrets (API Keys, etc).
- Added `session_data` JSONB column for transient data (Access tokens, expiry).

### B. Centralized TOTP Logic ✅

Created `lib/brokers/utils/totp.ts` to standardize 2FA generation across all adapters.

### C. BrokerFactory Refactor ✅

`BrokerFactory.ts` now utilizes the structured JSONB model, providing a scalable interface for all 32 brokers.

---

**Audit Status**: 100% Complete. All 32 brokers audited and infrastructure standardized.
