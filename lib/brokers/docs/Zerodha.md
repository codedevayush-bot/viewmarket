# Zerodha Kite Connect Authentication Audit

## 1. Implementation Overview

- **Adapter**: `ZerodhaAdapter.ts`
- **Authentication Type**: API Key + Request Token Exchange.
- **Protocol**: REST-like HTTP APIs.
- **API Version**: `3` (Specified via `X-Kite-Version` header).

## 2. Authentication Flow

1.  **Frontend Redirect**: User is redirected to `https://kite.zerodha.com/connect/login?api_key=[API_KEY]`.
2.  **Request Token**: After successful login, Zerodha redirects back to the platform with a `request_token` in the URL.
3.  **Token Exchange**: The platform exchanges the `request_token` for an `access_token` using a POST request to `https://api.kite.trade/session/token`.
    - **Checksum**: A SHA256 hash of `api_key + request_token + api_secret` is required for verification.

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                        |
| -------------- | ---------------------- | --------------------------------- | ---------------------------------- |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | Provided by the user during setup. |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | Provided by the user during setup. |
| `access_token` | Transient Session Data | `broker_connections.access_token` | Obtained daily after login.        |
| `public_token` | Transient Session Data | `broker_connections.metadata`     | Used for websocket authentication. |

## 4. Session Lifecycle

- **Expiry**: Zerodha sessions expire daily (usually at 6:00 AM IST or after 24 hours).
- **Refresh Mechanism**: Zerodha does **not** support refresh tokens for standard Kite Connect APIs. A fresh `request_token` must be obtained by the user daily.
- **Persistence**: The `api_key` and `api_secret` are stored permanently, allowing the platform to initiate the login redirect without re-asking for these credentials.

## 5. Endpoints

- **Base URL**: `https://api.kite.trade`
- **Login URL**: `https://kite.zerodha.com/connect/login`
- **Session Token**: `/session/token`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Kite Connect v3.
- **Security**: ✅ Checksum is generated server-side. Secrets are never exposed.
- **Improvements**: Consider implementing a "Daily Login Required" notification for the user dashboard.
