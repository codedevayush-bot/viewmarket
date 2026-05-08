# FivePaisa API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `FivePaisaAdapter.ts`
- **Authentication Type**: Multi-step (Email + PIN + TOTP).
- **Protocol**: REST HTTP APIs (VendorsAPI).
- **Base URL**: `https://Openapi.5paisa.com`

## 2. Authentication Flow

1.  **Step 1: TOTP Login**
    - Endpoint: `/VendorsAPI/Service1.svc/TOTPLogin`.
    - Payload: `Email_ID`, `TOTP`, `PIN`.
    - Returns: `RequestToken`.
2.  **Step 2: Access Token Exchange**
    - Endpoint: `/VendorsAPI/Service1.svc/GetAccessToken`.
    - Payload: `RequestToken`, `EncryKey` (API Secret), `UserId`.
    - Returns: `AccessToken`.

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                 |
| -------------- | ---------------------- | --------------------------------- | --------------------------- |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | App Source / User Key.      |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | Encryption Key from 5Paisa. |
| `user_id`      | Permanent Credential   | `broker_connections.metadata`     | System User ID.             |
| `client_id`    | Permanent Credential   | `broker_connections.account_id`   | User's Client Code.         |
| `email`        | Permanent Credential   | `broker_connections.metadata`     | Registered Email ID.        |
| `pin`          | Permanent Credential   | `broker_connections.metadata`     | Login PIN.                  |
| `totp_secret`  | Permanent Credential   | `broker_connections.metadata`     | Secret key for TOTP.        |
| `access_token` | Transient Session Data | `broker_connections.access_token` | Valid for 24 hours.         |

## 4. Session Lifecycle

- **Expiry**: Sessions expire at **midnight**.
- **Usage**: Requests must include both an `Authorization` header and a `Token` field inside the JSON `head` object.

## 5. Endpoints

- **TOTP Login**: `/VendorsAPI/Service1.svc/TOTPLogin`
- **Token Exchange**: `/VendorsAPI/Service1.svc/GetAccessToken`
- **Funds**: `/VendorsAPI/Service1.svc/Margin`
- **Order Placement**: `/VendorsAPI/Service1.svc/PlaceOrder`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with 5Paisa OpenAPI standards.
- **Security**: ✅ Secure multi-step login with encryption keys.
- **Improvements**: Store the large number of permanent credentials in a dedicated `encrypted_credentials` JSONB column to avoid metadata clutter.
