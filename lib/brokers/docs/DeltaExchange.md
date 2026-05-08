# Delta Exchange API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `DeltaExchangeAdapter.ts`
- **Authentication Type**: HMAC-SHA256 Request Signing.
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://api.india.delta.exchange` (India) / `https://api.delta.exchange` (Global).

## 2. Authentication Flow

1.  **Preparation**: User generates `api_key` and `api_secret` from the Delta Exchange account settings.
2.  **Signature Generation**: Every request requires a signature.
    - Message: `METHOD + TIMESTAMP + PATH + QUERY_PARAMS + BODY`.
    - Algorithm: `HMAC-SHA256` using `api_secret`.
3.  **Request Headers**:
    - `api-key`: User's API Key.
    - `timestamp`: Current Unix timestamp in seconds.
    - `signature`: The generated HMAC signature.

## 3. Data Storage Map

| Field        | Category             | Storage Table                   | Description       |
| ------------ | -------------------- | ------------------------------- | ----------------- |
| `api_key`    | Permanent Credential | `broker_connections.api_key`    | Delta API Key.    |
| `api_secret` | Permanent Credential | `broker_connections.api_secret` | Delta API Secret. |

## 4. Session Lifecycle

- **Expiry**: Permanent. No dynamic session tokens are used.
- **Revocation**: Credentials only expire if the user deletes them in the Delta Exchange portal.

## 5. Endpoints

- **Profile**: `/v2/profile`
- **Balances**: `/v2/wallet/balances`
- **Orders**: `/v2/orders`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Delta Exchange v2 API.
- **Security**: ✅ Robust HMAC signing for every request.
- **Improvements**: Add support for selecting between Delta India and Delta Global base URLs.
