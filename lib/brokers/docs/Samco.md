# Samco StockNote API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `SamcoAdapter.ts`
- **Authentication Type**: Multi-step (App Key + Password).
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://tradeapi.samco.in`

## 2. Authentication Flow

1.  **Access Token Generation**:
    - Endpoint: `/accessToken/token`.
    - Payload: `uid` (Client ID), `secretApiKey`.
    - Returns: `accessToken` (Temporary Token).
2.  **Login**:
    - Endpoint: `/login`.
    - Payload: `userId`, `password`, `accessToken`.
    - Returns: `sessionToken` (The final trading session token).

## 3. Data Storage Map

| Field            | Category               | Storage Table                     | Description                 |
| ---------------- | ---------------------- | --------------------------------- | --------------------------- |
| `api_key`        | Permanent Credential   | `broker_connections.api_key`      | User Client ID.             |
| `password`       | Permanent Credential   | `broker_connections.metadata`     | User Login Password.        |
| `secret_api_key` | Permanent Credential   | `broker_connections.api_secret`   | App Secret key from Samco.  |
| `access_token`   | Transient Session Data | `broker_connections.access_token` | The dynamic `sessionToken`. |

## 4. Session Lifecycle

- **Expiry**: Sessions expire daily at **midnight**.
- **Authorization**: The `sessionToken` must be passed in the `x-session-token` header for all requests.

## 5. Endpoints

- **Token Request**: `/accessToken/token`
- **Login**: `/login`
- **Profile**: `/user/profile`
- **Funds**: `/user/balance`
- **Order Placement**: `/order/placeOrder`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Samco StockNote API.
- **Security**: ✅ Standard dual-auth flow.
- **Improvements**: Ensure that the `secret_api_key` is treated as a high-security secret in the database.
