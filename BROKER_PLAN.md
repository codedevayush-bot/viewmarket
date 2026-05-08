# Broker Migration Plan: OpenAlgo to ViewMarket

This document tracks the progress of migrating broker adapters from the legacy OpenAlgo implementation to the enterprise-grade ViewMarket architecture.

## Status Summary

- **Total Brokers Identified:** 32
- **Adapters Ported:** 32
- **Database Provisioning:** 100% Completed
- **Registry Updated:** 100% Completed

## Migration Progress

| Broker              | Adapter Class          | Form Schema (DB) | Status  | Notes                |
| :------------------ | :--------------------- | :--------------- | :------ | :------------------- |
| **Dhan**            | `DhanAdapter`          | Provisioned      | ✅ Done | Standard API Key     |
| **Fyers**           | `FyersAdapter`         | Provisioned      | ✅ Done | OAuth Flow           |
| **Zerodha**         | `ZerodhaAdapter`       | Provisioned      | ✅ Done | OAuth (Kite Connect) |
| **Upstox**          | `UpstoxAdapter`        | Provisioned      | ✅ Done | OAuth 2.0            |
| **Angel One**       | `AngelOneAdapter`      | Provisioned      | ✅ Done | SmartAPI (TOTP)      |
| **Alice Blue**      | `AliceBlueAdapter`     | Provisioned      | ✅ Done | ANT API              |
| **Shoonya**         | `ShoonyaAdapter`       | Provisioned      | ✅ Done | Finvasia (TOTP)      |
| **Kotak Neo**       | `KotakNeoAdapter`      | Provisioned      | ✅ Done | Neo API (TOTP)       |
| **Paytm Money**     | `PaytmMoneyAdapter`    | Provisioned      | ✅ Done | Merchant OAuth       |
| **IIFL (Standard)** | `IIFLAdapter`          | Provisioned      | ✅ Done | XTS Implementation   |
| **FlatTrade**       | `FlattradeAdapter`     | Provisioned      | ✅ Done | SHA256 Checksum      |
| **Zebu**            | `ZebuAdapter`          | Provisioned      | ✅ Done | jData OAuth          |
| **Firstock**        | `FirstockAdapter`      | Provisioned      | ✅ Done | SHA256 Password      |
| **Delta Exchange**  | `DeltaExchangeAdapter` | Provisioned      | ✅ Done | HMAC-SHA256          |
| **I-Bulls**         | `IBullsAdapter`        | Provisioned      | ✅ Done | XTS Standard         |
| **RMoney**          | `RMoneyAdapter`        | Provisioned      | ✅ Done | XTS Standard         |
| **Jainam XTS**      | `JainamXTSAdapter`     | Provisioned      | ✅ Done | XTS Standard         |
| **Compositedge**    | `CompositedgeAdapter`  | Provisioned      | ✅ Done | XTS Standard         |
| **FivePaisa XTS**   | `FivePaisaXTSAdapter`  | Provisioned      | ✅ Done | XTS Standard         |
| **Wisdom**          | `WisdomAdapter`        | Provisioned      | ✅ Done | XTS Standard         |
| **IIFL Capital**    | `IIFLCapitalAdapter`   | Provisioned      | ✅ Done | OAuth + Checksum     |
| **Groww**           | `GrowwAdapter`         | Provisioned      | ✅ Done | Checksum Auth        |
| **FivePaisa**       | `FivePaisaAdapter`     | Provisioned      | ✅ Done | Traditional Flow     |
| **Indmoney**        | `IndmoneyAdapter`      | Provisioned      | ✅ Done | REST API             |
| **Nubra**           | `NubraAdapter`         | Provisioned      | ✅ Done | PIN + TOTP           |
| **Tradejini**       | `TradejiniAdapter`     | Provisioned      | ✅ Done | Individual Token v2  |
| **Samco**           | `SamcoAdapter`         | Provisioned      | ✅ Done | StockNote API        |
| **Motilal Oswal**   | `MotilalAdapter`       | Provisioned      | ✅ Done | REST API             |
| **MStock**          | `MStockAdapter`        | Provisioned      | ✅ Done | REST API             |
| **Pocketful**       | `PocketfulAdapter`     | Provisioned      | ✅ Done | REST API             |
| **Definedge**       | `DefinedgeAdapter`     | Provisioned      | ✅ Done | REST API             |
| **Dhan Sandbox**    | `DhanSandboxAdapter`   | Provisioned      | ✅ Done | Sandbox Environment  |

## Implementation Guidelines

### 1. Multi-Tenant Security

- **Credentials:** All adapters receive credentials via the constructor.
- **Isolation:** Access tokens are stored in the `user_brokers` table, indexed by `user_id`.
- **Encryption:** (Infrastructure Level) Ensure `db` encryption for sensitive fields in `user_brokers`.

### 2. Form Schema Standardization

- All sensitive fields (Secrets, Passwords, PINs, TOTP Secrets) MUST use `"type": "password"` in the `form_schema`.
- Field names in `form_schema` must exactly match the keys expected by the adapter's `credentials` object.

### 3. Error Handling

- Adapters must return structured `AuthResponse` with clear error messages.
- HTTP failures should be caught and transformed into user-friendly messages.

## Final Result

1. **Adapter Registry:** All 32 adapters registered in `BrokerFactory.ts`.
2. **Database Provisioning:** All `form_schema` JSONs inserted into the Neon `brokers` table.
3. **Consistency:** All XTS adapters standardized on `app_key`, `api_secret`, `app_key_market`, `api_secret_market`.
