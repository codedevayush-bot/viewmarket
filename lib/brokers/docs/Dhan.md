# Dhan HQ API v2 Authentication Audit

## 1. Implementation Overview

- **Adapter**: `DhanAdapter.ts`
- **Authentication Type**: Static Access Token.
- **Protocol**: REST-like HTTP APIs.
- **Base URL**: `https://api.dhan.co`

## 2. Authentication Flow

1.  **Manual Generation**: User generates a long-lived `access_token` from the [DhanHQ Portal](https://web.dhan.co/).
2.  **Configuration**: User provides the `client_id` and `access_token` to ViewMarket.
3.  **Usage**: The adapter includes these in every request header.
    - Headers: `access-token`, `client-id`.

## 3. Data Storage Map

| Field          | Category             | Storage Table                     | Description                         |
| -------------- | -------------------- | --------------------------------- | ----------------------------------- |
| `client_id`    | Permanent Credential | `broker_connections.account_id`   | User's Dhan Client ID.              |
| `access_token` | Permanent Credential | `broker_connections.access_token` | Long-lived JWT from Dhan dashboard. |

## 4. Session Lifecycle

- **Expiry**: Dependent on user settings in Dhan Dashboard (typically **30 days** or **Unlimited/Permanent**).
- **Renewal**: User must manually update the token in ViewMarket if it expires or is revoked.
- **Zero Friction**: Since tokens are long-lived, users do not need to log in daily.

## 5. Endpoints

- **Profile**: `/v2/profile`
- **Funds**: `/v2/fundlimit`
- **Order Placement**: `/v2/orders`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Dhan HQ v2 API.
- **Security**: ✅ Uses standard static token auth.
- **Improvements**: Add a link to the DhanHQ portal in the frontend configuration form to help users find their token easily.
