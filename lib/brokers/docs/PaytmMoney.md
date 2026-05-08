# Paytm Money API Authentication Audit

## 1. Implementation Overview

- **Adapter**: `PaytmMoneyAdapter.ts`
- **Authentication Type**: OAuth-like Request Token to Access Token exchange.
- **Protocol**: REST-like HTTP APIs.
- **Base URL**: `https://developer.paytmmoney.com`

## 2. Authentication Flow

1.  **Step 1: Authorization**: User is redirected to `https://login.paytmmoney.com/merchant-login?apiKey=[API_KEY]`.
2.  **Step 2: Request Token**: After login, user is redirected back to the app with a `requestToken` in the query params.
3.  **Step 3: Access Token Exchange**: The adapter exchanges the `requestToken` for an `access_token`.
    - Endpoint: `/accounts/v2/gettoken`.
    - Payload: `api_key`, `api_secret_key`, `request_token`.
4.  **Success**: API returns `access_token` (JWT).

## 3. Data Storage Map

| Field          | Category               | Storage Table                     | Description                            |
| -------------- | ---------------------- | --------------------------------- | -------------------------------------- |
| `api_key`      | Permanent Credential   | `broker_connections.api_key`      | API Key from Paytm Money dashboard.    |
| `api_secret`   | Permanent Credential   | `broker_connections.api_secret`   | API Secret from Paytm Money dashboard. |
| `access_token` | Transient Session Data | `broker_connections.access_token` | JWT used for all API requests.         |

## 4. Session Lifecycle

- **Expiry**: `access_token` (JWT) expires daily at **midnight**.
- **Usage**: Every request must include the header `x-jwt-token: [access_token]`.
- **Authorization**: Standard bearer-like token exchange but using a custom header.

## 5. Endpoints

- **Token Exchange**: `/accounts/v2/gettoken`
- **Profile**: `/accounts/v1/user/details`
- **Funds**: `/accounts/v1/funds/details`
- **Order Placement**: `/orders/v1/place/regular`

## 6. Audit Verdict

- **Compliance**: ✅ Fully compliant with Paytm Money Developer API.
- **Security**: ✅ Standard token exchange flow.
- **Improvements**: None. The implementation is clean and follows official docs.
