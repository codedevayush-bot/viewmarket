import {
  IBrokerAdapter,
  BrokerCredentials,
  AuthResponse,
  UserProfile,
  FundsData,
  OrderPayload,
  OrderResponse,
} from '../types';
import { generateTOTP } from '../utils/totp';

export class AngelOneAdapter implements IBrokerAdapter {
  private apiKey: string;
  private clientCode: string;
  private brokerPin: string;
  private totpSecret: string;
  private accessToken?: string;
  private baseUrl: string = 'https://apiconnect.angelone.in';

  constructor(config: BrokerCredentials) {
    this.apiKey = config.api_key;
    this.clientCode = config.client_code;
    this.brokerPin = config.broker_pin;
    this.totpSecret = config.totp_secret;
    this.accessToken = config.access_token || config.accessToken;
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      const totp = generateTOTP(this.totpSecret);

      const response = await fetch(
        `${this.baseUrl}/rest/auth/angelbroking/user/v1/loginByPassword`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-UserType': 'USER',
            'X-SourceID': 'WEB',
            'X-PrivateKey': this.apiKey,
            'X-ClientLocalIP': '127.0.0.1',
            'X-MACAddress': '00:00:00:00:00:00',
          },
          body: JSON.stringify({
            clientcode: this.clientCode,
            password: this.brokerPin,
            totp: totp,
          }),
        }
      );

      const data = await response.json();

      if (data.status && data.data && data.data.jwtToken) {
        return {
          success: true,
          accessToken: data.data.jwtToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };
      } else {
        return {
          success: false,
          message: data.message || 'Authentication failed',
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
    const data = await this.request(
      'GET',
      '/rest/auth/angelbroking/user/v1/getProfile'
    );
    return {
      id: data.data.clientcode,
      name: data.data.name,
      email: data.data.email,
      brokerName: 'Angel One',
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request(
      'GET',
      '/rest/auth/angelbroking/user/v1/getRMS'
    );
    return {
      availableCash: parseFloat(data.data.availablecash || 0),
      utilizedMargin: parseFloat(data.data.utilizedmargin || 0),
      totalMargin: parseFloat(data.data.net || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        variety: 'NORMAL',
        tradingsymbol: order.symbol,
        symboltoken: order.metadata?.brokerToken || order.symbol,
        transactiontype: order.transactionType,
        exchange: order.exchange || 'NSE',
        ordertype: order.orderType,
        producttype: order.product === 'CNC' ? 'DELIVERY' : order.product,
        duration: 'DAY',
        price: order.price?.toString() || '0',
        quantity: order.quantity.toString(),
      };

      const data = await this.request(
        'POST',
        '/rest/auth/angelbroking/order/v1/placeOrder',
        payload
      );
      return {
        success: data.status,
        orderId: data.data?.scriptOrderNo || data.data?.orderid,
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
    if (!this.accessToken)
      throw new Error('No access token found. Please authenticate first.');

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-PrivateKey': this.apiKey,
        'X-ClientLocalIP': '127.0.0.1',
        'X-MACAddress': '00:00:00:00:00:00',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (!data.status) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }
}
