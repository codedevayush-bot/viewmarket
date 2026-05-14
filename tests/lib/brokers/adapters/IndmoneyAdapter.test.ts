import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IndmoneyAdapter } from '@/lib/brokers/adapters/IndmoneyAdapter';

describe('IndmoneyAdapter', () => {
  const mockConfig = {
    api_key: 'ind_key',
    access_token: 'ind_persistent_token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should authenticate successfully with persistent token', async () => {
    const adapter = new IndmoneyAdapter(mockConfig);
    const result = await adapter.authenticate();

    expect(result.success).toBe(true);
    expect(result.accessToken).toBe('ind_persistent_token');
  });

  it('should fetch profile successfully', async () => {
    const mockProfileResponse = {
      status: 'success',
      data: { client_id: 'IND123', full_name: 'Ind Tester' },
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProfileResponse,
    } as Response);

    const adapter = new IndmoneyAdapter(mockConfig);
    const profile = await adapter.getProfile();

    expect(profile.id).toBe('IND123');
    expect(profile.name).toBe('Ind Tester');
  });

  it('should place order successfully', async () => {
    const mockOrderResponse = {
      status: 'success',
      data: { order_id: 'IND_ORD_666' },
      message: 'Order Placed',
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockOrderResponse,
    } as Response);

    const adapter = new IndmoneyAdapter(mockConfig);
    const result = await adapter.placeOrder({
      symbol: 'TCS',
      exchange: 'NSE',
      transactionType: 'BUY',
      orderType: 'MARKET',
      quantity: 1,
      product: 'CNC',
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe('IND_ORD_666');
  });
});
