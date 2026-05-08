# RMoney API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `RMoneyAdapter.ts`
- **Authentication Type**: XTS Framework (Dual-Token Session).
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://xts.rmoneyindia.co.in:3000`

## 2. Authentication Flow

1.  **Step 1: Interactive Session**
    - Endpoint: `/interactive/user/session`.
    - Payload: `appKey`, `secretKey` (Interactive).
    - Returns: `accessToken` (Interactive Token).
2.  **Step 2: Market Data Session**
    - Endpoint: `/apibinarymarketdata/auth/login`.
    - Payload: `appKey`, `secretKey` (Market).
    - Returns: `marketToken`.

## 3. Data Storage Map

| Field                    | Category               | Storage Table                     | Description                 |
| ------------------------ | ---------------------- | --------------------------------- | --------------------------- |
| `interactive_app_key`    | Permanent Credential   | `broker_connections.api_key`      | XTS Interactive App Key.    |
| `interactive_secret_key` | Permanent Credential   | `broker_connections.api_secret`   | XTS Interactive Secret Key. |
| `market_app_key`         | Permanent Credential   | `broker_connections.metadata`     | XTS Market Data App Key.    |
| `market_secret_key`      | Permanent Credential   | `broker_connections.metadata`     | XTS Market Data Secret Key. |
| `access_token`           | Transient Session Data | `broker_connections.access_token` | Interactive session token.  |

## 4. Session Lifecycle

- **Expiry**: Sessions expire at **midnight** daily.
- **Authorization**: The `accessToken` must be passed in the `authorization` header for all interactive requests.

## 5. Endpoints

- **Interactive Login**: `/interactive/user/session`
- **Market Login**: `/apibinarymarketdata/auth/login`
- **Profile**: `/interactive/user/profile`
- **Funds**: `/interactive/user/balance`
- **Order Placement**: `/interactive/orders`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with RMoney XTS implementation.
- **Security**: ✅ Standard XTS dual-key security.
- **Improvements**: Ensure the non-standard port `:3000` is explicitly handled in all requests.
