# IIFL Capital API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `IIFLCapitalAdapter.ts`
- **Authentication Type**: OAuth-like Session Exchange (ANT-based).
- **Protocol**: REST HTTP APIs.
- **Base URL**: `https://api.iiflcapital.com`

## 2. Authentication Flow

1.  **Step 1: Authorization**: User is redirected to IIFL Capital Login.
2.  **Step 2: Auth Code**: User is redirected back with a `code` and `clientId`.
3.  **Step 3: Session Exchange**: The adapter exchanges the `code` for a `userSession`.
    - Endpoint: `/getusersession`.
    - Payload: `checkSum` (SHA256 of `clientId + code + api_secret`).
4.  **Success**: API returns `userSession` (Access Token).

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                          |
| -------------- | ---------------------- | --------------------------------- | ------------------------------------ |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | API Key from IIFL Capital portal.    |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | API Secret from IIFL Capital portal. |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The `userSession` string.            |

## 4. Session Lifecycle

- **Expiry**: `userSession` expires daily at **midnight**.
- **Authorization**: Included in headers as `Authorization: [userSession]`.

## 5. Endpoints

- **Session Exchange**: `/getusersession`
- **Profile**: `/profile`
- **Funds**: `/limits`
- **Order Placement**: `/placeorder`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with IIFL Capital's modern API (ANT framework).
- **Security**: ✅ Standard Checksum verification.
- **Improvements**: Ensure the `clientId` returned in the callback is handled dynamically in the frontend flow.
