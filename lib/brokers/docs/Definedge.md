# Definedge Securities API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `DefinedgeAdapter.ts`
- **Authentication Type**: Multi-step (API Token + API Secret + OTP).
- **Protocol**: REST HTTP APIs (Noren style `jData=` payloads).
- **Base URL**: `https://api.definedgesecurities.com/NorenWClientAPI`

## 2. Authentication Flow

1.  **Trigger OTP**:
    - Endpoint: `https://signin.definedgesecurities.com/auth/realms/debroking/dsbpkc/login/[apiToken]`.
    - Headers: `api_secret`.
    - Returns: `otp_token`.
2.  **Verify OTP**:
    - Endpoint: `https://signin.definedgesecurities.com/auth/realms/debroking/dsbpkc/token`.
    - Auth Code Generation: SHA256(`otpToken + otp + apiSecret`).
    - Payload: `otp_token`, `otp`, `ac` (authCode).
    - Returns: `api_session_key`, `susertoken`.

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                                      |
| -------------- | ---------------------- | --------------------------------- | ------------------------------------------------ |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | User API Token.                                  |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | User API Secret.                                 |
| `access_token` | Transient Session Data | `broker_connections.access_token` | Delimited string `api_session_key:::susertoken`. |

## 4. Session Lifecycle

- **Expiry**: Sessions expire after **24 hours**.
- **Authorization**: Requests must include `uid` and `susertoken` inside the `jData` body.

## 5. Endpoints

- **OTP Request**: `/login/[apiToken]`
- **OTP Verify**: `/token`
- **Profile**: `/UserDetails`
- **Funds**: `/Limits`
- **Order Placement**: `/PlaceOrder`

## 6. Audit Verdict

- **Compliance**: ✅ Compliant with Definedge Noren-based API.
- **Security**: ✅ Secure multi-step verification with SHA256 hashing.
- **Improvements**: Store the separate session keys in a structured JSONB column in `broker_connections` instead of a delimited string.
