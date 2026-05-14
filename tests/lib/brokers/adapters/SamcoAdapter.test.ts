import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SamcoAdapter } from '@/lib/brokers/adapters/SamcoAdapter';

describe('SamcoAdapter', () => {
  const mockConfig = {
    api_key: 'SAM123',
    password: 'sam_password',
    secret_api_key: 'sam_sec',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should authenticate successfully', async () => {
    const mockAccessTokenResponse = {
      status: 'Success',
      accessToken: 'sam_access_token',
    };

    const mockLoginResponse = {
      status: 'Success',
      sessionToken: 'sam_session_token',
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockAccessTokenResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockLoginResponse,
      } as Response);

    const adapter = new SamcoAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('sam_session_token');
  });

  it('should fetch profile successfully', async () => {
    const mockProfileResponse = {
      status: 'Success',
      clientName: 'Samco Tester',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new SamcoAdapter({
      ...mockConfig,
      access_token: 'valid_token',
    });
    const profile = await adapter.getProfile();

    expect(profile.id).toBe('SAM123');
    expect(profile.name).toBe('Samco Tester');
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      status: 'Success',
      orderNumber: 'SAM_ORD_1313',
      statusMessage: 'Success',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new SamcoAdapter({
      ...mockConfig,
      access_token: 'valid_token',
    });
    const result = await adapter.placeOrder({
      symbol: 'ITC',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 1,
      product: 'MIS',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('SAM_ORD_1313');
  });
});
