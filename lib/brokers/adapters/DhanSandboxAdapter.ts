import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from '../types';

export class DhanSandboxAdapter implements IBrokerAdapter {
  private clientId: string;
  private accessToken?: string;
  private baseUrl: string = 'https://api.dhan.co';

  constructor(credentials: BrokerCredentials) {
    this.clientId = credentials.client_id;
    this.accessToken = credentials.access_token || credentials.accessToken;
  }

  async authenticate(authPayload?: BrokerCredentials): Promise<AuthResponse> {
    try {
      if (authPayload?.accessToken) {
        this.accessToken = authPayload.accessToken;
      }

      if (!this.accessToken) {
        return {
          success: false,
          message: 'Access token is required for Dhan Sandbox',
        };
      }

      return {
        success: true,
        accessToken: this.accessToken,
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
    const data = await this.request('GET', '/v2/profile');
    return {
      id: this.clientId,
      name: data.dhanClientName || 'Dhan Sandbox User',
      brokerName: 'dhan_sandbox',
      metadata: data,
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request('GET', '/v2/fundlimit');
    return {
      availableCash: parseFloat(data.availableBalance || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(data.availableBalance || 0),
      metadata: data,
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    const payload = {
      dhanClientId: this.clientId,
      correlationId: `sandbox_${Date.now()}`,
      transactionType: order.transactionType,
      exchangeSegment: order.exchange === 'NSE' ? 'NSE_EQ' : 'BSE_EQ',
      productType: order.product === 'CNC' ? 'CNC' : 'INTRADAY',
      orderType: order.orderType,
      validity: 'DAY',
      tradingSymbol: order.symbol,
      securityId: '0',
      quantity: order.quantity,
      price: order.price || 0,
    };

    const data = await this.request('POST', '/v2/orders', payload);
    return {
      success: !!data.orderId,
      orderId: data.orderId,
      message: data.message,
    };
  }

  private async request(method: string, endpoint: string, body?: unknown) {
    if (!this.accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'access-token': this.accessToken,
        'client-id': this.clientId,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.errorMessage || data.message || 'Request failed');
    }
    return data;
  }
}
