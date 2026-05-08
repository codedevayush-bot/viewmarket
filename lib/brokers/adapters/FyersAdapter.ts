import crypto from "crypto";
import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from "../types";

export class FyersAdapter implements IBrokerAdapter {
  private apiKey: string;
  private apiSecret: string;
  private accessToken?: string;

  constructor(credentials: BrokerCredentials) {
    this.apiKey = credentials.api_key;
    this.apiSecret = credentials.api_secret;
    this.accessToken = credentials.access_token || credentials.accessToken;
  }

  async authenticate(authPayload: BrokerCredentials): Promise<AuthResponse> {
    try {
      const code =
        typeof authPayload === "string" ? authPayload : authPayload.code;
      if (!code) {
        return {
          success: false,
          message: "Auth code is required for Fyers login",
        };
      }

      const appIdHash = crypto
        .createHash("sha256")
        .update(`${this.apiKey}:${this.apiSecret}`)
        .digest("hex");

      const response = await fetch(
        "https://api-t1.fyers.in/api/v3/validate-authcode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            grant_type: "authorization_code",
            appIdHash: appIdHash,
            code: code,
          }),
        },
      );

      const data = await response.json();

      if (data.s === "ok" && data.access_token) {
        this.accessToken = data.access_token;
        return {
          success: true,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
      } else {
        return {
          success: false,
          message: data.message || "Authentication failed",
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.request("GET", "/api/v3/profile");
    return {
      id: response.data.fy_id,
      name: response.data.name,
      email: response.data.email_id,
      brokerName: "fyers",
      metadata: response.data,
    };
  }

  async getFunds(): Promise<FundsData> {
    const response = await this.request("GET", "/api/v3/funds");
    const equity =
      response.fund_limit.find((f: BrokerCredentials) => f.id === 10)?.title ===
      "Total Balance"
        ? response.fund_limit.find((f: BrokerCredentials) => f.id === 10)
            .equityAmount
        : response.fund_limit[0]?.equityAmount || 0;

    return {
      availableCash: parseFloat(equity),
      utilizedMargin: 0, // Fyers response parsing for utilized margin can be complex, defaulting to 0 for now
      totalMargin: parseFloat(equity),
      metadata: response,
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    const payload = {
      symbol: order.symbol,
      qty: order.quantity,
      type: order.orderType === "MARKET" ? 2 : 1,
      side: order.transactionType === "BUY" ? 1 : -1,
      productType: order.product === "CNC" ? "CNC" : "INTRADAY",
      limitPrice: order.price || 0,
      stopPrice: order.triggerPrice || 0,
      validity: "DAY",
      variety: "REGULAR",
      disclosedQty: 0,
    };

    const response = await this.request("POST", "/api/v3/orders/sync", payload);
    return {
      success: response.s === "ok",
      orderId: response.id,
      message: response.message,
    };
  }

  private async request(method: string, endpoint: string, body?: unknown) {
    if (!this.accessToken) throw new Error("Not authenticated");

    const response = await fetch(`https://api-t1.fyers.in${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `${this.apiKey}:${this.accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (data.s !== "ok") {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }
}
