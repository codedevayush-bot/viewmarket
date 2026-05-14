import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from '../types';
import { createHash } from 'crypto';

export class IIFLCapitalAdapter implements IBrokerAdapter {
  private apiKey: string;
  private apiSecret: string;
  private accessToken?: string;
  private baseUrl: string = 'https://api.iiflcapital.com';

  constructor(credentials: BrokerCredentials) {
    this.apiKey = credentials.api_key;
    this.apiSecret = credentials.api_secret;
    this.accessToken = credentials.access_token;
  }

  async authenticate(): Promise<AuthResponse> {
    // For IIFL Capital OAuth, we redirect to their login page
    const redirectUrl = `https://login.iiflcapital.com/?apiKey=${this.apiKey}`;
    return {
      success: true,
      isOAuth: true,
      redirectUrl,
    };
  }

  async handleOAuthCallback(code: string): Promise<AuthResponse> {
    try {
      // Note: IIFL Capital might require client_id along with code.
      // We assume it's part of the exchange or we use apiKey if applicable.
      // For this implementation, we follow the previous checksum logic but adapted for callback.

      const checksumStr = `${this.apiKey}${code}${this.apiSecret}`;
      const checksum = createHash('sha256').update(checksumStr).digest('hex');

      const response = await fetch(`${this.baseUrl}/getusersession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkSum: checksum, apiKey: this.apiKey, code }),
      });

      const data = await response.json();
      if (data.status?.toLowerCase() !== 'ok' || !data.userSession) {
        return {
          success: false,
          message: data.message || 'Authentication failed',
        };
      }

      return {
        success: true,
        accessToken: data.userSession,
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
    const data = await this.request('GET', '/profile');
    return {
      id: data.clientCode || '',
      name: data.clientName || 'IIFL User',
      brokerName: 'IIFL Capital',
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request('GET', '/limits');
    return {
      availableCash: parseFloat(data.availableMargin || 0),
      utilizedMargin: parseFloat(data.utilizedMargin || 0),
      totalMargin: parseFloat(data.totalMargin || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        symbol: order.symbol,
        exchange: order.exchange || 'NSE',
        transactionType: order.transactionType,
        orderType: order.orderType,
        quantity: order.quantity,
        price: order.price || 0,
        productType: order.product || 'MIS',
        duration: 'DAY',
      };

      const data = await this.request('POST', '/placeorder', payload);
      return {
        success: data.status?.toLowerCase() === 'ok',
        orderId: data.orderId,
        message: data.message || 'Order placed successfully',
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

    const data = await response.json();
    if (data.status?.toLowerCase() !== 'ok') {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }
}
