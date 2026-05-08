# Motilal Oswal OpenAPI Authentication Audit

## 1. Implementation Overview

- **Adapter**: `MotilalAdapter.ts`
- **Authentication Type**: Direct API (API Key + User ID + Password + 2FA).
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://openapi.motilaloswal.com/rest`

## 2. Authentication Flow

1.  **Preparation**: Generate SHA256 hash of `[password][apiKey]`.
2.  **Request**:
    - Endpoint: `/login/v3/authdirectapi`.
    - Payload: `userid`, `password` (hashed), `2FA` (DOB), `totp` (optional).
    - Headers: Includes `ApiKey`, `SourceId`, and various device fingerprints.
3.  **Success**: Returns `AuthToken`.

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                       |
| -------------- | ---------------------- | --------------------------------- | --------------------------------- |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | MOSL OpenAPI Key.                 |
| `user_id`      | Permanent Credential   | `broker_connections.account_id`   | User ID.                          |
| `password`     | Permanent Credential   | `broker_connections.metadata`     | Login password (stored securely). |
| `dob`          | Permanent Credential   | `broker_connections.metadata`     | Date of Birth (DDMMYYYY) for 2FA. |
| `totp_secret`  | Permanent Credential   | `broker_connections.metadata`     | TOTP secret for automated login.  |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The dynamic `AuthToken`.          |

## 4. Session Lifecycle

- **Expiry**: Sessions expire daily.
- **Authorization**: The `AuthToken` must be passed in the `AuthToken` header for all requests.

## 5. Endpoints

- **Authentication**: `/login/v3/authdirectapi`
- **Profile**: `/user/v1/profile`
- **Limits**: `/user/v1/limits`
- **Order Placement**: `/order/v1/placeorder`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Motilal Oswal OpenAPI v1.
- **Security**: ✅ Uses password hashing and 2FA verification.
- **Improvements**: Standardize the device fingerprints (MAC, IP) to ensure they are consistent across sessions.
