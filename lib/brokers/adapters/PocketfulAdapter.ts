import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from '../types';

export class PocketfulAdapter implements IBrokerAdapter {
  private apiKey: string;
  private apiSecret: string;
  private accessToken?: string;
  private baseUrl: string = 'https://trade.pocketful.in';

  constructor(credentials: BrokerCredentials) {
    this.apiKey = credentials.api_key;
    this.apiSecret = credentials.api_secret;
    this.accessToken = credentials.access_token;
  }

  async authenticate(authPayload?: BrokerCredentials): Promise<AuthResponse> {
    try {
      const code = authPayload?.code;
      if (!code) {
        return {
          success: false,
          message: 'Auth code is required for Pocketful login',
        };
      }

      const credentials = Buffer.from(
        `${this.apiKey}:${this.apiSecret}`
      ).toString('base64');
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/pocketful`;

      const response = await fetch(`${this.baseUrl}/oauth2/token`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
        }),
      });

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
    const data = await this.request('GET', '/api/v1/user/trading_info');
    return {
      id: data.data?.client_id || '',
      name: data.data?.name || 'Pocketful User',
      brokerName: 'Pocketful',
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request('GET', '/api/v1/user/funds');
    return {
      availableCash: parseFloat(data.data?.available_cash || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(data.data?.available_cash || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        exchange: order.exchange || 'NSE',
        symbol: order.symbol,
        transaction_type: order.transactionType,
        order_type: order.orderType,
        quantity: order.quantity,
        price: order.price || 0,
        product: order.product,
        validity: 'DAY',
      };

      const data = await this.request('POST', '/api/v1/orders/place', payload);
      return {
        success: data.status === 'success',
        orderId: data.data?.order_id,
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
