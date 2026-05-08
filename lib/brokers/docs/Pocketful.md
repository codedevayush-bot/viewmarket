# Pocketful API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `PocketfulAdapter.ts`
- **Authentication Type**: OAuth2 (Authorization Code Grant).
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://trade.pocketful.in`

## 2. Authentication Flow

1.  **Authorization**: User is redirected to `https://trade.pocketful.in/oauth2/authorize`.
2.  **Redirect**: Pocketful redirects back with a `code`.
3.  **Token Exchange**:
    - Endpoint: `/oauth2/token`.
    - Method: `POST`.
    - Headers: `Authorization: Basic [Base64(apiKey:apiSecret)]`.
    - Payload: `grant_type=authorization_code`, `code=[code]`, `redirect_uri=[redirect_uri]`.
    - Returns: `access_token`, `expires_in`.

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                 |
| -------------- | ---------------------- | --------------------------------- | --------------------------- |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | Client ID.                  |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | Client Secret.              |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The dynamic `access_token`. |

## 4. Session Lifecycle

- **Expiry**: Sessions expire as per the `expires_in` value (typically 24 hours).
- **Authorization**: The `access_token` must be passed as a Bearer token in the `Authorization` header.

## 5. Endpoints

- **Token Request**: `/oauth2/token`
- **Profile**: `/api/v1/user/trading_info`
- **Funds**: `/api/v1/user/funds`
- **Order Placement**: `/api/v1/orders/place`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Pocketful OAuth2 standard.
- **Security**: ✅ Secure OAuth2 implementation with server-side secret handling.
- **Improvements**: Implement refresh token logic if Pocketful provides it to extend session duration.
