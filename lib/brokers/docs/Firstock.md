# Firstock API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `FirstockAdapter.ts`
- **Authentication Type**: Multi-step (Password + TOTP + Vendor Code).
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://api.firstock.in`

## 2. Authentication Flow

1.  **Preparation**: User obtains `apiKey` and `vendorCode` from Firstock.
2.  **Login**:
    - Endpoint: `/V1/login`.
    - Payload: `userId`, `password` (SHA256 hash), `TOTP`, `vendorCode`, `apiKey`.
3.  **Success**: API returns `status: "success"` and a `jKey` (Session Token).

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                         |
| -------------- | ---------------------- | --------------------------------- | ----------------------------------- |
| `client_id`    | Permanent Credential   | `broker_connections.account_id`   | User ID.                            |
| `password`     | Permanent Credential   | `broker_connections.metadata`     | Login Password.                     |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | API Key.                            |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | Vendor Code (mapped to api_secret). |
| `totp_secret`  | Permanent Credential   | `broker_connections.metadata`     | TOTP generation key.                |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The dynamic `jKey`.                 |

## 4. Session Lifecycle

- **Expiry**: Sessions expire at **midnight**.
- **Authorization**: The `jKey` and `userId` must be passed in the body of every subsequent POST request.

## 5. Endpoints

- **Login**: `/V1/login`
- **Profile**: `/V1/userDetails`
- **Funds**: `/V1/limits`
- **Order Placement**: `/V1/placeOrder`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Firstock API v1.
- **Security**: ✅ Uses SHA256 hashed password.
- **Improvements**: The adapter should include the logic to generate TOTP from `totpSecret` to ensure full automation.
