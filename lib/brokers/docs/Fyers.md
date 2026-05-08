# Fyers API v3 Authentication Audit

## 1. Implementation Overview

- **Adapter**: `FyersAdapter.ts`
- **Authentication Type**: OAuth 2.0 (Authorization Code Grant).
- **Protocol**: REST-like HTTP APIs.
- **Base URL**: `https://api-t1.fyers.in`

## 2. Authentication Flow

1.  **Authorization**: User is redirected to Fyers Login URL.
2.  **Auth Code**: Fyers redirects back with an `auth_code`.
3.  **Token Exchange**: The adapter exchanges the `auth_code` for an `access_token`.
    - Endpoint: `POST /api/v3/validate-authcode`.
    - Payload: `grant_type: "authorization_code"`, `code: [auth_code]`, `appIdHash: SHA256(api_id + ":" + app_secret)`.
4.  **Success**: API returns `access_token` and `refresh_token`.

## 3. Data Storage Map

| Field           | Category               | Storage Table                      | Description                     |
| --------------- | ---------------------- | ---------------------------------- | ------------------------------- |
| `api_key`       | Permanent Credential   | `broker_connections.api_key`       | App ID from Fyers dashboard.    |
| `api_secret`    | Permanent Credential   | `broker_connections.api_secret`    | Secret ID from Fyers dashboard. |
| `access_token`  | Transient Session Data | `broker_connections.access_token`  | Valid for one day.              |
| `refresh_token` | Transient Session Data | `broker_connections.refresh_token` | Valid for 15 days.              |

## 4. Session Lifecycle

- **Expiry**: `access_token` expires daily. `refresh_token` lasts 15 days.
- **Renewal**: The `refresh_token` can be used to generate a new `access_token` without the user logging in again (requires `pin`).
- **Authorization Header**: `"Authorization": "app_id:access_token"`.

## 5. Endpoints

- **Token Exchange**: `/api/v3/validate-authcode`
- **Profile**: `/api/v3/profile`
- **Funds**: `/api/v3/funds`
- **Order Placement**: `/api/v3/orders/sync`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Fyers v3 API.
- **Security**: ✅ Uses standard OAuth 2.0 with Hashing.
- **Improvements**: Implement the 15-day refresh flow to further reduce user friction.
