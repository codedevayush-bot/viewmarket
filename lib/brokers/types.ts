// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BrokerCredentials = Record<string, any>;

export interface AuthResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
  message?: string;
  isOAuth?: boolean;
  redirectUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  brokerName: string;
  metadata?: Record<string, unknown>;
}

export interface FundsData {
  availableCash: number;
  utilizedMargin: number;
  totalMargin: number;
  metadata?: Record<string, unknown>;
}

export interface OrderPayload {
  symbol: string;
  exchange: string;
  transactionType: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT" | "SL" | "SL-M";
  quantity: number;
  price?: number;
  triggerPrice?: number;
  product: "MIS" | "CNC" | "NRML" | "BO" | "CO";
  metadata?: Record<string, unknown>;
}

export interface OrderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface IBrokerAdapter {
  /**
   * For API_KEY brokers (like Zerodha), authenticates and returns a session token.
   * `authPayload` can contain the daily request token or TOTP.
   */
  authenticate(authPayload: BrokerCredentials): Promise<AuthResponse>;

  /**
   * For OAUTH brokers, handles the redirect callback containing the authorization code.
   */
  handleOAuthCallback?(code: string): Promise<AuthResponse>;

  /**
   * For brokers that support persistent sessions with refresh tokens.
   */
  refreshToken?(currentRefreshToken: string): Promise<AuthResponse>;

  /**
   * Fetches user profile from the broker.
   */
  getProfile(): Promise<UserProfile>;

  /**
   * Fetches available funds/margin.
   */
  getFunds(): Promise<FundsData>;

  /**
   * Places a new order.
   */
  placeOrder(order: OrderPayload): Promise<OrderResponse>;
}
