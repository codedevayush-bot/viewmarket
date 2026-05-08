# FivePaisa XTS API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `FivePaisaXTSAdapter.ts`
- **Authentication Type**: XTS Framework (Dual-Token Session).
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://5paisa.xts.com` (Configurable).

## 2. Authentication Flow

1.  **Step 1: Interactive Session**
    - Endpoint: `/interactive/user/session`.
    - Payload: `appKey`, `secretKey` (Interactive).
    - Returns: `interactiveToken`.
2.  **Step 2: Market Data Session**
    - Endpoint: `/marketdata/auth/login`.
    - Payload: `appKey`, `secretKey` (Market Data).
    - Returns: `marketToken`.

## 3. Data Storage Map

| Field                    | Category               | Storage Table                     | Description                 |
| ------------------------ | ---------------------- | --------------------------------- | --------------------------- | ------------- |
| `interactive_api_key`    | Permanent Credential   | `broker_connections.api_key`      | XTS Interactive App Key.    |
| `interactive_api_secret` | Permanent Credential   | `broker_connections.api_secret`   | XTS Interactive Secret Key. |
| `market_data_api_key`    | Permanent Credential   | `broker_connections.metadata`     | XTS Market Data App Key.    |
| `market_data_api_secret` | Permanent Credential   | `broker_connections.metadata`     | XTS Market Data Secret Key. |
| `base_url`               | Permanent Config       | `broker_connections.metadata`     | Custom XTS endpoint URL.    |
| `access_token`           | Transient Session Data | `broker_connections.access_token` | Combined `interactiveToken  | marketToken`. |

## 4. Session Lifecycle

- **Expiry**: XTS sessions expire daily at **midnight**.
- **Authorization**: `interactiveToken` is used for trading/funds in the `authorization` header.
- **Market Data**: `marketToken` is used for market data/websockets.

## 5. Endpoints

- **Interactive Login**: `/interactive/user/session`
- **Market Login**: `/marketdata/auth/login`
- **Profile**: `/interactive/user/profile`
- **Funds**: `/interactive/user/balance`
- **Order Placement**: `/interactive/orders`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with XTS framework standards.
- **Security**: ✅ Standard dual-key authentication.
- **Improvements**: Store the `marketToken` separately in a structured `session_data` JSONB column to avoid pipe-separated strings.
