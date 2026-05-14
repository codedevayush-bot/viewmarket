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

export class TradejiniAdapter implements IBrokerAdapter {
  private apiSecret: string;
  private password?: string;
  private totpSecret?: string;
  private accessToken?: string;
  private clientId: string;
  private baseUrl: string = 'https://api.tradejini.com/v2';

  constructor(credentials: BrokerCredentials) {
    this.apiSecret = credentials.api_secret;
    this.password = credentials.password;
    this.totpSecret = credentials.totp_secret;
    this.accessToken = credentials.access_token;
    this.clientId = credentials.client_id || '';
  }

  async authenticate(authPayload?: BrokerCredentials): Promise<AuthResponse> {
    try {
      const totpCode =
        authPayload?.totpCode ||
        (this.totpSecret ? generateTOTP(this.totpSecret) : null);
      if (!totpCode) {
        return { success: false, message: 'TOTP code or secret is required' };
      }
      if (!this.password) {
        return {
          success: false,
          message: 'Trading password is required for 2FA login',
        };
      }

      const response = await fetch(
        `${this.baseUrl}/api-gw/oauth/individual-token-v2`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiSecret}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            password: this.password,
            twoFa: totpCode,
            twoFaTyp: 'totp',
          }),
        }
      );

      const data = await response.json();
      if (!response.ok || !data.access_token) {
        return {
          success: false,
          message: data.message || 'Authentication failed',
        };
      }

      return {
        success: true,
        accessToken: data.access_token,
        expiresAt: new Date(
          Date.now() + (data.expires_in || 24 * 60 * 60) * 1000
        ),
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getProfile(): Promise<UserProfile> {
    const data = await this.request('GET', '/api-gw/user/profile');
    return {
      id: data.clientCode || this.clientId,
      name: data.clientName || 'Tradejini User',
      brokerName: 'Tradejini',
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request('GET', '/api-gw/user/limits');
    return {
      availableCash: parseFloat(data.availableMargin || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(data.availableMargin || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        exchange: order.exchange || 'NSE',
        symbol: order.symbol,
        transactionType: order.transactionType,
        orderType: order.orderType,
        quantity: order.quantity,
        price: order.price || 0,
        product: order.product,
        validity: 'DAY',
      };

      const data = await this.request('POST', '/api-gw/orders', payload);
      return {
        success: !!data.orderId,
        orderId: data.orderId,
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  }
}
