# Zebu API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `ZebuAdapter.ts`
- **Authentication Type**: Token Exchange (Noren-based).
- **Protocol**: REST HTTP APIs (jData format).
- **Base URL**: `https://go.mynt.in`

## 2. Authentication Flow

1.  **Code Retrieval**: User obtains a `code` by logging into the Zebu developer portal or via an auth redirect.
2.  **Checksum Generation**: The adapter generates a SHA256 `checksum` of `clientId + secretKey + code`.
3.  **Token Retrieval**:
    - Endpoint: `/NorenWClientAPI/GenAcsTok`.
    - Content-Type: `text/plain`.
    - Payload: `jData={"code": "...", "checksum": "..."}`.
4.  **Success**: API returns an `access_token` and `stat: "Ok"`.

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description               |
| -------------- | ---------------------- | --------------------------------- | ------------------------- |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | Zebu Client ID / API Key. |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | Zebu Secret Key.          |
| `access_token` | Transient Session Data | `broker_connections.access_token` | The dynamic `susertoken`. |

## 4. Session Lifecycle

- **Expiry**: Sessions expire at **midnight**.
- **Authorization**: The token must be passed as `susertoken` inside every `jData` payload.

## 5. Endpoints

- **Token**: `/NorenWClientAPI/GenAcsTok`
- **Profile**: `/NorenWClientAPI/UserDetails`
- **Funds**: `/NorenWClientAPI/Limits`
- **Order Placement**: `/NorenWClientAPI/PlaceOrder`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Zebu (Noren) API v2.
- **Security**: ✅ Uses SHA256 checksum for token generation.
- **Improvements**: Ensure the `jData=` prefixing is handled consistently across all request methods.
