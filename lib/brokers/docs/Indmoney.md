# Indmoney API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `IndmoneyAdapter.ts`
- **Authentication Type**: Static Access Token.
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://api.indstocks.com`

## 2. Authentication Flow

1.  **Preparation**: User generates a long-lived `Access Token` from the Indmoney Trading API portal.
2.  **Verification**: The adapter uses this token directly for all requests.
3.  **Request Headers**:
    - `Authorization`: `[access_token]`
    - `Content-Type`: `application/json`

## 3. Data Storage Map

| Field          | Category             | Storage Table                     | Description                     |
| -------------- | -------------------- | --------------------------------- | ------------------------------- |
| `access_token` | Permanent Credential | `broker_connections.access_token` | Persistent token from Indmoney. |

## 4. Session Lifecycle

- **Expiry**: Tokens are typically long-lived (30-90 days or permanent).
- **Automation**: Since the token is static, no daily login flow is required.

## 5. Endpoints

- **Profile**: `/user/profile`
- **Funds**: `/funds`
- **Order Placement**: `/orders`

## 6. Audit Verdict

- **Compliance**: ✅ Compliant with Indmoney API v1.
- **Security**: ✅ Standard token-based security.
- **Improvements**: Add support for an `api_key` if Indmoney starts requiring it alongside the token for enhanced security.
