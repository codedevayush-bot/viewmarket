# Shoonya (Finvasia) API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `ShoonyaAdapter.ts`
- **Authentication Type**: OAuth 2.0 / Vendor Access.
- **Protocol**: REST-like HTTP APIs (NorenWClientAPI).
- **Base URL**: `https://api.shoonya.com`

## 2. Authentication Flow

1.  **Authorization**: User is redirected to Shoonya Login.
2.  **Auth Code**: Shoonya redirects back with an `auth_code`.
3.  **Token Exchange**: The adapter exchanges the `auth_code` for an `access_token`.
    - Endpoint: `/NorenWClientAPI/GenAcsTok`.
    - Payload: `jData={"code": "...", "checksum": "..."}`.
    - Checksum: SHA256 of `api_key + api_secret + code`.
4.  **Success**: API returns `access_token` (also known as `susertoken`).

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                     |
| -------------- | ---------------------- | --------------------------------- | ------------------------------- |
| `user_id`      | Permanent Credential   | `broker_connections.account_id`   | Shoonya Client ID.              |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | API Key from Shoonya portal.    |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | API Secret from Shoonya portal. |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The `susertoken` string.        |

## 4. Session Lifecycle

- **Expiry**: `susertoken` expires at **midnight**.
- **Usage**: Every request body must include `jData={"susertoken": "...", "uid": "..."}`.
- **Authorization**: The token is passed inside the JSON payload, not in headers.

## 5. Endpoints

- **Token Exchange**: `/NorenWClientAPI/GenAcsTok`
- **Profile**: `/NorenWClientAPI/UserDetails`
- **Funds**: `/NorenWClientAPI/Limits`
- **Order Placement**: `/NorenWClientAPI/PlaceOrder`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Shoonya (Finvasia) API.
- **Security**: ✅ Uses standard Checksum verification.
- **Improvements**: The adapter uses `text/plain` for JSON payloads as required by Noren API specifications.
