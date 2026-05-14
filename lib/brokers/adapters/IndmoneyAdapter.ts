import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from '../types';

export class IndmoneyAdapter implements IBrokerAdapter {
  private apiKey: string;
  private accessToken?: string;
  private baseUrl: string = 'https://api.indstocks.com';

  constructor(credentials: BrokerCredentials) {
    this.apiKey = credentials.api_key;
    this.accessToken = credentials.access_token;
  }

  async authenticate(): Promise<AuthResponse> {
    // Indmoney uses a persistent token
    if (!this.accessToken) {
      return {
        success: false,
        message: 'Access token is required for Indmoney',
      };
    }

    return {
      success: true,
      accessToken: this.accessToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Assume 30 days
    };
  }

  async getProfile(): Promise<UserProfile> {
    const data = await this.request('GET', '/user/profile');
    return {
      id: data.data.client_id || '',
      name: data.data.full_name || 'Indmoney User',
      brokerName: 'Indmoney',
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request('GET', '/funds');
    return {
      availableCash: parseFloat(data.data.withdrawal_balance || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(data.data.withdrawal_balance || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        symbol: order.symbol,
        exchange: order.exchange || 'NSE',
        transaction_type: order.transactionType,
        order_type: order.orderType,
        quantity: order.quantity,
        price: order.price || 0,
        product: order.product,
        validity: 'DAY',
      };

      const data = await this.request('POST', '/orders', payload);
      return {
        success: data.status === 'success',
        orderId: data.data.order_id,
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
        Authorization: this.accessToken,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }
}
