import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from "../types";

export class IBullsAdapter implements IBrokerAdapter {
  private interactiveAppKey: string;
  private interactiveSecretKey: string;
  private marketAppKey: string;
  private marketSecretKey: string;
  private accessToken?: string;
  private marketToken?: string;
  private userId?: string;
  private baseUrl: string = "https://xts.ibullssecurities.com";

  constructor(credentials: BrokerCredentials) {
    this.interactiveAppKey = credentials.interactive_app_key;
    this.interactiveSecretKey = credentials.interactive_secret_key;
    this.marketAppKey = credentials.market_app_key;
    this.marketSecretKey = credentials.market_secret_key;
    this.accessToken = credentials.access_token;
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      // 1. Authenticate Interactive
      const interactiveResponse = await fetch(
        `${this.baseUrl}/interactive/user/session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appKey: this.interactiveAppKey,
            secretKey: this.interactiveSecretKey,
            source: "WebAPI",
          }),
        },
      );

      const intData = await interactiveResponse.json();
      if (intData.type !== "success") {
        return {
          success: false,
          message: intData.description || "Interactive auth failed",
        };
      }

      this.accessToken = intData.result.token;

      // 2. Authenticate Market Data
      const marketResponse = await fetch(
        `${this.baseUrl}/apibinarymarketdata/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appKey: this.marketAppKey,
            secretKey: this.marketSecretKey,
            source: "WebAPI",
          }),
        },
      );

      const mktData = await marketResponse.json();
      if (mktData.type === "success") {
        this.marketToken = mktData.result.token;
        this.userId = mktData.result.userID;
      }

      return {
        success: true,
        accessToken: this.accessToken!,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getProfile(): Promise<UserProfile> {
    const data = await this.request("GET", "/interactive/user/profile", {});
    return {
      id: data.result.userId || "",
      name: data.result.userName || "I-Bulls User",
      brokerName: "IBulls",
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request("GET", "/interactive/user/balance", {});
    return {
      availableCash: parseFloat(data.result.balance || 0),
      utilizedMargin: 0, // IBulls API might not provide this in balance endpoint directly
      totalMargin: parseFloat(data.result.balance || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        exchangeSegment: order.exchange === "NSE" ? "NSECM" : order.exchange,
        exchangeInstrumentId: order.symbol,
        productType: order.product,
        orderType: order.orderType,
        orderSide: order.transactionType,
        orderQuantity: order.quantity,
        limitPrice: order.price || 0,
        stopPrice: 0,
        orderValidity: "DAY",
      };

      const data = await this.request("POST", "/interactive/orders", payload);
      return {
        success: data.type === "success",
        orderId: data.result.AppOrderID,
        message: data.description,
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async request(
    method: string,
    endpoint: string,
    body: BrokerCredentials,
  ) {
    if (!this.accessToken) throw new Error("No access token found.");

    const url = `${this.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        authorization: this.accessToken,
      },
    };

    if (method !== "GET") {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();
    if (data.type !== "success") {
      throw new Error(data.description || "Request failed");
    }
    return data;
  }
}
