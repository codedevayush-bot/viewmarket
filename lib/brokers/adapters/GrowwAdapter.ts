import crypto from 'crypto';
import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from '../types';

export class GrowwAdapter implements IBrokerAdapter {
  private api_key: string;
  private api_secret: string;
  private accessToken?: string;
  private baseUrl: string = 'https://api.groww.in';

  constructor(credentials: BrokerCredentials) {
    this.api_key = credentials.api_key;
    this.api_secret = credentials.api_secret;
    this.accessToken = credentials.access_token;
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const checksumInput = `${this.api_secret}${timestamp}`;
      const checksum = crypto
        .createHash('sha256')
        .update(checksumInput)
        .digest('hex');

      const response = await fetch(`${this.baseUrl}/v1/token/api/access`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key_type: 'approval',
          checksum: checksum,
          timestamp: timestamp,
        }),
      });

      const data = await response.json();

      if (data.token) {
        return {
          success: true,
          accessToken: data.token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to obtain access token from Groww',
        };
      }
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getProfile(): Promise<UserProfile> {
    // Groww API might have a profile endpoint, but using default if not specified
    return {
      id: 'GrowwUser',
      name: 'Groww User',
      brokerName: 'Groww',
    };
  }

  async getFunds(): Promise<FundsData> {
    const response = await this.request('GET', '/v1/accounts/funds');
    return {
      availableCash: parseFloat(response.available_margin || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(response.available_margin || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        order_type: order.orderType,
        transaction_type: order.transactionType,
        exchange: order.exchange || 'NSE',
        symbol: order.symbol,
        quantity: order.quantity,
        price: order.price || 0,
        product: order.product,
      };

      const response = await this.request('POST', '/v1/orders/place', payload);
      return {
        success: !!response.order_id,
        orderId: response.order_id,
        message:
          response.message ||
          (response.order_id ? 'Order placed successfully' : 'Order failed'),
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
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
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
