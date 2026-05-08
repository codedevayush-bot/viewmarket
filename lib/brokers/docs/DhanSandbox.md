# Dhan Sandbox API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `DhanSandboxAdapter.ts`
- **Authentication Type**: Static Access Token.
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://api.dhan.co`

## 2. Authentication Flow

1.  **Preparation**: User generates a long-lived `Access Token` from the Dhan HQ API portal.
2.  **Verification**: The adapter uses the `client_id` and `access_token` directly in the headers.
3.  **Request Headers**:
    - `access-token`: `[access_token]`
    - `client-id`: `[client_id]`
    - `Content-Type`: `application/json`

## 3. Data Storage Map

| Field          | Category             | Storage Table                     | Description                    |
| -------------- | -------------------- | --------------------------------- | ------------------------------ |
| `client_id`    | Permanent Credential | `broker_connections.account_id`   | Dhan Client ID.                |
| `access_token` | Permanent Credential | `broker_connections.access_token` | Persistent token from Dhan HQ. |

## 4. Session Lifecycle

- **Expiry**: Tokens are typically valid for **30 days** or until revoked.
- **Automation**: No daily login required.

## 5. Endpoints

- **Profile**: `/v2/profile`
- **Funds**: `/v2/fundlimit`
- **Order Placement**: `/v2/orders`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Dhan HQ API v2.
- **Security**: ✅ Standard token-based security.
- **Improvements**: None identified.
