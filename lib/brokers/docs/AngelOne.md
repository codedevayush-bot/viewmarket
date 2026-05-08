# Angel One SmartAPI Authentication Audit

## 1. Implementation Overview

- **Adapter**: `AngelOneAdapter.ts`
- **Authentication Type**: Client Code + MPIN + TOTP.
- **Protocol**: REST-like HTTP APIs.
- **Base URL**: `https://apiconnect.angelone.in`

## 2. Authentication Flow

1.  **TOTP Generation**: The adapter generates a 6-digit TOTP code using the stored `totp_secret`.
2.  **Login Request**: A POST request is sent to `/rest/auth/angelbroking/user/v1/loginByPassword`.
    - Payload: `clientcode`, `password` (MPIN), `totp`.
    - Required Headers: `X-PrivateKey` (API Key), `X-UserType`, `X-SourceID`, `X-ClientLocalIP`, `X-MACAddress`.
3.  **Token Retrieval**: Upon success, the API returns a `jwtToken` (Access Token) and a `refreshToken`.

## 3. Data Storage Map

| Field           | Category               | Storage Table                      | Description                            |
| --------------- | ---------------------- | ---------------------------------- | -------------------------------------- |
| `api_key`       | Permanent Credential   | `broker_connections.api_key`       | SmartAPI Key from Angel One dashboard. |
| `client_code`   | Permanent Credential   | `broker_connections.account_id`    | User's unique client code.             |
| `broker_pin`    | Permanent Credential   | `broker_connections.api_secret`    | User's login MPIN.                     |
| `totp_secret`   | Permanent Credential   | `broker_connections.metadata`      | Secret key used to generate TOTP.      |
| `access_token`  | Transient Session Data | `broker_connections.access_token`  | JWT used for all API requests.         |
| `refresh_token` | Transient Session Data | `broker_connections.refresh_token` | Used to refresh the JWT if expired.    |

## 4. Session Lifecycle

- **Expiry**: Angel One sessions expire at **midnight** every day.
- **Refresh Mechanism**: The adapter uses the `jwtToken` for requests. While a `refreshToken` is provided, a fresh login via TOTP is usually preferred daily for stability.
- **Persistence**: Fixed credentials (`client_code`, `broker_pin`, `totp_secret`) enable the platform to automatically re-authenticate the user without manual intervention.

## 5. Endpoints

- **Login**: `/rest/auth/angelbroking/user/v1/loginByPassword`
- **Profile**: `/rest/auth/angelbroking/user/v1/getProfile`
- **Funds/RMS**: `/rest/auth/angelbroking/user/v1/getRMS`
- **Place Order**: `/rest/auth/angelbroking/order/v1/placeOrder`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with SmartAPI v1.
- **Security**: ✅ Permanent credentials are stored; TOTP is generated on-the-fly.
- **Improvements**: Segregate `available_margin` more accurately across Equity and Commodity segments in `getFunds`.
