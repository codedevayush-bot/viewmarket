# Nubra API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `NubraAdapter.ts`
- **Authentication Type**: Multi-step (Phone + TOTP + PIN).
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://api.nubra.io` (Prod) / `https://uatapi.nubra.io` (UAT).

## 2. Authentication Flow

1.  **TOTP Login**:
    - Endpoint: `/totp/login`.
    - Payload: `phone`, `totp`.
    - Returns: `auth_token`.
2.  **PIN Verification**:
    - Endpoint: `/verifypin`.
    - Headers: `Authorization: Bearer [auth_token]`.
    - Payload: `pin`.
    - Returns: `session_token`.

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                  |
| -------------- | ---------------------- | --------------------------------- | ---------------------------- |
| `phone`        | Permanent Credential   | `broker_connections.account_id`   | User phone number.           |
| `mpin`         | Permanent Credential   | `broker_connections.metadata`     | User 6-digit MPIN.           |
| `use_uat`      | Configuration          | `broker_connections.metadata`     | Boolean for UAT environment. |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The dynamic `session_token`. |

## 4. Session Lifecycle

- **Expiry**: Sessions expire after **24 hours**.
- **Authorization**: The `session_token` must be passed as a Bearer token in the `Authorization` header.

## 5. Endpoints

- **TOTP Login**: `/totp/login`
- **Verify PIN**: `/verifypin`
- **Profile**: `/user/profile`
- **Funds**: `/user/limits`
- **Order Placement**: `/order/place`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Nubra API v1.
- **Security**: ✅ Secure two-step verification with device ID tracking.
- **Improvements**: The adapter currently requires the UI to pass the `otp`. For fully automated trading, add a `totp_secret` field to automate OTP generation.
