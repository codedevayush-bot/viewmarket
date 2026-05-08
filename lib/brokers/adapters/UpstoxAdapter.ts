import {
  AuthResponse,
  FundsData,
  IBrokerAdapter,
  BrokerCredentials,
  OrderPayload,
  OrderResponse,
  UserProfile,
} from "../types";
import crypto from "crypto";

export class UpstoxAdapter implements IBrokerAdapter {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private accessToken?: string;

  constructor(credentials: BrokerCredentials, accessToken?: string) {
    this.clientId = credentials.client_id;
    this.clientSecret = credentials.client_secret;
    this.redirectUri = credentials.redirect_uri;
    this.accessToken = accessToken;

    if (!this.clientId || !this.clientSecret || !this.redirectUri) {
      throw new Error(
        "Upstox requires client_id, client_secret, and redirect_uri in credentials",
      );
    }
  }

  async authenticate(): Promise<AuthResponse> {
    const state = crypto.randomUUID();
    const redirectUrl = `https://api.upstox.com/v2/login/authorization/dialog?response_type=code&client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}`;

    return {
      success: true,
      isOAuth: true,
      redirectUrl,
      message: "Redirect to OAuth URL",
    };
  }

  async handleOAuthCallback(code: string): Promise<AuthResponse> {
    try {
      const params = new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: "authorization_code",
      });

      const response = await fetch(
        "https://api.upstox.com/v2/login/authorization/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: params,
        },
      );

      const data = await response.json();

      if (response.ok && data.access_token) {
        this.accessToken = data.access_token;
        return {
          success: true,
          accessToken: data.access_token,
          // Upstox tokens typically expire after some time
          metadata: {
            userId: data.user_id,
            brokerageId: data.brokerage_id,
          },
        };
      }

      return {
        success: false,
        message:
          data.errors?.[0]?.message || "Failed to authenticate with Upstox",
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getProfile(): Promise<UserProfile> {
    if (!this.accessToken) throw new Error("Not authenticated");

    const response = await fetch("https://api.upstox.com/v2/user/profile", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.errors?.[0]?.message || "Failed to fetch profile");

    return {
      id: data.data.user_id,
      name: data.data.user_name,
      email: data.data.email,
      brokerName: "upstox",
      metadata: data.data,
    };
  }

  async getFunds(): Promise<FundsData> {
    if (!this.accessToken) throw new Error("Not authenticated");

    const response = await fetch(
      "https://api.upstox.com/v2/user/get-funds-and-margin?segment=SEC",
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.errors?.[0]?.message || "Failed to fetch funds");

    return {
      availableCash: data.data.equity.available_margin,
      utilizedMargin: data.data.equity.used_margin,
      totalMargin:
        data.data.equity.available_margin + data.data.equity.used_margin,
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    if (!this.accessToken) throw new Error("Not authenticated");

    const response = await fetch("https://api.upstox.com/v2/order/place", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({
        quantity: order.quantity,
        product: order.product === "MIS" ? "I" : "D", // Simplified mapping
        validity: "DAY",
        price: order.price || 0,
        tag: "viewmarket",
        instrument_token: order.symbol, // Upstox expects their specific instrument_token
        order_type: order.orderType,
        transaction_type: order.transactionType,
        disclosed_quantity: 0,
        trigger_price: order.triggerPrice || 0,
        is_amo: false,
      }),
    });

    const data = await response.json();
    if (response.ok && data.data && data.data.order_id) {
      return {
        success: true,
        orderId: data.data.order_id,
        message: "Order placed successfully",
      };
    }

    return {
      success: false,
      message: data.errors?.[0]?.message || "Failed to place order",
    };
  }
}
