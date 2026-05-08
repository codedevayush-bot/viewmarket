# Upstox API v2 Authentication Audit

## 1. Implementation Overview

- **Adapter**: `UpstoxAdapter.ts`
- **Authentication Type**: OAuth 2.0 (Authorization Code Grant).
- **Protocol**: REST API v2.
- **Base URL**: `https://api.upstox.com/v2`

## 2. Authentication Flow

1.  **Authorization Request**: User is redirected to `https://api.upstox.com/v2/login/authorization/dialog`.
    - Parameters: `response_type=code`, `client_id`, `redirect_uri`, `state`.
2.  **Callback**: Upstox redirects back with a `code`.
3.  **Token Exchange**: Platform exchanges the `code` for an `access_token` via POST `https://api.upstox.com/v2/login/authorization/token`.
    - Payload: `code`, `client_id`, `client_secret`, `redirect_uri`, `grant_type=authorization_code`.

## 3. Data Storage Map

| Field           | Category               | Storage Table                     | Description                    |
| --------------- | ---------------------- | --------------------------------- | ------------------------------ |
| `client_id`     | Permanent Credential   | `broker_connections.api_key`      | User's API Key.                |
| `client_secret` | Permanent Credential   | `broker_connections.api_secret`   | User's API Secret.             |
| `redirect_uri`  | Permanent Credential   | `broker_connections.metadata`     | Configured redirect URL.       |
| `access_token`  | Transient Session Data | `broker_connections.access_token` | Obtained after OAuth callback. |

## 4. Session Lifecycle

- **Expiry**: Upstox access tokens expire in **24 hours** (86400 seconds).
- **Refresh Mechanism**: While the API response may include a `refresh_token`, standard third-party apps typically require a daily manual login to renew the session.
- **Persistence**: Fixed credentials (`client_id`, `client_secret`) allow the platform to regenerate the login URL instantly.

## 5. Endpoints

- **Authorize**: `/login/authorization/dialog`
- **Token Exchange**: `/login/authorization/token`
- **Profile**: `/user/profile`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Upstox API v2.
- **Security**: ✅ Uses standard OAuth 2.0. State parameter is utilized for CSRF protection.
- **Improvements**: The `redirect_uri` should ideally be managed globally by the platform to simplify user setup.
