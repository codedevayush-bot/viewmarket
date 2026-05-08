# Groww Trade API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `GrowwAdapter.ts`
- **Authentication Type**: Programmatic Token Generation (Checksum-based).
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://api.groww.in`

## 2. Authentication Flow

1.  **Preparation**: User obtains `api_key` and `api_secret` from the Groww developer portal.
2.  **Checksum Generation**: The adapter generates a SHA256 `checksum` of `api_secret + timestamp`.
3.  **Token Retrieval**: The adapter requests an access token.
    - Endpoint: `/v1/token/api/access`.
    - Headers: `Authorization: Bearer [api_key]`.
    - Payload: `key_type: "approval"`, `checksum`, `timestamp`.
4.  **Success**: API returns a session `token` (Access Token).

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                     |
| -------------- | ---------------------- | --------------------------------- | ------------------------------- |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | Groww App API Key.              |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | Groww App API Secret.           |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The session token for requests. |

## 4. Session Lifecycle

- **Expiry**: Tokens typically expire in **24 hours**.
- **Authorization**: Included in headers as `Authorization: Bearer [token]`.
- **Automation**: By storing the `api_secret`, the platform can automatically generate a fresh session token every day.

## 5. Endpoints

- **Token Generation**: `/v1/token/api/access`
- **Funds**: `/v1/accounts/funds`
- **Order Placement**: `/v1/orders/place`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Groww Trade API v1.
- **Security**: ✅ Uses time-based checksum for secure token requests.
- **Improvements**: Implement a more detailed `getProfile` to fetch the actual client name and ID.
