# IIFL (Standard) API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `IIFLAdapter.ts`
- **Authentication Type**: XTS API (Dual-Token Session).
- **Protocol**: REST HTTP APIs (XTS Framework).
- **Base URL**: `https://ttblaze.iifl.com`

## 2. Authentication Flow

1.  **Step 1: Interactive Session**
    - Endpoint: `/interactive/user/session`.
    - Payload: `appKey`, `secretKey` (Interactive).
    - Returns: `interactiveToken`.
2.  **Step 2: Market Data Session**
    - Endpoint: `/apimarketdata/auth/login`.
    - Payload: `appKey`, `secretKey` (Market).
    - Returns: `feedToken` and `userID`.

## 3. Data Storage Map

| Field               | Category               | Storage Table                     | Description                            |
| ------------------- | ---------------------- | --------------------------------- | -------------------------------------- |
| `app_key`           | Permanent Credential   | `broker_connections.api_key`      | Interactive App Key.                   |
| `api_secret`        | Permanent Credential   | `broker_connections.api_secret`   | Interactive API Secret.                |
| `app_key_market`    | Permanent Credential   | `broker_connections.metadata`     | Market Data App Key.                   |
| `api_secret_market` | Permanent Credential   | `broker_connections.metadata`     | Market Data API Secret.                |
| `access_token`      | Transient Session Data | `broker_connections.access_token` | Combined `token:::feedToken:::userId`. |

## 4. Session Lifecycle

- **Expiry**: Sessions expire daily at **midnight**.
- **Authorization**: Orders/Trade requests use the `interactiveToken` in the `Authorization` header.
- **Market Data**: Websocket or Market Data requests use the `feedToken`.

## 5. Endpoints

- **Interactive Login**: `/interactive/user/session`
- **Market Login**: `/apimarketdata/auth/login`
- **Funds**: `/interactive/margin`
- **Order Placement**: `/interactive/orders`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with IIFL XTS API standards.
- **Security**: ✅ Uses separate keys for trading and data.
- **Improvements**: Segregate the storage of Market Keys into a cleaner JSONB structure rather than overloading metadata.
