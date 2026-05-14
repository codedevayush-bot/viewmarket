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

export class FivePaisaAdapter implements IBrokerAdapter {
  private api_key: string;
  private api_secret: string;
  private user_id: string;
  private client_id: string;
  private email: string;
  private pin: string;
  private totp_secret: string;
  private accessToken?: string;

  constructor(credentials: BrokerCredentials) {
    this.api_key = credentials.api_key;
    this.api_secret = credentials.api_secret;
    this.user_id = credentials.user_id;
    this.client_id = credentials.client_id;
    this.email = credentials.email;
    this.pin = credentials.pin;
    this.totp_secret = credentials.totp_secret;
    this.accessToken = credentials.access_token;
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      const totp = generateTOTP(this.totp_secret);

      // Step 1: TOTP Login
      const totpRes = await fetch(
        'https://Openapi.5paisa.com/VendorsAPI/Service1.svc/TOTPLogin',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            head: { Key: this.api_key },
            body: { Email_ID: this.email, TOTP: totp, PIN: this.pin },
          }),
        }
      );

      const totpData = await totpRes.json();
      const requestToken = totpData.body?.RequestToken;

      if (!requestToken) {
        return {
          success: false,
          message: totpData.body?.Message || 'TOTP Login failed',
        };
      }

      // Step 2: Exchange for Access Token
      const tokenRes = await fetch(
        'https://Openapi.5paisa.com/VendorsAPI/Service1.svc/GetAccessToken',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            head: { Key: this.api_key },
            body: {
              RequestToken: requestToken,
              EncryKey: this.api_secret,
              UserId: this.user_id,
            },
          }),
        }
      );

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.body?.AccessToken;

      if (!accessToken) {
        return {
          success: false,
          message: tokenData.body?.Message || 'Failed to obtain access token',
        };
      }

      return {
        success: true,
        accessToken: accessToken,
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
      id: this.client_id,
      name: '5Paisa User',
      brokerName: '5Paisa',
    };
  }

  async getFunds(): Promise<FundsData> {
    const response = await this.request(
      'POST',
      '/VendorsAPI/Service1.svc/Margin',
      {}
    );
    return {
      availableCash: parseFloat(response.body?.AvailableMargin || 0),
      utilizedMargin: 0,
      totalMargin: parseFloat(response.body?.AvailableMargin || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        Exchange: order.exchange || 'N',
        ExchangeType: 'C', // Cash
        Price: order.price || 0,
        Qty: order.quantity,
        OrderType: order.transactionType === 'BUY' ? 'B' : 'S',
        RemoteOrderID: `VM-${Date.now()}`,
        ScripCode: (order.metadata?.brokerToken as string) || '',
        TradeType: order.orderType === 'MARKET' ? 'M' : 'L',
        IsIntraday: order.product === 'MIS',
      };

      const response = await this.request(
        'POST',
        '/VendorsAPI/Service1.svc/PlaceOrder',
        payload
      );
      return {
        success: response.body?.Status === 0,
        orderId: response.body?.BrokerOrderID,
        message: response.body?.Message,
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

    const response = await fetch(`https://Openapi.5paisa.com${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        head: { Key: this.api_key, Token: this.accessToken },
        body: body,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
}
