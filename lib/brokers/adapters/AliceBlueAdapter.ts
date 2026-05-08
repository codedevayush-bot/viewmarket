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

export class AliceBlueAdapter implements IBrokerAdapter {
  private userId: string;
  private apiKey: string;
  private apiSecret: string;
  private accessToken?: string;

  constructor(credentials: BrokerCredentials) {
    this.userId = credentials.client_id;
    this.apiKey = credentials.api_key;
    this.apiSecret = credentials.api_secret;
    this.accessToken = credentials.access_token;
  }

  async authenticate(authPayload?: BrokerCredentials): Promise<AuthResponse> {
    try {
      const code = authPayload?.code;
      if (!code) {
        return {
          success: false,
          message: "Auth code is required for Alice Blue login",
        };
      }

      const checksumInput = `${this.userId}${code}${this.apiSecret}`;
      const checksum = crypto
        .createHash("sha256")
        .update(checksumInput)
        .digest("hex");

      const response = await fetch(
        "https://ant.aliceblueonline.com/open-api/od/v1/vendor/getUserDetails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ checkSum: checksum }),
        },
      );

      const data = await response.json();

      if (data.stat === "Ok" && data.userSession) {
        return {
          success: true,
          accessToken: data.userSession,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
      } else {
        return {
          success: false,
          message: data.emsg || "Authentication failed",
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
    return {
      id: this.userId,
      name: "Alice Blue User",
      brokerName: "Alice Blue",
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request(
      "GET",
      "/open-api/v2/cash/getAvailableCash",
    );
    return {
      availableCash: parseFloat(data.availableCash || 0),
      utilizedMargin: parseFloat(data.utilizedMargin || 0),
      totalMargin: parseFloat(data.totalMargin || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        complexity: "regular",
        trading_symbol: order.symbol,
        quantity: order.quantity,
        transaction_type: order.transactionType,
        exchange: order.exchange || "NSE",
        order_type: order.orderType,
        price: order.price || 0,
        product: order.product,
        duration: "DAY",
      };

      const data = await this.request(
        "POST",
        "/open-api/v2/order/placeOrder",
        payload,
      );
      return {
        success: data.stat === "Ok",
        orderId: data.data?.oms_order_id,
        message: data.emsg,
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async request(method: string, endpoint: string, body?: unknown) {
    if (!this.accessToken) throw new Error("No access token found.");

    const response = await fetch(`https://ant.aliceblueonline.com${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (data.stat !== "Ok") {
      throw new Error(data.emsg || "Request failed");
    }
    return data;
  }
}
