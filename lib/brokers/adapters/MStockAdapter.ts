import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from "../types";
import { generateTOTP } from "../utils/totp";

export class MStockAdapter implements IBrokerAdapter {
  private clientCode: string;
  private apiKey: string;
  private password: string;
  private totpSecret: string;
  private accessToken?: string;
  private baseUrl: string = "https://api.mstock.trade";

  constructor(config: BrokerCredentials) {
    this.clientCode = config.api_key;
    this.apiKey = config.api_secret;
    this.password = config.password;
    this.totpSecret = config.totp_secret;
    this.accessToken = config.access_token || config.accessToken;
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      const totpCode = generateTOTP(this.totpSecret);

      // Step 1: Login
      const loginRes = await fetch(
        `${this.baseUrl}/openapi/typeb/connect/login`,
        {
          method: "POST",
          headers: {
            "X-Mirae-Version": "1",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clientcode: this.clientCode,
            password: this.password,
            totp: totpCode,
            state: "",
          }),
        },
      );

      const loginData = await loginRes.json();
      if (!loginData.status || !loginData.data) {
        return { success: false, message: loginData.message || "Login failed" };
      }

      const refreshToken =
        loginData.data.refreshToken || loginData.data.jwtToken;

      // Step 2: Verify TOTP to get final token
      const verifyRes = await fetch(
        `${this.baseUrl}/openapi/typeb/session/verifytotp`,
        {
          method: "POST",
          headers: {
            "X-Mirae-Version": "1",
            "X-PrivateKey": this.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken,
            totp: totpCode,
          }),
        },
      );

      const verifyData = await verifyRes.json();
      if (!verifyData.status || !verifyData.data?.jwtToken) {
        return {
          success: false,
          message: verifyData.message || "TOTP verification failed",
        };
      }

      return {
        success: true,
        accessToken: verifyData.data.jwtToken,
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
    const response = await this.request("GET", "/openapi/typeb/user/profile");
    return {
      id: this.clientCode,
      name: response.data?.clientName || "mStock User",
      brokerName: "MStock",
    };
  }

  async getFunds(): Promise<FundsData> {
    const response = await this.request(
      "GET",
      "/openapi/typeb/limits/getlimits",
    );
    return {
      availableCash: parseFloat(response.data?.availableMargin || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(response.data?.availableMargin || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        tradingSymbol: order.symbol,
        exchange: order.exchange || "NSE",
        transactionType: order.transactionType,
        orderType: order.orderType,
        quantity: order.quantity.toString(),
        price: order.price?.toString() || "0",
        productType: order.product,
        validity: "DAY",
      };

      const response = await this.request(
        "POST",
        "/openapi/typeb/order/placeorder",
        payload,
      );
      return {
        success: response.status === true,
        orderId: response.data?.orderNumber,
        message: response.message,
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "X-Mirae-Version": "1",
        "X-PrivateKey": this.apiKey,
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!data.status) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }
}
