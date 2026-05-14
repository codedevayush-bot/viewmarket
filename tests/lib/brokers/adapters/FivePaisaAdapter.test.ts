import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FivePaisaAdapter } from '@/lib/brokers/adapters/FivePaisaAdapter';

vi.mock('@/lib/brokers/utils/totp', () => ({
  generateTOTP: vi.fn(() => '112233'),
}));

describe('FivePaisaAdapter', () => {
  const mockConfig = {
    api_key: '5P_KEY',
    api_secret: '5P_SEC',
    user_id: '5P_USER',
    client_id: '5P123',
    email: 'test@5paisa.com',
    pin: '1234',
    totp_secret: '5P_TOTP_SEC',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should authenticate successfully', async () => {
    const mockTotpLoginResponse = {
      body: { RequestToken: '5p_req_token' },
    };

    const mockAccessTokenResponse = {
      body: { AccessToken: '5p_access_token' },
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTotpLoginResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessTokenResponse,
      } as Response);

    const adapter = new FivePaisaAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('5p_access_token');
  });

  it('should fetch profile successfully', async () => {
    const adapter = new FivePaisaAdapter({
      ...mockConfig,
      access_token: 'valid_token',
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe('5P123');
    expect(profile.name).toBe('5Paisa User');
  });

  it('should fetch funds successfully', async () => {
    const mockFundsResponse = {
      body: { AvailableMargin: '5000.50' },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new FivePaisaAdapter({
      ...mockConfig,
      access_token: 'valid_token',
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(5000.5);
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      body: { Status: 0, BrokerOrderID: '5P_ORD_1212', Message: 'Success' },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new FivePaisaAdapter({
      ...mockConfig,
      access_token: 'valid_token',
    });
    const result = await adapter.placeOrder({
      symbol: 'RELIANCE',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'LIMIT',
      quantity: 1,
      price: 2500,
      product: 'CNC',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('5P_ORD_1212');
  });
});
