import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from '../types';

export class PaytmMoneyAdapter implements IBrokerAdapter {
  private api_key: string;
  private api_secret: string;
  private accessToken?: string;

  constructor(credentials: BrokerCredentials) {
    this.api_key = credentials.api_key;
    this.api_secret = credentials.api_secret;
    this.accessToken = credentials.access_token || credentials.accessToken;
  }

  async authenticate(authPayload?: BrokerCredentials): Promise<AuthResponse> {
    if (authPayload?.code) {
      return this.handleOAuthCallback(authPayload.code);
    }

    if (this.accessToken) {
      return { success: true, accessToken: this.accessToken };
    }

    // Return redirect URL for login
    return {
      success: true,
      isOAuth: true,
      redirectUrl: `https://login.paytmmoney.com/merchant-login?apiKey=${this.api_key}&state=viewmarket`,
    };
  }

  async handleOAuthCallback(code: string): Promise<AuthResponse> {
    try {
      const response = await fetch(
        'https://developer.paytmmoney.com/accounts/v2/gettoken',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: this.api_key,
            api_secret_key: this.api_secret,
            request_token: code,
          }),
        }
      );

      const data = await response.json();

      if (data.access_token) {
        this.accessToken = data.access_token;
        return {
          success: true,
          accessToken: data.access_token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
      } else {
        const errorMsg = data.errors?.[0]?.message || 'Authentication failed';
        return {
          success: false,
          message: errorMsg,
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
    const response = await this.request('GET', '/accounts/v1/user/details');
    return {
      id: response.client_id || 'PaytmUser',
      name: response.user_name || 'Paytm User',
      brokerName: 'paytm',
      metadata: response,
    };
  }

  async getFunds(): Promise<FundsData> {
    const response = await this.request('GET', '/accounts/v1/funds/details');
    return {
      availableCash: parseFloat(response.equity?.available_balance || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(response.equity?.available_balance || 0),
      metadata: response,
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    const payload = {
      txn_type: order.transactionType,
      exchange: order.exchange || 'NSE',
      segment: 'EQUITY',
      product: order.product || 'CNC',
      security_id: order.symbol, // Paytm uses security_id, mapping usually required
      quantity: order.quantity,
      price: order.price || 0,
      order_type: order.orderType,
      validity: 'DAY',
    };

    const response = await this.request(
      'POST',
      '/orders/v1/place/regular',
      payload
    );
    return {
      success: !!response.order_id,
      orderId: response.order_id,
      message: response.message,
    };
  }

  private async request(method: string, endpoint: string, body?: unknown) {
    if (!this.accessToken) throw new Error('Not authenticated');

    const response = await fetch(
      `https://developer.paytmmoney.com${endpoint}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-jwt-token': this.accessToken,
        },
        body: body ? JSON.stringify(body) : undefined,
      }
    );

    const data = await response.json();
    if (response.status !== 200) {
      throw new Error(data.errors?.[0]?.message || 'Request failed');
    }
    return data;
  }
}
