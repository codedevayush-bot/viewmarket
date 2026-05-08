import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from "../types";
import { createHmac } from "crypto";

export class DeltaAdapter implements IBrokerAdapter {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string = "https://api.india.delta.exchange";

  constructor(credentials: BrokerCredentials) {
    this.apiKey = credentials.api_key;
    this.apiSecret = credentials.api_secret;
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      // Verify credentials by calling /v2/profile
      await this.request("GET", "/v2/profile", "");
      return {
        success: true,
        accessToken: "PER_REQUEST_HMAC", // Delta uses HMAC per request, so no fixed token
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getProfile(): Promise<UserProfile> {
    const data = await this.request("GET", "/v2/profile", "");
    return {
      id: data.result.id.toString(),
      name: data.result.email || "Delta User",
      brokerName: "Delta Exchange",
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request("GET", "/v2/wallet/balances", "");
    // Delta returns an array of balances for different assets
    const usdtBalance = data.result.find(
      (b: BrokerCredentials) => b.asset_symbol === "USDT",
    );
    const balance = parseFloat(usdtBalance?.balance || 0);
    return {
      availableCash: balance,
      utilizedMargin: 0,
      totalMargin: balance,
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        product_id: parseInt(order.symbol), // Delta uses product_id (numeric)
        size: order.quantity,
        side: order.transactionType.toLowerCase() === "buy" ? "buy" : "sell",
        order_type:
          order.orderType.toLowerCase() === "limit"
            ? "limit_order"
            : "market_order",
        limit_price: order.price?.toString(),
      };

      const data = await this.request(
        "POST",
        "/v2/orders",
        JSON.stringify(payload),
      );
      return {
        success: !!data.result.id,
        orderId: data.result.id.toString(),
        message: "Order placed successfully",
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async request(method: string, path: string, body: string = "") {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const query_string = ""; // Simplification: assuming no query string for these calls
    const signatureData =
      method.toUpperCase() + timestamp + path + query_string + body;

    const signature = createHmac("sha256", this.apiSecret)
      .update(signatureData)
      .digest("hex");

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "api-key": this.apiKey,
        timestamp: timestamp,
        signature: signature,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: method === "GET" ? undefined : body,
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error?.message || data.error || "Request failed");
    }
    return data;
  }
}
