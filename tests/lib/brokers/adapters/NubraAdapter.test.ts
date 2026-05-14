import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NubraAdapter } from '@/lib/brokers/adapters/NubraAdapter';
import { generateTOTP } from '@/lib/brokers/utils/totp';

vi.mock('@/lib/brokers/utils/totp', () => ({
  generateTOTP: vi.fn(() => '777888'),
}));

describe('NubraAdapter', () => {
  const mockConfig = {
    phone: '9876543210',
    mpin: '1234',
    totp_secret: 'NUBRASECRET',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should authenticate successfully using two steps', async () => {
    const mockTotpResponse = {
      auth_token: 'temp_token',
    };

    const mockPinResponse = {
      session_token: 'final_session_token',
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTotpResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockPinResponse,
      } as Response);

    const adapter = new NubraAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(generateTOTP).toHaveBeenCalledWith('NUBRASECRET');
    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('final_session_token');
  });

  it('should fetch profile successfully', async () => {
    const mockProfileResponse = {
      client_id: 'NUB123',
      full_name: 'Nubra Tester',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new NubraAdapter({
      ...mockConfig,
      access_token: 'valid_token',
    });
    const profile = await adapter.getProfile();

    expect(profile.name).toBe('Nubra Tester');
    expect(profile.id).toBe('NUB123');
  });

  it('should fetch funds successfully', async () => {
    const mockFundsResponse = {
      available_margin: '12000.25',
      utilized_margin: '2000.00',
      total_margin: '14000.25',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new NubraAdapter({
      ...mockConfig,
      access_token: 'valid_token',
    });
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(12000.25);
    expect(funds.utilizedMargin).toBe(2000);
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      order_id: 'NUB_ORD_202',
      message: 'Order successful',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new NubraAdapter({
      ...mockConfig,
      access_token: 'valid_token',
    });
    const result = await adapter.placeOrder({
      symbol: 'RELIANCE-EQ',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 5,
      product: 'MIS',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('NUB_ORD_202');
  });
});
