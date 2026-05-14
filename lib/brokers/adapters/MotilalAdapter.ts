import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from '../types';
import { generateTOTP } from '../utils/totp';
import { createHash } from 'crypto';

export class MotilalAdapter implements IBrokerAdapter {
  private apiKey: string;
  private userId: string;
  private password?: string;
  private dob?: string;
  private totpSecret?: string;
  private accessToken?: string;
  private baseUrl: string = 'https://openapi.motilaloswal.com/rest';

  constructor(credentials: BrokerCredentials) {
    this.apiKey = credentials.api_key;
    this.userId = credentials.user_id;
    this.password = credentials.password;
    this.dob = credentials.dob;
    this.totpSecret = credentials.totp_secret;
    this.accessToken = credentials.access_token;
  }

  async authenticate(authPayload?: BrokerCredentials): Promise<AuthResponse> {
    try {
      const totpCode =
        authPayload?.code ||
        (this.totpSecret ? generateTOTP(this.totpSecret) : null);
      if (!this.password || !this.dob) {
        return {
          success: false,
          message: 'Password and Date of Birth (2FA) are required',
        };
      }

      const passwordHash = createHash('sha256')
        .update(`${this.password}${this.apiKey}`)
        .digest('hex');

      const payload: Record<string, string | number | boolean> = {
        userid: this.userId,
        password: passwordHash,
        '2FA': this.dob,
      };

      if (totpCode) {
        payload.totp = totpCode;
      }

      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'MOSL/V.1.1.0',
        ApiKey: this.apiKey,
        ClientLocalIp: '127.0.0.1',
        ClientPublicIp: '127.0.0.1',
        MacAddress: '00:00:00:00:00:00',
        SourceId: 'WEB',
        vendorinfo: this.userId,
        osname: 'Windows',
        osversion: '10.0',
        devicemodel: 'PC',
        manufacturer: 'Generic',
        productname: 'ViewMarket',
        productversion: '1.0.0',
      };

      const response = await fetch(`${this.baseUrl}/login/v3/authdirectapi`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.status !== 'SUCCESS' || !data.AuthToken) {
        return {
          success: false,
          message: data.message || 'Authentication failed',
        };
      }

      return {
        success: true,
        accessToken: data.AuthToken,
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
    const data = await this.request('GET', '/user/v1/profile');
    return {
      id: this.userId,
      name: data.ClientName || 'Motilal User',
      brokerName: 'Motilal Oswal',
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request('GET', '/user/v1/limits');
    return {
      availableCash: parseFloat(data.AvailableMargin || 0),
      utilizedMargin: parseFloat(data.UtilizedMargin || 0),
      totalMargin: parseFloat(data.TotalMargin || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        Exchange: order.exchange || 'NSE',
        Symbol: order.symbol,
        TransactionType: order.transactionType,
        OrderType: order.orderType,
        Quantity: order.quantity,
        Price: order.price || 0,
        ProductType: order.product === 'CNC' ? 'DELIVERY' : order.product,
        OrderDuration: 'DAY',
      };

      const data = await this.request('POST', '/order/v1/placeorder', payload);
      return {
        success: data.status === 'SUCCESS',
        orderId: data.OrderId,
        message: data.message,
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async request(method: string, endpoint: string, body?: unknown) {
    if (!this.accessToken) throw new Error('No access token found.');

    const headers = {
      'Content-Type': 'application/json',
      AuthToken: this.accessToken,
      ApiKey: this.apiKey,
      SourceId: 'WEB',
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (data.status !== 'SUCCESS') {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }
}
