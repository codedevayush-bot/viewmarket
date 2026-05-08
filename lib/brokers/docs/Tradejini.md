# Tradejini CubePlus API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `TradejiniAdapter.ts`
- **Authentication Type**: Multi-step (Password + TOTP).
- **Protocol**: REST HTTP APIs (CubePlus).
- **Base URL**: `https://api.tradejini.com/v2`

## 2. Authentication Flow

1.  **Preparation**: The user generates an `api_secret` in the Tradejini developer portal.
2.  **Token Generation**:
    - Endpoint: `/api-gw/oauth/individual-token-v2`.
    - Headers: `Authorization: Bearer [api_secret]`, `Content-Type: application/x-www-form-urlencoded`.
    - Payload: `password`, `twoFa` (TOTP), `twoFaTyp: "totp"`.
3.  **Success**: API returns an `access_token` and its expiry time.

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                |
| -------------- | ---------------------- | --------------------------------- | -------------------------- |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | Secret key from Tradejini. |
| `password`     | Permanent Credential   | `broker_connections.metadata`     | User login password.       |
| `totp_secret`  | Permanent Credential   | `broker_connections.metadata`     | TOTP generation key.       |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The dynamic session token. |

## 4. Session Lifecycle

- **Expiry**: Typically **24 hours**.
- **Authorization**: Included in subsequent headers as `Authorization: Bearer [access_token]`.

## 5. Endpoints

- **Token**: `/api-gw/oauth/individual-token-v2`
- **Profile**: `/api-gw/user/profile`
- **Funds**: `/api-gw/user/limits`
- **Order Placement**: `/api-gw/orders`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Tradejini CubePlus v2 standards.
- **Security**: ✅ Uses individual token flow which is more secure than global app tokens.
- **Improvements**: Standardize `api_secret` naming to align with Tradejini's terminology (App Secret).
