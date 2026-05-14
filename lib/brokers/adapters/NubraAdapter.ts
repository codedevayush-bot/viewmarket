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

export class NubraAdapter implements IBrokerAdapter {
  private phone: string;
  private mpin: string;
  private totpSecret?: string;
  private useUat: boolean;
  private accessToken?: string;
  private deviceId: string = 'VIEW_MARKET_WEB';

  constructor(credentials: BrokerCredentials) {
    this.phone = credentials.phone;
    this.mpin = credentials.mpin;
    this.totpSecret = credentials.totp_secret;
    this.useUat = credentials.use_uat === true;
    this.accessToken = credentials.access_token;
  }

  private getBaseUrl() {
    return this.useUat ? 'https://uatapi.nubra.io' : 'https://api.nubra.io';
  }

  async authenticate(authPayload?: BrokerCredentials): Promise<AuthResponse> {
    try {
      const baseUrl = this.getBaseUrl();
      const otp =
        authPayload?.code ||
        (this.totpSecret ? generateTOTP(this.totpSecret) : null);

      if (!otp) {
        return {
          success: true,
          message: 'Please enter your TOTP from authenticator app',
        };
      }

      // Step 1: Login via TOTP
      const totpResponse = await fetch(`${baseUrl}/totp/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': this.deviceId,
        },
        body: JSON.stringify({ phone: this.phone, totp: parseInt(otp) }),
      });

      const totpData = await totpResponse.json();
      const tempAuthToken = totpData.auth_token;

      if (!tempAuthToken) {
        return {
          success: false,
          message: totpData.message || 'TOTP login failed',
        };
      }

      // Step 2: Verify PIN
      const pinResponse = await fetch(`${baseUrl}/verifypin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-device-id': this.deviceId,
          Authorization: `Bearer ${tempAuthToken}`,
        },
        body: JSON.stringify({ pin: this.mpin }),
      });

      const pinData = await pinResponse.json();
      if (!pinData.session_token) {
        return {
          success: false,
          message: pinData.message || 'PIN verification failed',
        };
      }

      return {
        success: true,
        accessToken: pinData.session_token,
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
    const data = await this.request('GET', '/user/profile');
    return {
      id: data.client_id || '',
      name: data.full_name || 'Nubra User',
      brokerName: 'Nubra',
    };
  }

  async getFunds(): Promise<FundsData> {
    const data = await this.request('GET', '/user/limits');
    return {
      availableCash: parseFloat(data.available_margin || 0),
      utilizedMargin: parseFloat(data.utilized_margin || 0),
      totalMargin: parseFloat(data.total_margin || 0),
    };
  }

  async placeOrder(order: OrderPayload): Promise<OrderResponse> {
    try {
      const payload = {
        symbol: order.symbol,
        exchange: order.exchange || 'NSE',
        transaction_type: order.transactionType,
        order_type: order.orderType,
        quantity: order.quantity,
        price: order.price || 0,
        product: order.product,
        validity: 'DAY',
      };

      const data = await this.request('POST', '/order/place', payload);
      return {
        success: true,
        orderId: data.order_id,
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

    const response = await fetch(`${this.getBaseUrl()}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-device-id': this.deviceId,
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    if (response.status !== 200) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }
}
