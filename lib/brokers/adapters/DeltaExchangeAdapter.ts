import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from '../types';
import { createHmac } from 'crypto';

export class DeltaExchangeAdapter implements IBrokerAdapter {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string = 'https://api.india.delta.exchange';

  constructor(credentials: BrokerCredentials) {
    this.apiKey = credentials.api_key;
    this.apiSecret = credentials.api_secret;
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      const response = await this.request('GET', '/v2/profile');
      if (response.success) {
        return {
          success: true,
          accessToken: this.apiKey, // Delta uses API Key directly
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Permanent until revoked
        };
      }
      return {
        success: false,
        message: response.message || 'Invalid API credentials',
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getProfile(): Promise<UserProfile> {
    const response = await this.request('GET', '/v2/profile');
    return {
      id: response.result?.id?.toString() || '',
      name: response.result?.email || 'Delta User',
      brokerName: 'Delta Exchange',
    };
  }

  async getFunds(): Promise<FundsData> {
    const response = await this.request('GET', '/v2/wallet/balances');
    const balance =
      response.result?.find((b: BrokerCredentials) => b.asset_symbol === 'USDT')
        ?.balance || 0;
    return {
      availableCash: parseFloat(balance),
      utilizedMargin: 0,
      totalMargin: parseFloat(balance),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    const payload = {
      product_id: parseInt((order.metadata?.brokerToken as string) || '0'),
      size: order.quantity,
      side: order.transactionType.toLowerCase(), // buy/sell
      order_type: order.orderType.toLowerCase(), // limit/market
      limit_price: order.price?.toString() || '0',
    };

    const response = await this.request('POST', '/v2/orders', payload);
    return {
      success: response.success,
      orderId: response.result?.id?.toString(),
      message:
        response.message || (response.success ? 'Order placed' : 'Failed'),
    };
  }

  private async request(
    method: string,
    endpoint: string,
    body?: BrokerCredentials
  ) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payloadStr = body ? JSON.stringify(body) : '';
    const message =
      method.toUpperCase() + timestamp + endpoint + '' + payloadStr;
    const signature = createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'api-key': this.apiKey,
        timestamp: timestamp,
        signature: signature,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    return await response.json();
  }
}
