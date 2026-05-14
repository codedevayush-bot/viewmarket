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

export class ShoonyaAdapter implements IBrokerAdapter {
  private userId: string;
  private apiKey: string;
  private apiSecret: string;
  private accessToken?: string;
  private baseUrl: string = 'https://api.shoonya.com';

  constructor(credentials: BrokerCredentials) {
    this.userId = credentials.user_id;
    this.apiKey = credentials.api_key;
    this.apiSecret = credentials.api_secret;
    this.accessToken = credentials.access_token;
  }

  async authenticate(authPayload: BrokerCredentials): Promise<AuthResponse> {
    try {
      const code = authPayload.code;
      if (!code) {
        return {
          success: false,
          message: 'Auth code is required for Shoonya login',
        };
      }

      const checksumInput = `${this.apiKey}${this.apiSecret}${code}`;
      const checksum = crypto
        .createHash('sha256')
        .update(checksumInput)
        .digest('hex');

      const payload = {
        code: code,
        checksum: checksum,
      };

      const response = await fetch(
        `${this.baseUrl}/NorenWClientAPI/GenAcsTok`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: `jData=${JSON.stringify(payload)}`,
        }
      );

      const data = await response.json();

      if (data.stat === 'Ok' && data.access_token) {
        return {
          success: true,
          accessToken: data.access_token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
      } else {
        return {
          success: false,
          message: data.emsg || 'Authentication failed',
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
    const data = await this.request('POST', '/NorenWClientAPI/UserDetails', {});
    return {
      id: this.userId,
      name: data.uname || 'Shoonya User',
      brokerName: 'Shoonya',
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request('POST', '/NorenWClientAPI/Limits', {});
    return {
      availableCash: parseFloat(data.cash || 0),
      utilizedMargin: parseFloat(data.margin_used || 0),
      totalMargin:
        parseFloat(data.cash || 0) + parseFloat(data.margin_used || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        uid: this.userId,
        actid: this.userId,
        tsym: order.symbol,
        qty: order.quantity.toString(),
        prd: order.product === 'CNC' ? 'C' : 'M',
        trantype: order.transactionType === 'BUY' ? 'B' : 'S',
        prctyp: order.orderType === 'MARKET' ? 'MKT' : 'LMT',
        price: order.price?.toString() || '0',
        ret: 'DAY',
        exch: order.exchange || 'NSE',
      };

      const data = await this.request(
        'POST',
        '/NorenWClientAPI/PlaceOrder',
        payload
      );
      return {
        success: data.stat === 'Ok',
        orderId: data.norenordno,
        message: data.emsg,
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async request(
    method: string,
    endpoint: string,
    body: BrokerCredentials
  ) {
    if (!this.accessToken) throw new Error('No access token found.');

    const payload = {
      ...body,
      uid: this.userId,
      susertoken: this.accessToken,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'text/plain',
      },
      body: `jData=${JSON.stringify(payload)}`,
    });

    const data = await response.json();
    if (data.stat !== 'Ok') {
      throw new Error(data.emsg || 'Request failed');
    }
    return data;
  }
}
