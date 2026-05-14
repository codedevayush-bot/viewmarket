import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from '../types';

export class SamcoAdapter implements IBrokerAdapter {
  private clientId: string;
  private password?: string;
  private secretApiKey?: string;
  private accessToken?: string;
  private baseUrl: string = 'https://tradeapi.samco.in';

  constructor(credentials: BrokerCredentials) {
    this.clientId = credentials.client_id || credentials.api_key;
    this.password = credentials.password;
    this.secretApiKey = credentials.secret_api_key || credentials.api_secret;
    this.accessToken = credentials.access_token;
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      if (!this.password || !this.secretApiKey) {
        return {
          success: false,
          message: 'Password and Secret API Key are required',
        };
      }

      // 1. Generate access token (valid 24 hours)
      const tokenResponse = await fetch(`${this.baseUrl}/accessToken/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          uid: this.clientId,
          secretApiKey: this.secretApiKey,
        }),
      });

      const tokenData = await tokenResponse.json();
      if (tokenData.status !== 'Success' || !tokenData.accessToken) {
        return {
          success: false,
          message: tokenData.statusMessage || 'Failed to generate access token',
        };
      }

      const accessToken = tokenData.accessToken;

      // 2. Login with access token
      const loginResponse = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          userId: this.clientId,
          password: this.password,
          accessToken: accessToken,
        }),
      });

      const loginData = await loginResponse.json();
      if (loginData.status !== 'Success' || !loginData.sessionToken) {
        return {
          success: false,
          message: loginData.statusMessage || 'Login failed',
        };
      }

      return {
        success: true,
        accessToken: loginData.sessionToken,
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
    const data = await this.request('GET', '/user/profile');
    return {
      id: this.clientId,
      name: data.clientName || 'SAMCO User',
      brokerName: 'Samco',
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request('GET', '/user/balance');
    return {
      availableCash: parseFloat(data.equityLimit || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(data.equityLimit || 0),
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
        productType: order.product,
        orderValidity: 'DAY',
      };

      const data = await this.request('POST', '/order/placeOrder', payload);
      return {
        success: data.status === 'Success',
        orderId: data.orderNumber,
        message: data.statusMessage,
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
        Accept: 'application/json',
        'x-session-token': this.accessToken,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'Success') {
      throw new Error(data.statusMessage || 'Request failed');
    }
    return data;
  }
}
