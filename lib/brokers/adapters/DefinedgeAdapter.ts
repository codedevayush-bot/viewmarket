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

export class DefinedgeAdapter implements IBrokerAdapter {
  private apiToken: string;
  private apiSecret: string;
  private accessToken?: string;

  constructor(credentials: BrokerCredentials) {
    this.apiToken = credentials.api_key;
    this.apiSecret = credentials.api_secret;
    this.accessToken = credentials.access_token;
  }

  async authenticate(authPayload?: BrokerCredentials): Promise<AuthResponse> {
    try {
      const otp = authPayload?.otp;
      const otpToken = authPayload?.otpToken;

      if (!otp || !otpToken) {
        // Step 1: Trigger OTP
        const response = await fetch(
          `https://signin.definedgesecurities.com/auth/realms/debroking/dsbpkc/login/${this.apiToken}`,
          {
            method: "GET",
            headers: { api_secret: this.apiSecret },
          },
        );
        const data = await response.json();
        return {
          success: true,
          metadata: {
            requiresOtp: true,
            otpToken: data.otp_token,
          },
          message: "OTP sent successfully",
        };
      }

      // Step 2: Verify OTP
      const authString = `${otpToken}${otp}${this.apiSecret}`;
      const authCode = createHash("sha256").update(authString).digest("hex");

      const response = await fetch(
        "https://signin.definedgesecurities.com/auth/realms/debroking/dsbpkc/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp_token: otpToken, otp, ac: authCode }),
        },
      );

      const data = await response.json();
      if (data.stat !== "Ok") {
        return {
          success: false,
          message: data.emsg || "OTP verification failed",
        };
      }

      const sessionToken = `${data.api_session_key}:::${data.susertoken || ""}:::${this.apiToken}`;

      return {
        success: true,
        accessToken: sessionToken,
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
    const data = await this.request("POST", "/UserDetails", {});
    return {
      id: data.uid || "",
      name: data.uname || "Definedge User",
      brokerName: "Definedge",
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request("POST", "/Limits", {});
    return {
      availableCash: parseFloat(data.cash || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(data.cash || 0),
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

      const data = await this.request("POST", "/PlaceOrder", payload);
      return {
        success: data.stat === "Ok",
        orderId: data.norenordno,
        message: data.emsg || data.stat,
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

    const [, susertoken] = this.accessToken.split(":::");
    const baseUrl = "https://api.definedgesecurities.com/NorenWClientAPI";

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: { "Content-Type": "text/plain" },
      body:
        "jData=" +
        JSON.stringify({
          ...body,
          uid: this.apiToken,
          susertoken: susertoken,
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
