import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DhanAdapter } from '@/lib/brokers/adapters/DhanAdapter';

describe('DhanAdapter', () => {
  const mockConfig = {
    client_id: 'test_client_id',
    access_token: 'test_token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should authenticate successfully', async () => {
    const adapter = new DhanAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('test_token');
  });

  it('should fetch profile successfully', async () => {
    const mockProfileResponse = {
      dhanClientName: 'Dhan User',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new DhanAdapter(mockConfig);
    const profile = await adapter.getProfile();

    expect(profile.name).toBe('Dhan User');
    expect(profile.brokerName).toBe('dhan');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v2/profile'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'access-token': 'test_token',
        }),
      })
    );
  });

  it('should fetch funds successfully', async () => {
    const mockFundsResponse = {
      availableBalance: '5000.75',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockFundsResponse,
    } as Response);

    const adapter = new DhanAdapter(mockConfig);
    const funds = await adapter.getFunds();

    expect(funds.availableCash).toBe(5000.75);
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      orderId: 'DHAN_ORDER_123',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new DhanAdapter(mockConfig);
    const result = await adapter.placeOrder({
      symbol: 'RELIANCE',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 5,
      product: 'CNC',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('DHAN_ORDER_123');
  });
});
