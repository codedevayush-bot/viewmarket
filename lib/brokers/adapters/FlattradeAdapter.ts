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

export class FlattradeAdapter implements IBrokerAdapter {
  private apiKey: string;
  private apiSecret: string;
  private accessToken?: string;

  constructor(credentials: BrokerCredentials) {
    this.apiKey = credentials.api_key;
    this.apiSecret = credentials.api_secret;
    this.accessToken = credentials.access_token;
  }

  async authenticate(authPayload?: BrokerCredentials): Promise<AuthResponse> {
    const code = authPayload?.code;
    if (!code) {
      return { success: false, message: "Request code required for Flattrade" };
    }

    try {
      // security_hash: SHA-256 hash of (api_key + request_token + api_secret)
      const hashInput = `${this.apiKey}${code}${this.apiSecret}`;
      const securityHash = createHash("sha256").update(hashInput).digest("hex");

      const response = await fetch(
        "https://authapi.flattrade.in/trade/apitoken",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: this.apiKey,
            request_code: code,
            api_secret: securityHash,
          }),
        },
      );

      const data = await response.json();
      if (data.stat !== "Ok" || !data.token) {
        return {
          success: false,
          message: data.emsg || "Authentication failed",
        };
      }

      return {
        success: true,
        accessToken: data.token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tokens usually valid for one session day
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.request("POST", "/trade/userdetails", {});
    return {
      id: response.actid || "",
      name: response.uname || "Flattrade User",
      brokerName: "Flattrade",
    };
  }

  async getFunds(): Promise<FundsData> {
    const response = await this.request("POST", "/trade/limits", {});
    return {
      availableCash: parseFloat(response.cash || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(response.cash || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        tsym: order.symbol,
        exch: order.exchange || "NSE",
        trantype: order.transactionType,
        prctyp: order.orderType,
        qty: order.quantity.toString(),
        prd: order.product,
        ret: "DAY",
        prc: order.price?.toString() || "0",
      };

      const response = await this.request("POST", "/trade/placeorder", payload);
      return {
        success: response.stat === "Ok",
        orderId: response.norenordno,
        message: response.emsg || response.stat,
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

    const response = await fetch(`https://authapi.flattrade.in${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        uid: this.apiKey, // Flattrade often uses client id / api key as uid
        susertoken: this.accessToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.stat !== "Ok") {
      throw new Error(data.emsg || "Request failed");
    }
    return data;
  }
}
