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

export class ZerodhaAdapter implements IBrokerAdapter {
  private apiKey: string;
  private apiSecret: string;
  private accessToken?: string;

  constructor(config: BrokerCredentials, accessToken?: string) {
    this.apiKey = config.api_key;
    this.apiSecret = config.api_secret;
    this.accessToken = accessToken || config.access_token || config.accessToken;

    if (!this.apiKey || !this.apiSecret) {
      throw new Error("Zerodha requires api_key and api_secret in credentials");
    }
  }

  /**
   * Authenticate with Zerodha.
   * Zerodha's flow involves getting a request_token from the frontend login
   * and exchanging it for an access_token.
   *
   * @param authPayload Requires { requestToken: string }
   */
  async authenticate(authPayload: BrokerCredentials): Promise<AuthResponse> {
    const { requestToken } = authPayload;
    if (!requestToken) {
      return { success: false, message: "Missing request token" };
    }

    try {
      // Calculate checksum: sha256(api_key + request_token + api_secret)
      const checksumInput = `${this.apiKey}${requestToken}${this.apiSecret}`;
      const checksum = crypto
        .createHash("sha256")
        .update(checksumInput)
        .digest("hex");

      const response = await fetch("https://api.kite.trade/session/token", {
        method: "POST",
        headers: {
          "X-Kite-Version": "3",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          api_key: this.apiKey,
          request_token: requestToken,
          checksum: checksum,
        }),
      });

      const data = await response.json();

      if (response.ok && data.data && data.data.access_token) {
        this.accessToken = data.data.access_token;
        return {
          success: true,
          accessToken: data.data.access_token,
          // Zerodha access tokens expire daily, they don't have refresh tokens
          metadata: { publicToken: data.data.public_token },
        };
      }

      return {
        success: false,
        message: data.message || "Failed to authenticate with Zerodha",
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

    const response = await fetch("https://api.kite.trade/user/profile", {
      headers: {
        "X-Kite-Version": "3",
        Authorization: `token ${this.apiKey}:${this.accessToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Failed to fetch profile");

    return {
      id: data.data.user_id,
      name: data.data.user_name,
      email: data.data.email,
      brokerName: "zerodha",
      metadata: { broker: data.data.broker },
    };
  }

  async getFunds(): Promise<FundsData> {
    if (!this.accessToken) throw new Error("Not authenticated");

    const response = await fetch("https://api.kite.trade/user/margins", {
      headers: {
        "X-Kite-Version": "3",
        Authorization: `token ${this.apiKey}:${this.accessToken}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch funds");

    const equity = data.data.equity;
    return {
      availableCash: equity.available.cash,
      utilizedMargin:
        equity.utilized.m2m_realised + equity.utilized.m2m_unrealised,
      totalMargin: equity.net,
      metadata: equity,
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    if (!this.accessToken) throw new Error("Not authenticated");

    // Map unified order types to Zerodha specific parameters
    const params = new URLSearchParams({
      tradingsymbol: order.symbol,
      exchange: order.exchange,
      transaction_type: order.transactionType,
      order_type: order.orderType,
      quantity: order.quantity.toString(),
      product: order.product,
      validity: "DAY",
    });

    if (order.price) params.append("price", order.price.toString());
    if (order.triggerPrice)
      params.append("trigger_price", order.triggerPrice.toString());

    const response = await fetch("https://api.kite.trade/orders/regular", {
      method: "POST",
      headers: {
        "X-Kite-Version": "3",
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `token ${this.apiKey}:${this.accessToken}`,
      },
      body: params,
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
      message: data.message || "Failed to place order",
    };
  }
}
