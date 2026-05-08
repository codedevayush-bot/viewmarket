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

export class KotakNeoAdapter implements IBrokerAdapter {
  private ucc: string;
  private apiKey: string;
  private apiSecret: string;
  private mobileNumber: string;
  private mpin: string;
  private totpSecret: string;
  private tradingToken?: string;
  private tradingSid?: string;
  private baseUrl: string = "https://cis.kotaksecurities.com";

  constructor(credentials: BrokerCredentials) {
    this.ucc = credentials.ucc;
    this.apiKey = credentials.api_key;
    this.apiSecret = credentials.api_secret;
    this.mobileNumber = credentials.mobile_number;
    this.mpin = credentials.mpin;
    this.totpSecret = credentials.totp_secret;

    if (credentials.access_token && credentials.access_token.includes(":::")) {
      const [token, sid, url] = credentials.access_token.split(":::");
      this.tradingToken = token;
      this.tradingSid = sid;
      if (url) this.baseUrl = url;
    }
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      const totp = generateTOTP(this.totpSecret);

      // Step 1: Login with TOTP
      const loginRes = await fetch(
        "https://mis.kotaksecurities.com/login/1.0/tradeApiLogin",
        {
          method: "POST",
          headers: {
            Authorization: this.apiKey,
            "neo-fin-key": "neotradeapi",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mobileNumber: this.mobileNumber.startsWith("+91")
              ? this.mobileNumber
              : `+91${this.mobileNumber}`,
            ucc: this.ucc,
            totp: totp,
          }),
        },
      );

      const loginData = await loginRes.json();
      if (!loginData.data || loginData.data.status !== "success") {
        return {
          success: false,
          message: loginData.errMsg || loginData.message || "TOTP Login failed",
        };
      }

      const viewToken = loginData.data.token;
      const viewSid = loginData.data.sid;

      // Step 2: Validate with MPIN
      const validateRes = await fetch(
        "https://mis.kotaksecurities.com/login/1.0/tradeApiValidate",
        {
          method: "POST",
          headers: {
            Authorization: this.apiKey,
            "neo-fin-key": "neotradeapi",
            sid: viewSid,
            Auth: viewToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mpin: this.mpin }),
        },
      );

      const validateData = await validateRes.json();
      if (!validateData.data || validateData.data.status !== "success") {
        return {
          success: false,
          message:
            validateData.errMsg ||
            validateData.message ||
            "MPIN validation failed",
        };
      }

      const tradingToken = validateData.data.token;
      const tradingSid = validateData.data.sid;
      const baseUrl = validateData.data.baseUrl || this.baseUrl;

      return {
        success: true,
        accessToken: `${tradingToken}:::${tradingSid}:::${baseUrl}`,
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
    // Kotak Neo profile API is limited, returning UCC
    return {
      id: this.ucc,
      name: "Kotak Neo User",
      brokerName: "Kotak Neo",
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request("GET", "/neoapi/1.0/funds/limits");
    return {
      availableCash: parseFloat(data.data?.availableMargin || 0),
      utilizedMargin: parseFloat(data.data?.marginUsed || 0),
      totalMargin: parseFloat(data.data?.totalMargin || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        variety: "regular",
        tradingsymbol: order.symbol,
        symboltoken: order.metadata?.brokerToken || order.symbol,
        transactiontype: order.transactionType,
        exchange: order.exchange || "NSE",
        ordertype: order.orderType,
        product: order.product === "CNC" ? "DELIVERY" : order.product,
        quantity: order.quantity.toString(),
        price: order.price?.toString() || "0",
        validity: "DAY",
      };

      const data = await this.request(
        "POST",
        "/neoapi/1.0/orders/place",
        payload,
      );
      return {
        success: data.status === "success" || data.stat === "Ok",
        orderId: data.data?.orderId,
        message: data.message || data.emsg,
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async request(method: string, endpoint: string, body?: unknown) {
    if (!this.tradingToken || !this.tradingSid)
      throw new Error("No trading token/sid found.");

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        Authorization: this.apiKey,
        Auth: this.tradingToken,
        sid: this.tradingSid,
        "neo-fin-key": "neotradeapi",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    // Some endpoints return 'stat', some return 'status'
    if (data.status === "error" || data.stat === "Not_Ok") {
      throw new Error(data.message || data.emsg || "Request failed");
    }
    return data;
  }
}
