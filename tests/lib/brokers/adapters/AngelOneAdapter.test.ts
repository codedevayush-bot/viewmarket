import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AngelOneAdapter } from '@/lib/brokers/adapters/AngelOneAdapter';
import { generateTOTP } from '@/lib/brokers/utils/totp';

vi.mock('@/lib/brokers/utils/totp', () => ({
  generateTOTP: vi.fn(() => '123456'),
}));

describe('AngelOneAdapter', () => {
  const mockConfig = {
    api_key: 'test_key',
    client_code: 'CLIENT123',
    broker_pin: '1111',
    totp_secret: 'BASE32SECRET',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should authenticate successfully', async () => {
    const mockAuthResponse = {
      status: true,
      data: {
        jwtToken: 'mock_jwt_token',
        refreshToken: 'mock_refresh_token',
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockAuthResponse,
    } as Response);

    const adapter = new AngelOneAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(generateTOTP).toHaveBeenCalledWith('BASE32SECRET');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/loginByPassword'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'X-PrivateKey': 'test_key',
        }),
      })
    );
    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('mock_jwt_token');
  });

  it('should fetch profile successfully', async () => {
    const mockProfileResponse = {
      status: true,
      data: {
        clientcode: 'CLIENT123',
        name: 'Angel User',
        email: 'user@example.com',
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new AngelOneAdapter({
      ...mockConfig,
      access_token: 'mock_token',
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe('CLIENT123');
    expect(profile.name).toBe('Angel User');
  });

  it('should fetch funds successfully', async () => {
    const mockFundsResponse = {
      status: true,
      data: {
        availablecash: '10000.50',
        utilizedmargin: '2000.00',
        net: '12000.50',
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new AngelOneAdapter({
      ...mockConfig,
      access_token: 'mock_token',
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(10000.5);
    expect(funds.utilizedMargin).toBe(2000);
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      status: true,
      data: {
        orderid: 'ANGEL_ORD_123',
      },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new AngelOneAdapter({
      ...mockConfig,
      access_token: 'mock_token',
    });
    const result = await adapter.placeOrder({
      symbol: 'INFY-EQ',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 5,
      product: 'MIS',
      metadata: { brokerToken: '1234' },
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('ANGEL_ORD_123');
  });
});
