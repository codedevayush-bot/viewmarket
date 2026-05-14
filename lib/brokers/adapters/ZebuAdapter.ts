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

export class ZebuAdapter implements IBrokerAdapter {
  private clientId: string;
  private secretKey: string;
  private accessToken?: string;
  private baseUrl: string = 'https://go.mynt.in';

  constructor(credentials: BrokerCredentials) {
    this.clientId = credentials.api_key;
    this.secretKey = credentials.api_secret;
    this.accessToken = credentials.access_token;
  }

  async authenticate(): Promise<AuthResponse> {
    const redirectUrl = `https://go.mynt.in/login/?apiKey=${this.clientId}`;
    return {
      success: true,
      isOAuth: true,
      redirectUrl,
    };
  }

  async handleOAuthCallback(code: string): Promise<AuthResponse> {
    try {
      const checksum = createHash('sha256')
        .update(`${this.clientId}${this.secretKey}${code}`)
        .digest('hex');

      const payload = {
        code,
        checksum,
      };

      const response = await fetch(
        `${this.baseUrl}/NorenWClientAPI/GenAcsTok`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: 'jData=' + JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (data.stat !== 'Ok' || !data.access_token) {
        return {
          success: false,
          message: data.emsg || 'Authentication failed',
        };
      }

      return {
        success: true,
        accessToken: data.access_token,
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
    const data = await this.request('POST', '/NorenWClientAPI/UserDetails', {});
    return {
      id: data.actid || '',
      name: data.uname || 'Zebu User',
      brokerName: 'Zebu',
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
        tsym: order.symbol,
        exch: order.exchange || 'NSE',
        trantype: order.transactionType === 'BUY' ? 'B' : 'S',
        prctyp: order.orderType === 'MARKET' ? 'MKT' : 'LMT',
        qty: order.quantity.toString(),
        prd: order.product === 'CNC' ? 'C' : 'M',
        ret: 'DAY',
        prc: order.price?.toString() || '0',
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'text/plain' },
      body:
        'jData=' +
        JSON.stringify({
          ...body,
          uid: this.clientId,
          susertoken: this.accessToken,
        }),
    });

    const data = await response.json();
    if (data.stat !== 'Ok') {
      throw new Error(data.emsg || 'Request failed');
    }
    return data;
  }
}
