import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from '../types';

export class IIFLAdapter implements IBrokerAdapter {
  private appKey: string;
  private apiSecret: string;
  private appKeyMarket: string;
  private apiSecretMarket: string;
  private accessToken?: string;
  private feedToken?: string;
  private userId?: string;
  private baseUrl: string = 'https://ttblaze.iifl.com';

  constructor(credentials: BrokerCredentials) {
    this.appKey = credentials.app_key;
    this.apiSecret = credentials.api_secret;
    this.appKeyMarket = credentials.app_key_market;
    this.apiSecretMarket = credentials.api_secret_market;

    if (credentials.access_token && credentials.access_token.includes(':::')) {
      const [token, feedToken, userId] = credentials.access_token.split(':::');
      this.accessToken = token;
      this.feedToken = feedToken;
      this.userId = userId;
    }
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      // Step 1: Interactive Session
      const sessionRes = await fetch(
        `${this.baseUrl}/interactive/user/session`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appKey: this.appKey,
            secretKey: this.apiSecret,
            source: 'WebAPI',
          }),
        }
      );

      const sessionData = await sessionRes.json();
      if (sessionData.type !== 'success') {
        return {
          success: false,
          message: sessionData.message || 'Interactive login failed',
        };
      }
      const interactiveToken = sessionData.result.token;

      // Step 2: Market Data Session
      const marketRes = await fetch(
        `${this.baseUrl}/apimarketdata/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appKey: this.appKeyMarket,
            secretKey: this.apiSecretMarket,
            source: 'WebAPI',
          }),
        }
      );

      const marketData = await marketRes.json();
      if (marketData.type !== 'success') {
        return {
          success: false,
          message: marketData.description || 'Market data login failed',
        };
      }

      const feedToken = marketData.result.token;
      const userId = marketData.result.userID;

      return {
        success: true,
        accessToken: `${interactiveToken}:::${feedToken}:::${userId}`,
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
    return {
      id: this.userId || 'IIFLUser',
      name: 'IIFL User',
      brokerName: 'IIFL',
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request('GET', '/interactive/margin');
    return {
      availableCash: parseFloat(data.result?.[0]?.availableMargin || 0),
      utilizedMargin: parseFloat(data.result?.[0]?.utilizedMargin || 0),
      totalMargin: parseFloat(data.result?.[0]?.totalMargin || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        exchange: order.exchange || 'NSE',
        symbol: order.symbol,
        orderType: order.orderType,
        transactionType: order.transactionType,
        quantity: order.quantity,
        price: order.price || 0,
        product: order.product,
        validity: 'DAY',
        orderSide: order.transactionType === 'BUY' ? 'BUY' : 'SELL',
      };

      const data = await this.request('POST', '/interactive/orders', payload);
      return {
        success: data.type === 'success',
        orderId: data.result?.orderID,
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
    if (data.type !== 'success') {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }
}
