# Alice Blue ANT API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `AliceBlueAdapter.ts`
- **Authentication Type**: OAuth 2.0 (Authorization Code Grant).
- **Protocol**: REST-like HTTP APIs.
- **Base URL**: `https://ant.aliceblueonline.com`

## 2. Authentication Flow

1.  **Authorization**: User is redirected to Alice Blue Login.
2.  **Auth Code**: Alice Blue redirects back with an `auth_code`.
3.  **Session Exchange**: The adapter exchanges the `auth_code` for a `userSession`.
    - Endpoint: `/open-api/od/v1/vendor/getUserDetails`.
    - Payload: `checkSum` (SHA256 of `userId + code + api_secret`).
4.  **Success**: API returns `userSession` (Access Token).

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                     |
| -------------- | ---------------------- | --------------------------------- | ------------------------------- |
| `client_id`    | Permanent Credential   | `broker_connections.account_id`   | Alice Blue Client ID.           |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | App ID from ANT API portal.     |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | App Secret from ANT API portal. |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The `userSession` string.       |

## 4. Session Lifecycle

- **Expiry**: `userSession` expires at **midnight**.
- **Re-Auth**: Daily manual login via redirect flow is required.
- **Authorization Header**: `"Authorization": "Bearer [userSession]"`.

## 5. Endpoints

- **Token Exchange**: `/open-api/od/v1/vendor/getUserDetails`
- **Funds**: `/open-api/v2/cash/getAvailableCash`
- **Order Placement**: `/open-api/v2/order/placeOrder`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Alice Blue ANT API v2.
- **Security**: ✅ Uses standard Checksum verification for session exchange.
- **Improvements**: Ensure the `client_id` is always passed as part of the credentials object to avoid hardcoding.
