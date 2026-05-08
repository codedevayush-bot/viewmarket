# FlatTrade API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `FlatTradeAdapter.ts`
- **Authentication Type**: OAuth-style Token Exchange (Code based).
- **Protocol**: REST HTTP APIs (NorenAPI framework).
- **Base URL**: `https://authapi.flattrade.in`

## 2. Authentication Flow

1.  **Code Retrieval**: User navigates to `https://auth.flattrade.in/?app_key=[api_key]` and logs in.
2.  **Redirect**: User is redirected back with a `request_code`.
3.  **Token Exchange**:
    - Endpoint: `/trade/apitoken`.
    - Payload: `api_key`, `request_code`, `api_secret` (SHA256 hash).
    - Hash Formula: `sha256(api_key + request_code + api_secret)`.
4.  **Success**: API returns a `token` (Session Token).

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description               |
| -------------- | ---------------------- | --------------------------------- | ------------------------- |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | User Client ID / API Key. |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | API Secret Key.           |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The dynamic `susertoken`. |

## 4. Session Lifecycle

- **Expiry**: Sessions expire at **midnight**.
- **Authorization**: The token must be passed as `susertoken` inside every JSON request body, along with the `uid`.

## 5. Endpoints

- **Token**: `/trade/apitoken`
- **Profile**: `/trade/userdetails`
- **Funds**: `/trade/limits`
- **Order Placement**: `/trade/placeorder`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with FlatTrade API standards.
- **Security**: ✅ Uses SHA256 hashed secret for token exchange.
- **Improvements**: Implement a listener for the redirect URI to automate `request_code` capture.
