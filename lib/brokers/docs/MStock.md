# MStock (Mirae Asset) API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `MStockAdapter.ts`
- **Authentication Type**: Multi-step (Client Code + Password + TOTP + Private Key).
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://api.mstock.trade`

## 2. Authentication Flow

1.  **Initial Login**:
    - Endpoint: `/openapi/typeb/connect/login`.
    - Payload: `clientcode`, `password`, `totp`.
    - Returns: `refreshToken`.
2.  **TOTP Verification**:
    - Endpoint: `/openapi/typeb/session/verifytotp`.
    - Headers: `X-PrivateKey` (API Key).
    - Payload: `refreshToken`, `totp`.
    - Returns: `jwtToken` (The final session token).

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                      |
| -------------- | ---------------------- | --------------------------------- | -------------------------------- |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | User Client Code.                |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | MStock Private Key.              |
| `password`     | Permanent Credential   | `broker_connections.metadata`     | Login Password.                  |
| `totp_secret`  | Permanent Credential   | `broker_connections.metadata`     | TOTP secret for automated login. |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The dynamic `jwtToken`.          |

## 4. Session Lifecycle

- **Expiry**: Sessions are valid for **24 hours**.
- **Authorization**: Headers must include `X-PrivateKey` and `Authorization: Bearer [jwtToken]`.

## 5. Endpoints

- **Login**: `/openapi/typeb/connect/login`
- **Verify TOTP**: `/openapi/typeb/session/verifytotp`
- **Profile**: `/openapi/typeb/user/profile`
- **Limits**: `/openapi/typeb/limits/getlimits`
- **Order Placement**: `/openapi/typeb/order/placeorder`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with MStock OpenAPI Type-B.
- **Security**: ✅ High security with private key requirement and mandatory TOTP.
- **Improvements**: None identified.
