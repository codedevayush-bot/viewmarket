import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from "../types";
import { createHash } from "crypto";
import { generateTOTP } from "../utils/totp";

export class FirstockAdapter implements IBrokerAdapter {
  private userId: string;
  private password: string;
  private totpSecret?: string;
  private apiKey: string;
  private vendorCode: string;
  private accessToken?: string;

  constructor(credentials: BrokerCredentials) {
    this.userId = credentials.client_id;
    this.password = credentials.password;
    this.totpSecret = credentials.totp_secret;
    this.apiKey = credentials.api_key;
    this.vendorCode = credentials.api_secret; // Mapped api_secret to vendorCode in schema
    this.accessToken = credentials.access_token;
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      const passwordHash = createHash("sha256")
        .update(this.password)
        .digest("hex");

      let totp = "";
      if (this.totpSecret) {
        totp = generateTOTP(this.totpSecret);
      }

      const payload = {
        userId: this.userId,
        password: passwordHash,
        TOTP: totp,
        vendorCode: this.vendorCode,
        apiKey: this.apiKey,
      };

      const response = await fetch("https://api.firstock.in/V1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message || "Authentication failed",
        };
      }

      const susertoken = data.data.susertoken || data.data.jKey;

      return {
        success: true,
        accessToken: susertoken,
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
    const response = await this.request("POST", "/V1/userDetails", {});
    return {
      id: this.userId,
      name: response.data.userName || "Firstock User",
      brokerName: "Firstock",
    };
  }

  async getFunds(): Promise<FundsData> {
    const response = await this.request("POST", "/V1/limits", {});
    return {
      availableCash: parseFloat(response.data.cash || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(response.data.cash || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        exchange: order.exchange || "NSE",
        tradingSymbol: order.symbol,
        transactionType: order.transactionType,
        quantity: order.quantity.toString(),
        price: order.price?.toString() || "0",
        orderType: order.orderType,
        product: order.product,
        retention: "DAY",
      };

      const response = await this.request("POST", "/V1/placeOrder", payload);
      return {
        success: response.status === "success",
        orderId: response.data.orderNumber,
        message: response.message,
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

    const response = await fetch(`https://api.firstock.in${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        userId: this.userId,
        jKey: this.accessToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== "success") {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }
}
