# Kotak Neo API v2 Authentication Audit

## 1. Implementation Overview

- **Adapter**: `KotakNeoAdapter.ts`
- **Authentication Type**: Multi-factor (Mobile + Password/MPIN + TOTP).
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://gw-n.kotak.com` (Default, but dynamic).

## 2. Authentication Flow

1.  **Step 1: Trade API Login**
    - Endpoint: `/login/1.0/tradeApiLogin`.
    - Payload: `mobileNumber`, `ucc`, `totp`.
    - Headers: `Authorization: [ConsumerKey]`, `neo-fin-key: neotradeapi`.
    - Returns: `viewToken` and `sid`.
2.  **Step 2: Trade API Validate**
    - Endpoint: `/login/1.0/tradeApiValidate`.
    - Payload: `mpin`.
    - Headers: `Auth: [viewToken]`, `sid: [viewSid]`.
    - Returns: `tradingToken` and `tradingSid`.

## 3. Data Storage Map

| Field           | Category               | Storage Table                     | Description                               |
| --------------- | ---------------------- | --------------------------------- | ----------------------------------------- |
| `ucc`           | Permanent Credential   | `broker_connections.account_id`   | User's unique client code.                |
| `api_key`       | Permanent Credential   | `broker_connections.api_key`      | Consumer Key from Kotak Developer Portal. |
| `mobile_number` | Permanent Credential   | `broker_connections.metadata`     | Registered mobile number.                 |
| `mpin`          | Permanent Credential   | `broker_connections.api_secret`   | 6-digit login PIN.                        |
| `totp_secret`   | Permanent Credential   | `broker_connections.metadata`     | Secret key for TOTP generation.           |
| `trading_token` | Transient Session Data | `broker_connections.access_token` | Final session token.                      |
| `trading_sid`   | Transient Session Data | `broker_connections.metadata`     | Session ID for headers.                   |

## 4. Session Lifecycle

- **Expiry**: Sessions expire at **midnight**.
- **Dynamic Routing**: The login response provides a `baseUrl` which must be used for all subsequent requests to that specific user's cluster.
- **Headers**: Every request requires `Authorization` (Consumer Key), `Auth` (Trading Token), and `sid`.

## 5. Endpoints

- **Login**: `/login/1.0/tradeApiLogin`
- **Validate**: `/login/1.0/tradeApiValidate`
- **Funds**: `/neoapi/1.0/funds/limits`
- **Order Placement**: `/neoapi/1.0/orders/place`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Kotak Neo API v2.
- **Security**: ✅ Uses multi-step TOTP and MPIN validation.
- **Improvements**: Store the `baseUrl` returned during login to ensure requests are routed to the correct server cluster (currently handled in adapter).
