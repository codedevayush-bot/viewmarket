import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from "../types";

export class CompositeAdapter implements IBrokerAdapter {
  private interactiveApiKey: string;
  private interactiveApiSecret: string;
  private marketDataApiKey: string;
  private marketDataApiSecret: string;
  private baseUrl: string;
  private accessToken?: string;

  constructor(credentials: BrokerCredentials) {
    this.interactiveApiKey = credentials.interactive_api_key;
    this.interactiveApiSecret = credentials.interactive_api_secret;
    this.marketDataApiKey = credentials.market_data_api_key;
    this.marketDataApiSecret = credentials.market_data_api_secret;
    this.baseUrl = credentials.base_url || "https://composite.xts.com";
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
            appKey: this.interactiveApiKey,
            secretKey: this.interactiveApiSecret,
            source: "WebAPI",
          }),
        },
      );

      const interactiveData = await interactiveResponse.json();
      if (interactiveData.type !== "success") {
        return {
          success: false,
          message: interactiveData.description || "Interactive login failed",
        };
      }

      const interactiveToken = interactiveData.result.token;

      // 2. Authenticate Market Data
      const marketResponse = await fetch(
        `${this.baseUrl}/marketdata/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appKey: this.marketDataApiKey,
            secretKey: this.marketDataApiSecret,
            source: "WebAPI",
          }),
        },
      );

      const marketData = await marketResponse.json();
      if (marketData.type !== "success") {
        return {
          success: false,
          message: marketData.description || "Market data login failed",
        };
      }

      const marketToken = marketData.result.token;

      // Store combined tokens
      const combinedToken = `${interactiveToken}|${marketToken}`;

      return {
        success: true,
        accessToken: combinedToken,
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
    const data = await this.request("GET", "/interactive/user/profile");
    return {
      id: data.result.clientCode || "",
      name: data.result.clientName || "Composite User",
      brokerName: "CompositeEdge",
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request("GET", "/interactive/user/balance");
    const balance = data.result.balanceList?.[0] || {};
    return {
      availableCash: parseFloat(balance.limitMargin || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(balance.limitMargin || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        exchangeSegment: order.exchange || "NSECM",
        exchangeInstrumentID: order.symbol,
        productType: order.product,
        orderType: order.orderType,
        orderSide: order.transactionType,
        timeInForce: "DAY",
        disclosedQuantity: 0,
        orderQuantity: order.quantity,
        limitPrice: order.price || 0,
        stopPrice: 0,
        orderUniqueIdentifier: `VM-${Date.now()}`,
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

  private async request(method: string, path: string, body?: unknown) {
    if (!this.accessToken) throw new Error("No access token found.");
    const [interactiveToken] = this.accessToken.split("|");

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        authorization: interactiveToken,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (data.type !== "success") {
      throw new Error(data.description || "Request failed");
    }
    return data;
  }
}
